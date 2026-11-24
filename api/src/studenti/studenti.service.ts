import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListaStudentiDto } from './dto/lista-studenti.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';

// grupa (cu specializarea ei) trimisă împreună cu fiecare student
const cuGrupa = {
  grupa: { select: { id: true, cod: true, an: true, specializare: { select: { id: true, cod: true } } } },
} satisfies Prisma.StudentInclude;

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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: ListaStudentiDto) {
    // condițiile se adună într-un singur obiect WHERE
    const where: Prisma.StudentWhereInput = {};
    if (q.grupaId) where.grupaId = q.grupaId;
    if (q.specializareId) where.grupa = { specializareId: q.specializareId };
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
      q.ordonare === 'nrMatricol' ? [{ nrMatricol: 'asc' }]
      : q.ordonare === 'grupa' ? [{ grupa: { cod: 'asc' } }, { nume: 'asc' }, { prenume: 'asc' }]
      : [{ nume: 'asc' }, { prenume: 'asc' }];

    // două interogări în aceeași tranzacție: pagina de rânduri și numărul total
    const [date, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({
        where,
        orderBy,
        include: cuGrupa,
        skip: (q.pagina - 1) * q.perPagina, // câte rânduri sărim
        take: q.perPagina, // câte rânduri luăm
      }),
      this.prisma.student.count({ where }),
    ]);
    const rezultat: Pagina<(typeof date)[number]> = { date, total, pagina: q.pagina, perPagina: q.perPagina };
    return rezultat;
  }

  async findOne(id: number) {
    const student = await this.prisma.student.findUnique({ where: { id }, include: cuGrupa });
    if (!student) throw new NotFoundException(`Studentul ${id} nu există`);
    return student;
  }

  async create(date: CreateStudentDto) {
    if (date.grupaId) await this.verificaGrupa(date.grupaId);
    return this.prisma.student.create({
      data: {
        nrMatricol: date.nrMatricol,
        nume: date.nume,
        prenume: date.prenume,
        email: date.email,
        dataNasterii: laData(date.dataNasterii),
        grupaId: date.grupaId,
      },
      include: cuGrupa,
    });
  }

  async update(id: number, date: UpdateStudentDto) {
    if (date.grupaId) await this.verificaGrupa(date.grupaId);
    return this.prisma.student.update({
      where: { id },
      data: {
        nrMatricol: date.nrMatricol,
        nume: date.nume,
        prenume: date.prenume,
        email: date.email,
        dataNasterii: laData(date.dataNasterii),
        grupaId: date.grupaId,
      },
      include: cuGrupa,
    });
  }

  async remove(id: number) {
    await this.prisma.student.delete({ where: { id } });
  }

  private async verificaGrupa(id: number) {
    const exista = await this.prisma.grupa.count({ where: { id } });
    if (!exista) throw new BadRequestException(`Grupa ${id} nu există`);
  }
}
