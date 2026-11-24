import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateDisciplinaDto, ListaDisciplineDto, UpdateDisciplinaDto } from './dto/disciplina.dto.js';

// specializarea, anul de studiu și profesorii din anul universitar curent
const detalii = {
  specializare: { select: { id: true, cod: true } },
  anStudiu: { select: { id: true, numar: true } },
  predari: {
    where: { anUniversitar: { curent: true } },
    select: { id: true, profesor: { select: { id: true, nume: true, prenume: true, grad: true } } },
  },
} satisfies Prisma.DisciplinaInclude;

@Injectable()
export class DisciplineService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(q: ListaDisciplineDto) {
    return this.prisma.disciplina.findMany({
      where: { specializareId: q.specializareId, anStudiuId: q.anStudiuId, semestru: q.semestru },
      include: detalii,
      orderBy: [{ specializare: { cod: 'asc' } }, { anStudiu: { numar: 'asc' } }, { semestru: 'asc' }, { cod: 'asc' }],
    });
  }

  async findOne(id: number) {
    const d = await this.prisma.disciplina.findUnique({ where: { id }, include: detalii });
    if (!d) throw new NotFoundException(`Disciplina ${id} nu există`);
    return d;
  }

  async create(date: CreateDisciplinaDto) {
    await this.verificaLegaturile(date.specializareId, date.anStudiuId);
    return this.prisma.disciplina.create({
      data: {
        cod: date.cod,
        denumire: date.denumire,
        credite: date.credite,
        semestru: date.semestru,
        specializareId: date.specializareId,
        anStudiuId: date.anStudiuId,
      },
      include: detalii,
    });
  }

  async update(id: number, date: UpdateDisciplinaDto) {
    await this.verificaLegaturile(date.specializareId, date.anStudiuId);
    return this.prisma.disciplina.update({
      where: { id },
      data: {
        cod: date.cod,
        denumire: date.denumire,
        credite: date.credite,
        semestru: date.semestru,
        specializareId: date.specializareId,
        anStudiuId: date.anStudiuId,
      },
      include: detalii,
    });
  }

  // predările disciplinei se șterg odată cu ea (onDelete: Cascade)
  async remove(id: number) {
    await this.prisma.disciplina.delete({ where: { id } });
  }

  private async verificaLegaturile(specializareId?: number, anStudiuId?: number) {
    if (specializareId !== undefined && !(await this.prisma.specializare.count({ where: { id: specializareId } }))) {
      throw new BadRequestException(`Specializarea ${specializareId} nu există`);
    }
    if (anStudiuId !== undefined && !(await this.prisma.anStudiu.count({ where: { id: anStudiuId } }))) {
      throw new BadRequestException(`Anul de studiu ${anStudiuId} nu există`);
    }
  }
}
