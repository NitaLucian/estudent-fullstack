import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateAnUniversitarDto } from './dto/create-an-universitar.dto.js';

@Injectable()
export class AniUniversitariService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.anUniversitar.findMany({
      orderBy: { dataInceput: 'desc' },
      include: { _count: { select: { inscrieri: true } } },
    });
  }

  // anul universitar curent; folosit și de alte module (înscrieri, predări ...)
  async curent() {
    const an = await this.prisma.anUniversitar.findFirst({ where: { curent: true } });
    if (!an) throw new NotFoundException('Nu este stabilit anul universitar curent');
    return an;
  }

  // id-ul primit sau, dacă lipsește, id-ul anului curent
  async idSauCurent(id?: number) {
    if (id === undefined) return (await this.curent()).id;
    const exista = await this.prisma.anUniversitar.count({ where: { id } });
    if (!exista) throw new BadRequestException(`Anul universitar ${id} nu există`);
    return id;
  }

  create(date: CreateAnUniversitarDto) {
    if (date.dataSfarsit <= date.dataInceput) {
      throw new BadRequestException('Data de sfârșit trebuie să fie după data de început');
    }
    return this.prisma.anUniversitar.create({
      data: { cod: date.cod, dataInceput: new Date(date.dataInceput), dataSfarsit: new Date(date.dataSfarsit) },
    });
  }

  // Un singur an poate fi curent. Cele două modificări se fac într-o TRANZACȚIE:
  // ori reușesc amândouă, ori niciuna (nu putem rămâne cu doi ani curenți sau cu niciunul).
  async stabilesteCurent(id: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.anUniversitar.updateMany({ where: { curent: true }, data: { curent: false } });
      return tx.anUniversitar.update({ where: { id }, data: { curent: true } });
    });
  }
}
