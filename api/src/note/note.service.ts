import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import type { UtilizatorJwt } from '../auth/auth.decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StudentiService } from '../studenti/studenti.service.js';
import { SeteazaNotaDto } from './dto/seteaza-nota.dto.js';
import { Catalog, DisciplinaCatalog, MedieAn, NotaScurta, SituatieScolara } from './nota.entity.js';

const selectNota = { id: true, valoare: true, data: true, modificatLa: true } as const;
const selectDisciplina = {
  id: true, cod: true, denumire: true, credite: true, semestru: true,
  specializare: { select: { cod: true } },
  anStudiu: { select: { numar: true } },
} as const;

type DisciplinaBd = {
  id: number; cod: string; denumire: string; credite: number; semestru: number;
  specializare: { cod: string }; anStudiu: { numar: number };
};
const disciplinaPentruClient = (d: DisciplinaBd): DisciplinaCatalog => ({
  id: d.id, cod: d.cod, denumire: d.denumire, credite: d.credite, semestru: d.semestru,
  specializare: d.specializare.cod, an: d.anStudiu.numar,
});

// rotunjire la două zecimale
const rotunjeste = (x: number) => Math.round(x * 100) / 100;

@Injectable()
export class NoteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
    private readonly studenti: StudentiService,
  ) {}

  // Regula de business: un profesor lucrează doar cu catalogul disciplinelor pe care
  // le predă în anul universitar curent. Administratorul are acces la toate.
  private async verificaDreptul(disciplinaId: number, u: UtilizatorJwt) {
    const disciplina = await this.prisma.disciplina.findUnique({ where: { id: disciplinaId }, select: selectDisciplina });
    if (!disciplina) throw new NotFoundException(`Disciplina ${disciplinaId} nu există`);
    if (u.rol === 'ADMIN') return disciplina;
    const preda = await this.prisma.predare.count({
      where: { disciplinaId, profesorId: u.profesorId ?? -1, anUniversitar: { curent: true } },
    });
    if (!preda) throw new ForbiddenException('Nu predați această disciplină în anul curent');
    return disciplina;
  }

  // studenții care urmează disciplina: înscriși anul acesta în grupe de aceeași specializare și același an
  private async inscrieriPentru(disciplinaId: number) {
    const d = await this.prisma.disciplina.findUniqueOrThrow({ where: { id: disciplinaId } });
    return {
      anUniversitar: { curent: true },
      grupa: { specializareId: d.specializareId, anStudiuId: d.anStudiuId },
    };
  }

  async catalog(disciplinaId: number, u: UtilizatorJwt): Promise<Catalog> {
    const disciplina = await this.verificaDreptul(disciplinaId, u);
    const an = await this.ani.curent();
    const inscrieri = await this.prisma.inscriere.findMany({
      where: await this.inscrieriPentru(disciplinaId),
      include: {
        student: { select: { id: true, nrMatricol: true, nume: true, prenume: true } },
        grupa: { select: { cod: true } },
        note: { where: { disciplinaId }, select: selectNota },
      },
      orderBy: [{ grupa: { cod: 'asc' } }, { student: { nume: 'asc' } }, { student: { prenume: 'asc' } }],
    });
    return {
      disciplina: disciplinaPentruClient(disciplina),
      anUniversitar: an.cod,
      randuri: inscrieri.map((i) => ({
        inscriereId: i.id,
        grupa: i.grupa.cod,
        student: i.student,
        nota: i.note[0] ?? null,
      })),
    };
  }

  // Adaugă sau modifică o notă. Nota și înregistrarea din istoric se scriu în aceeași tranzacție.
  async seteaza(disciplinaId: number, inscriereId: number, date: SeteazaNotaDto, u: UtilizatorJwt): Promise<NotaScurta> {
    await this.verificaDreptul(disciplinaId, u);
    const urmeaza = await this.prisma.inscriere.count({
      where: { id: inscriereId, ...(await this.inscrieriPentru(disciplinaId)) },
    });
    if (!urmeaza) throw new BadRequestException('Studentul nu urmează această disciplină în anul curent');

    const data = date.data ? new Date(date.data) : new Date();
    return this.prisma.$transaction(async (tx) => {
      const veche = await tx.nota.findUnique({ where: { inscriereId_disciplinaId: { inscriereId, disciplinaId } } });
      const nota = await tx.nota.upsert({
        where: { inscriereId_disciplinaId: { inscriereId, disciplinaId } },
        update: { valoare: date.valoare, data, modificatDeId: u.id },
        create: { inscriereId, disciplinaId, valoare: date.valoare, data, modificatDeId: u.id },
        select: selectNota,
      });
      if (veche?.valoare !== date.valoare) {
        await tx.istoricNota.create({
          data: { inscriereId, disciplinaId, valoareVeche: veche?.valoare ?? null, valoareNoua: date.valoare, utilizatorId: u.id },
        });
      }
      return nota;
    });
  }

  async sterge(disciplinaId: number, inscriereId: number, u: UtilizatorJwt) {
    await this.verificaDreptul(disciplinaId, u);
    await this.prisma.$transaction(async (tx) => {
      const veche = await tx.nota.findUnique({ where: { inscriereId_disciplinaId: { inscriereId, disciplinaId } } });
      if (!veche) throw new NotFoundException('Studentul nu are notă la această disciplină');
      await tx.nota.delete({ where: { id: veche.id } });
      await tx.istoricNota.create({
        data: { inscriereId, disciplinaId, valoareVeche: veche.valoare, valoareNoua: null, utilizatorId: u.id },
      });
    });
  }

  // Situația școlară: notele din toți anii și mediile fiecărui an universitar.
  async situatie(studentId: number, u: UtilizatorJwt): Promise<SituatieScolara> {
    const student = await this.studenti.findOneVerificat(studentId, u); // 404 / 403
    const note = await this.prisma.nota.findMany({
      where: { inscriere: { studentId } },
      include: { disciplina: { select: selectDisciplina }, inscriere: { select: { anUniversitar: true } } },
      orderBy: [{ inscriere: { anUniversitar: { dataInceput: 'desc' } } }, { disciplina: { semestru: 'asc' } }, { disciplina: { cod: 'asc' } }],
    });
    const lista = note.map((n) => ({
      id: n.id,
      valoare: n.valoare,
      data: n.data,
      anUniversitar: n.inscriere.anUniversitar.cod,
      disciplina: disciplinaPentruClient(n.disciplina),
    }));

    // mediile: grupăm notele după anul universitar
    const peAni = new Map<string, typeof lista>();
    for (const n of lista) peAni.set(n.anUniversitar, [...(peAni.get(n.anUniversitar) ?? []), n]);
    const medii: MedieAn[] = [...peAni.entries()].map(([anUniversitar, ale]) => {
      const crediteTotale = ale.reduce((s, n) => s + n.disciplina.credite, 0);
      return {
        anUniversitar,
        numarNote: ale.length,
        medieAritmetica: rotunjeste(ale.reduce((s, n) => s + n.valoare, 0) / ale.length),
        mediePonderata: rotunjeste(ale.reduce((s, n) => s + n.valoare * n.disciplina.credite, 0) / crediteTotale),
        crediteObtinute: ale.filter((n) => n.valoare >= 5).reduce((s, n) => s + n.disciplina.credite, 0),
        crediteTotale,
      };
    });

    return {
      student: { id: student.id, nrMatricol: student.nrMatricol, nume: student.nume, prenume: student.prenume },
      note: lista,
      medii,
    };
  }
}
