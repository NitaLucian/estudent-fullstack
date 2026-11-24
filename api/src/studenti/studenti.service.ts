import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { tokenAleator } from '../auth/amprenta.js';
import type { UtilizatorJwt } from '../auth/auth.decorators.js';
import { ParoleService } from '../auth/parole.service.js';
import { Prisma } from '../generated/prisma/client.js';
import { CONT_CREAT, ContCreat } from '../notificari/evenimente.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListaStudentiDto } from './dto/lista-studenti.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

// datele grupei trimise împreună cu un student sau cu o înscriere
const selectGrupa = {
  select: {
    id: true,
    cod: true,
    anStudiu: { select: { numar: true } },
    specializare: { select: { id: true, cod: true } },
  },
} satisfies Prisma.GrupaDefaultArgs;

// doar înscrierea din anul universitar curent (cel mult una, datorită @@unique)
const cuInscriereaCurenta = {
  inscrieri: { where: { anUniversitar: { curent: true } }, select: { grupa: selectGrupa } },
} satisfies Prisma.StudentInclude;

type GrupaBd = Prisma.GrupaGetPayload<typeof selectGrupa>;

// Forma grupei trimisă clientului: anul de studiu ca număr simplu (an: 2)
function grupaPentruClient(g: GrupaBd | undefined) {
  return g ? { id: g.id, cod: g.cod, an: g.anStudiu.numar, specializare: g.specializare } : null;
}

// Studentul cu grupa din anul curent, în locul listei de înscrieri
function cuGrupaCurenta<T extends { inscrieri: { grupa: GrupaBd }[] }>(student: T) {
  const { inscrieri, ...rest } = student;
  return { ...rest, grupa: grupaPentruClient(inscrieri[0]?.grupa) };
}

// Data nașterii vine ca text („2006-03-15”), iar Prisma așteaptă un obiect Date.
// undefined = câmpul nu a fost trimis (nu se modifică); null = se șterge valoarea.
function laData(text: string | null | undefined): Date | null | undefined {
  if (text === undefined || text === null) return text;
  return new Date(text);
}

// Rezultatul unei liste paginate: rândurile paginii cerute + numărul total de rânduri.
export interface Pagina<T> {
  date: T[];
  total: number;
  pagina: number;
  perPagina: number;
}

