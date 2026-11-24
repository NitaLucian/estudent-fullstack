import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Serviciul conține logica de lucru cu specializările.
// Controllerul doar primește cererea și apelează serviciul.
@Injectable()
export class SpecializariService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.specializare.findMany({ orderBy: { cod: 'asc' } });
  }

  async findOne(id: number) {
    const specializare = await this.prisma.specializare.findUnique({ where: { id } });
    if (!specializare) throw new NotFoundException(`Specializarea ${id} nu există`);
    return specializare;
  }
}
