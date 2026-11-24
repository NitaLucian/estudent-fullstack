import { Injectable } from '@nestjs/common';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { FiltreRaportDto } from './dto/filtre-raport.dto.js';
import { LocClasament, NumarNote, PromovabilitateDisciplina } from './raport.entity.js';

// Un câmp CSV: între ghilimele dacă conține separatorul, ghilimele sau rând nou
function campCsv(valoare: string | number | null): string {
  const text = valoare === null ? '' : String(valoare);
  return /[;"\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

@Injectable()
export class RapoarteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
  ) {}

  // 1. Distribuția notelor: câte note de 4, de 5 ... de 10 (GROUP BY valoare)
  async distributie(f: FiltreRaportDto): Promise<NumarNote[]> {
    const anUniversitarId = await this.ani.idSauCurent(f.anUniversitarId);
    const grupuri = await this.prisma.nota.groupBy({
      by: ['valoare'],
      where: {
        inscriere: { anUniversitarId },
        disciplina: { specializareId: f.specializareId, anStudiuId: f.anStudiuId },
      },
      _count: { _all: true },
      orderBy: { valoare: 'asc' },
    });
    return grupuri.map((g) => ({ valoare: g.valoare, numar: g._count._all }));
  }

  // 2. Promovabilitatea pe discipline: două agregări (toate notele / notele ≥ 5),
  //    apoi denumirile disciplinelor. Cele mai „grele” discipline primele.
  async promovabilitate(f: FiltreRaportDto): Promise<PromovabilitateDisciplina[]> {
    const anUniversitarId = await this.ani.idSauCurent(f.anUniversitarId);
    const where: Prisma.NotaWhereInput = {
      inscriere: { anUniversitarId },
      disciplina: { specializareId: f.specializareId, anStudiuId: f.anStudiuId },
    };
    const [toate, trecute] = await Promise.all([
      this.prisma.nota.groupBy({ by: ['disciplinaId'], where, _count: { _all: true }, _avg: { valoare: true } }),
      this.prisma.nota.groupBy({ by: ['disciplinaId'], where: { ...where, valoare: { gte: 5 } }, _count: { _all: true } }),
    ]);
    const promovati = new Map(trecute.map((t) => [t.disciplinaId, t._count._all]));
    const discipline = await this.prisma.disciplina.findMany({
      where: { id: { in: toate.map((t) => t.disciplinaId) } },
      select: { id: true, cod: true, denumire: true },
    });
    const dupaId = new Map(discipline.map((d) => [d.id, d]));
    return toate
      .map((t) => {
        const p = promovati.get(t.disciplinaId) ?? 0;
        const d = dupaId.get(t.disciplinaId)!;
        return {
          disciplinaId: d.id,
          cod: d.cod,
          denumire: d.denumire,
          numarNote: t._count._all,
          medie: Math.round((t._avg.valoare ?? 0) * 100) / 100,
          promovati: p,
          procent: Math.round((p / t._count._all) * 1000) / 10,
        };
      })
      .sort((a, b) => a.procent - b.procent || a.cod.localeCompare(b.cod));
  }

  // 3. Clasamentul: SQL scris de noi, peste view-ul v_medii_studenti, cu funcția
  //    fereastră RANK(). Filtrele opționale se compun cu Prisma.sql: valorile
  //    rămân PARAMETRI ai interogării ($1, $2 ...), nu text lipit în SQL.
  async clasament(f: FiltreRaportDto): Promise<LocClasament[]> {
    const anUniversitarId = await this.ani.idSauCurent(f.anUniversitarId);
    const filtre = [Prisma.sql`v.an_universitar_id = ${anUniversitarId}`];
    if (f.specializareId) filtre.push(Prisma.sql`v.specializare_id = ${f.specializareId}`);
    if (f.anStudiuId) filtre.push(Prisma.sql`v.an_studiu_id = ${f.anStudiuId}`);

    return this.prisma.$queryRaw<LocClasament[]>`
      SELECT
        RANK() OVER (PARTITION BY v.specializare_id, v.an_studiu_id
                     ORDER BY v.medie_ponderata DESC NULLS LAST)::int AS "loc",
        s.id            AS "studentId",
        s.nr_matricol   AS "nrMatricol",
        s.nume          AS "nume",
        s.prenume       AS "prenume",
        g.cod           AS "grupa",
        sp.cod          AS "specializare",
        a.numar::int    AS "an",
        v.numar_note    AS "numarNote",
        v.medie_aritmetica AS "medieAritmetica",
        v.medie_ponderata  AS "mediePonderata",
        v.credite_obtinute AS "crediteObtinute",
        v.restante         AS "restante"
      FROM v_medii_studenti AS v
      JOIN studenti AS s      ON s.id = v.student_id
      JOIN grupe AS g         ON g.id = v.grupa_id
      JOIN specializari AS sp ON sp.id = v.specializare_id
      JOIN ani_studiu AS a    ON a.id = v.an_studiu_id
      WHERE ${Prisma.join(filtre, ' AND ')}
      ORDER BY sp.cod, a.numar, "loc", s.nume, s.prenume`;
  }

  // 4. Grupele cu studenții lor, în format CSV (se deschide în Excel / LibreOffice)
  async grupeCsv(f: FiltreRaportDto): Promise<string> {
    const anUniversitarId = await this.ani.idSauCurent(f.anUniversitarId);
    const inscrieri = await this.prisma.inscriere.findMany({
      where: { anUniversitarId, grupa: { specializareId: f.specializareId, anStudiuId: f.anStudiuId } },
      include: {
        student: true,
        grupa: { include: { specializare: true, anStudiu: true } },
      },
      orderBy: [{ grupa: { cod: 'asc' } }, { student: { nume: 'asc' } }, { student: { prenume: 'asc' } }],
    });
    const antet = ['Grupa', 'Specializare', 'An', 'Nr. matricol', 'Nume', 'Prenume', 'Email'];
    const randuri = inscrieri.map((i) => [
      i.grupa.cod, i.grupa.specializare.cod, i.grupa.anStudiu.numar,
      i.student.nrMatricol, i.student.nume, i.student.prenume, i.student.email,
    ]);
    // „;” ca separator (Excel în română) și BOM la început, ca diacriticele să fie citite corect
    const BOM = String.fromCharCode(0xfeff);
    return BOM + [antet, ...randuri].map((r) => r.map(campCsv).join(';')).join('\r\n');
  }
}