@Injectable()
export class StudentiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
    private readonly parole: ParoleService,
    private readonly evenimente: EventEmitter2,
  ) {}

  // Ce studenți are voie să vadă utilizatorul (autorizare la nivel de resursă):
  //  ADMIN – toți; STUDENT – doar pe el însuși;
  //  PROFESOR – studenții înscriși anul acesta în grupele unde predă (aceeași specializare și an).
  async filtruAcces(u: UtilizatorJwt): Promise<Prisma.StudentWhereInput> {
    if (u.rol === 'ADMIN') return {};
    if (u.rol === 'STUDENT') return { id: u.studentId ?? -1 };
    const predari = await this.prisma.predare.findMany({
      where: { profesorId: u.profesorId ?? -1, anUniversitar: { curent: true } },
      select: { disciplina: { select: { specializareId: true, anStudiuId: true } } },
    });
    if (predari.length === 0) return { id: -1 }; // nicio disciplină => niciun student
    return {
      inscrieri: {
        some: {
          anUniversitar: { curent: true },
          grupa: { OR: predari.map((p) => ({ specializareId: p.disciplina.specializareId, anStudiuId: p.disciplina.anStudiuId })) },
        },
      },
    };
  }

  // Fișa unui student, doar dacă utilizatorul are voie să o vadă.
  async findOneVerificat(id: number, u: UtilizatorJwt) {
    const student = await this.findOne(id); // 404 dacă nu există
    const vizibil = await this.prisma.student.count({ where: { AND: [{ id }, await this.filtruAcces(u)] } });
    if (!vizibil) throw new ForbiddenException('Nu aveți acces la datele acestui student');
    return student;
  }

  async findAll(q: ListaStudentiDto, u: UtilizatorJwt) {
    const where: Prisma.StudentWhereInput = { AND: [await this.filtruAcces(u)] };
    // filtrele după grupă și specializare privesc înscrierea din anul curent
    if (q.grupaId || q.specializareId) {
      where.inscrieri = {
        some: {
          anUniversitar: { curent: true },
          ...(q.grupaId && { grupaId: q.grupaId }),
          ...(q.specializareId && { grupa: { specializareId: q.specializareId } }),
        },
      };
    }
    const text = q.cauta?.trim();
    if (text) {
      where.OR = [
        { nume: { contains: text, mode: 'insensitive' } },
        { prenume: { contains: text, mode: 'insensitive' } },
        { nrMatricol: { contains: text, mode: 'insensitive' } },
        { email: { contains: text, mode: 'insensitive' } },
      ];
    }
    const orderBy: Prisma.StudentOrderByWithRelationInput[] =
      q.ordonare === 'nrMatricol' ? [{ nrMatricol: 'asc' }] : [{ nume: 'asc' }, { prenume: 'asc' }];

    const [randuri, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy,
        include: cuInscriereaCurenta,
        skip: (q.pagina - 1) * q.perPagina,
        take: q.perPagina,
      }),
      this.prisma.student.count({ where }),
    ]);
    const date = randuri.map(cuGrupaCurenta);
    const rezultat: Pagina<(typeof date)[number]> = { date, total, pagina: q.pagina, perPagina: q.perPagina };
    return rezultat;
  }

  // fișa studentului: grupa curentă și istoricul tuturor înscrierilor
  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({
      where: { id },
      include: {
        inscrieri: {
          include: { grupa: selectGrupa, anUniversitar: { select: { id: true, cod: true, curent: true } } },
          orderBy: { anUniversitar: { dataInceput: 'desc' } },
        },
      },
    });
    if (!student) throw new NotFoundException(`Studentul ${id} nu există`);
    const curenta = student.inscrieri.find((i) => i.anUniversitar.curent);
    return {
      ...student,
      grupa: grupaPentruClient(curenta?.grupa),
      inscrieri: student.inscrieri.map((i) => ({
        id: i.id,
        anUniversitar: i.anUniversitar,
        grupa: grupaPentruClient(i.grupa),
      })),
    };
  }

  // Studentul și, opțional, înscrierea lui în anul curent. Scrierea „imbricată”
  // (inscrieri: { create: ... }) se execută într-o singură tranzacție: dacă înscrierea
  // eșuează, nici studentul nu rămâne în baza de date.
  async create(date: CreateStudentDto) {
    let inscrieri: Prisma.InscriereCreateNestedManyWithoutStudentInput | undefined;
    if (date.grupaId) {
      await this.verificaGrupa(date.grupaId);
      const an = await this.ani.curent();
      inscrieri = { create: { grupaId: date.grupaId, anUniversitarId: an.id } };
    }
    // Odată cu studentul se creează și contul lui de acces. Parola inițială este aleatoare
    // și necunoscută oricui: studentul își alege parola din legătura primită pe email.
    const parolaHash = await argon2.hash(tokenAleator());
    const student = await this.prisma.student.create({
      data: {
        nrMatricol: date.nrMatricol,
        nume: date.nume,
        prenume: date.prenume,
        email: date.email,
        dataNasterii: laData(date.dataNasterii),
        inscrieri,
        utilizator: { create: { email: date.email.toLowerCase(), rol: 'STUDENT', parolaHash } },
      },
      include: { utilizator: true },
    });
    const token = await this.parole.creeazaToken(student.utilizator!.id, 'SETARE');
    // anunțăm evenimentul; emailul îl trimite modulul de notificări, în fundal
    this.evenimente.emit(CONT_CREAT, new ContCreat(student.email, `${student.prenume} ${student.nume}`, token));
    return this.findOne(student.id);
  }

  async update(id: number, date: UpdateStudentDto) {
    await this.prisma.student.update({
      where: { id },
      data: {
        nrMatricol: date.nrMatricol,
        nume: date.nume,
        prenume: date.prenume,
        email: date.email,
        dataNasterii: laData(date.dataNasterii),
      },
    });
    return this.findOne(id);
  }

  // înscrierile studentului se șterg odată cu el (onDelete: Cascade)
  async remove(id: number) {
    await this.prisma.student.delete({ where: { id } });
  }

  private async verificaGrupa(id: number) {
    const exista = await this.prisma.grupa.count({ where: { id } });
    if (!exista) throw new BadRequestException(`Grupa ${id} nu există`);
  }
}
