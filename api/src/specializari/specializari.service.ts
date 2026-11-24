import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateSpecializareDto } from './dto/create-specializare.dto.js';
import { UpdateSpecializareDto } from './dto/update-specializare.dto.js';

// Serviciul conține logica de lucru cu specializările.
// Controllerul doar primește cererea și apelează serviciul.
@Injectable()
export class SpecializariService {
  constructor(private readonly prisma: PrismaService) {}

  // lista, cu numărul de grupe al fiecărei specializări
  findAll() {
    return this.prisma.specializare.findMany({
      orderBy: { cod: 'asc' },
      include: { _count: { select: { grupe: true } } },
    });
  }

  async findOne(id: number) {
    const specializare = await this.prisma.specializare.findUnique({ where: { id } });
    if (!specializare) throw new NotFoundException(`Specializarea ${id} nu există`);
    return specializare;
  }

  create(date: CreateSpecializareDto) {
    return this.prisma.specializare.create({ data: date });
  }

  // dacă id-ul nu există, Prisma aruncă eroarea P2025 (tratată de PrismaExceptionFilter)
  update(id: number, date: UpdateSpecializareDto) {
    return this.prisma.specializare.update({ where: { id }, data: date });
  }

  // dacă specializarea are grupe, PostgreSQL refuză ștergerea (P2003 -> 409 Conflict)
  async remove(id: number) {
    await this.prisma.specializare.delete({ where: { id } });
  }
}
