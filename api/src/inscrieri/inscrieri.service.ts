import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateInscriereDto, UpdateInscriereDto } from './dto/inscriere.dto.js';

@Injectable()
export class InscrieriService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
  ) {}

  async create(date: CreateInscriereDto) {
    const anUniversitarId = await this.ani.idSauCurent(date.anUniversitarId);
    const student = await this.prisma.student.count({ where: { id: date.studentId } });
    if (!student) throw new BadRequestException(`Studentul ${date.studentId} nu există`);
    await this.verificaGrupa(date.grupaId);

    // Mesaj clar pentru cazul obișnuit. Garanția reală rămâne constrângerea UNIQUE
    // (studentId, anUniversitarId) din baza de date: ea prinde și două cereri simultane.
    const existenta = await this.prisma.inscriere.findUnique({
      where: { studentId_anUniversitarId: { studentId: date.studentId, anUniversitarId } },
      include: { grupa: true, anUniversitar: true },
    });
    if (existenta) {
      throw new ConflictException(
        `Studentul este deja înscris în grupa ${existenta.grupa.cod} în anul ${existenta.anUniversitar.cod}`,
      );
    }
    return this.prisma.inscriere.create({ data: { studentId: date.studentId, grupaId: date.grupaId, anUniversitarId } });
  }

  // mutarea în altă grupă (transfer)
  async update(id: number, date: UpdateInscriereDto) {
    await this.verificaGrupa(date.grupaId);
    return this.prisma.inscriere.update({ where: { id }, data: { grupaId: date.grupaId } });
  }

  async remove(id: number) {
    await this.prisma.inscriere.delete({ where: { id } });
  }

  private async verificaGrupa(id: number) {
    const exista = await this.prisma.grupa.count({ where: { id } });
    if (!exista) throw new BadRequestException(`Grupa ${id} nu există`);
  }
}
