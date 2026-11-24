import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGrupaDto } from './dto/create-grupa.dto.js';
import { UpdateGrupaDto } from './dto/update-grupa.dto.js';

// ce date ale specializării trimitem împreună cu fiecare grupă
const cuSpecializare = { specializare: { select: { id: true, cod: true, denumire: true } } };

@Injectable()
export class GrupeService {
  constructor(private readonly prisma: PrismaService) {}

  // specializareId este opțional: fără el, întoarcem toate grupele
  findAll(specializareId?: number) {
    return this.prisma.grupa.findMany({
      where: specializareId ? { specializareId } : {},
      include: cuSpecializare,
      orderBy: [{ specializare: { cod: 'asc' } }, { an: 'asc' }, { cod: 'asc' }],
    });
  }

  async findOne(id: number) {
    const grupa = await this.prisma.grupa.findUnique({ where: { id }, include: cuSpecializare });
    if (!grupa) throw new NotFoundException(`Grupa ${id} nu există`);
    return grupa;
  }

  async create(date: CreateGrupaDto) {
    await this.verificaSpecializarea(date.specializareId);
    return this.prisma.grupa.create({ data: date, include: cuSpecializare });
  }

  async update(id: number, date: UpdateGrupaDto) {
    if (date.specializareId !== undefined) await this.verificaSpecializarea(date.specializareId);
    return this.prisma.grupa.update({ where: { id }, data: date, include: cuSpecializare });
  }

  async remove(id: number) {
    await this.prisma.grupa.delete({ where: { id } });
  }

  // un mesaj clar (400) în loc de eroarea de cheie străină a bazei de date
  private async verificaSpecializarea(id: number) {
    const exista = await this.prisma.specializare.count({ where: { id } });
    if (!exista) throw new BadRequestException(`Specializarea ${id} nu există`);
  }
}
