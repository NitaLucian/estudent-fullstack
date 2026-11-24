import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { Prisma } from '../generated/prisma/client.js';
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
  ) {}

  async findAll(q: ListaStudentiDto) {
    const where: Prisma.StudentWhereInput = {};
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
    const student = await this.prisma.student.create({
      data: {
        nrMatricol: date.nrMatricol,
        nume: date.nume,
        prenume: date.prenume,
        email: date.email,
        dataNasterii: laData(date.dataNasterii),
        inscrieri,
      },
    });
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
