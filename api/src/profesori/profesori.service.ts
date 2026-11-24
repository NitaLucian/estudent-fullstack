import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePredareDto, CreateProfesorDto, UpdateProfesorDto } from './dto/profesor.dto.js';

@Injectable()
export class ProfesoriService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
  ) {}

  // lista, cu numărul disciplinelor predate în anul curent
  findAll() {
    return this.prisma.profesor.findMany({
      orderBy: [{ nume: 'asc' }, { prenume: 'asc' }],
      include: { _count: { select: { predari: { where: { anUniversitar: { curent: true } } } } } },
    });
  }

  // profesorul, cu disciplinele predate (în toți anii universitari)
  async findOne(id: number) {
    const p = await this.prisma.profesor.findUnique({
      where: { id },
      include: {
        predari: {
          include: {
            disciplina: { include: { specializare: { select: { cod: true } }, anStudiu: { select: { numar: true } } } },
            anUniversitar: { select: { id: true, cod: true, curent: true } },
          },
          orderBy: [{ anUniversitar: { dataInceput: 'desc' } }, { disciplina: { cod: 'asc' } }],
        },
      },
    });
    if (!p) throw new NotFoundException(`Profesorul ${id} nu există`);
    return p;
  }

  create(date: CreateProfesorDto) {
    return this.prisma.profesor.create({
      data: { nume: date.nume, prenume: date.prenume, email: date.email, grad: date.grad },
    });
  }

  update(id: number, date: UpdateProfesorDto) {
    return this.prisma.profesor.update({
      where: { id },
      data: { nume: date.nume, prenume: date.prenume, email: date.email, grad: date.grad },
    });
  }

  async remove(id: number) {
    await this.prisma.profesor.delete({ where: { id } });
  }

  // Profesorul preia o disciplină într-un an universitar (o legătură nouă în tabelul predari)
  async adaugaPredare(profesorId: number, date: CreatePredareDto) {
    const anUniversitarId = await this.ani.idSauCurent(date.anUniversitarId);
    if (!(await this.prisma.profesor.count({ where: { id: profesorId } }))) {
      throw new NotFoundException(`Profesorul ${profesorId} nu există`);
    }
    if (!(await this.prisma.disciplina.count({ where: { id: date.disciplinaId } }))) {
      throw new BadRequestException(`Disciplina ${date.disciplinaId} nu există`);
    }
    const cheie = { profesorId, disciplinaId: date.disciplinaId, anUniversitarId };
    if (await this.prisma.predare.count({ where: cheie })) {
      throw new ConflictException('Profesorul predă deja această disciplină în anul ales');
    }
    return this.prisma.predare.create({ data: cheie });
  }

  // ștergem doar o predare care aparține profesorului din adresă
  async stergePredare(profesorId: number, predareId: number) {
    const { count } = await this.prisma.predare.deleteMany({ where: { id: predareId, profesorId } });
    if (count === 0) throw new NotFoundException('Predarea nu există');
  }
}
