import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AniUniversitariService } from '../ani/ani-universitari.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { Statistici } from './statistici.entity.js';

// GET /api/statistici – câteva numere despre facultate, pentru pagina de start
@ApiTags('statistici')
@Controller('statistici')
export class StatisticiController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ani: AniUniversitariService,
  ) {}

  @Get()
  async statistici(): Promise<Statistici> {
    const an = await this.ani.curent();
    // cele cinci numărări pornesc deodată; Promise.all așteaptă să se termine toate
    const [studenti, grupe, specializari, discipline, profesori] = await Promise.all([
      this.prisma.inscriere.count({ where: { anUniversitarId: an.id } }),
      this.prisma.grupa.count(),
      this.prisma.specializare.count(),
      this.prisma.disciplina.count(),
      this.prisma.profesor.count(),
    ]);
    return { anCurent: an.cod, studenti, grupe, specializari, discipline, profesori };
  }
}
