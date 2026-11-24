import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Serviciul conține logica de lucru cu specializările.
// Controllerul doar primește cererea și apelează serviciul.
@Injectable()
export class SpecializariService {
  constructor(private readonly prisma: PrismaService) {}

  // cauta (opțional): text căutat în cod sau în denumire, fără diferență între litere mari și mici
  findAll(cauta?: string) {
    const text = cauta?.trim();
    return this.prisma.specializare.findMany({
      where: text
        ? {
            OR: [
              { cod: { contains: text, mode: 'insensitive' } },
              { denumire: { contains: text, mode: 'insensitive' } },
            ],
          }
        : {},
      orderBy: { cod: 'asc' },
    });
  }

  async findOne(id: number) {
    const specializare = await this.prisma.specializare.findUnique({ where: { id } });
    if (!specializare) throw new NotFoundException(`Specializarea ${id} nu există`);
    return specializare;
  }
}
