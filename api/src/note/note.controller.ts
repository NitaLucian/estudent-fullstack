import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UtilizatorCurent, type UtilizatorJwt } from '../auth/auth.decorators.js';
import { Roluri } from '../auth/roluri.guard.js';
import { SeteazaNotaDto } from './dto/seteaza-nota.dto.js';
import { Catalog, ModificareNota, NotaScurta, SituatieScolara } from './nota.entity.js';
import { NoteService } from './note.service.js';

// /api/note
//   GET    /api/note/catalog/:disciplinaId                – catalogul disciplinei (anul curent)
//   PUT    /api/note/catalog/:disciplinaId/:inscriereId   – pune sau schimbă nota unui student
//   DELETE /api/note/catalog/:disciplinaId/:inscriereId   – șterge nota
//   GET    /api/note/student/:studentId                   – situația școlară a unui student
@ApiTags('note')
@Controller('note')
export class NoteController {
  constructor(private readonly service: NoteService) {}

  @Roluri('ADMIN', 'PROFESOR')
  @Get('catalog/:disciplinaId')
  catalog(@Param('disciplinaId', ParseIntPipe) disciplinaId: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<Catalog> {
    return this.service.catalog(disciplinaId, u);
  }

  @Roluri('ADMIN', 'PROFESOR')
  @Get('catalog/:disciplinaId/istoric')
  istoric(
    @Param('disciplinaId', ParseIntPipe) disciplinaId: number,
    @UtilizatorCurent() u: UtilizatorJwt,
  ): Promise<ModificareNota[]> {
    return this.service.istoric(disciplinaId, u);
  }

  // PUT: aceeași cerere repetată are același efect (idempotentă) – potrivit pentru „pune nota X”
  @Roluri('ADMIN', 'PROFESOR')
  @Put('catalog/:disciplinaId/:inscriereId')
  seteaza(
    @Param('disciplinaId', ParseIntPipe) disciplinaId: number,
    @Param('inscriereId', ParseIntPipe) inscriereId: number,
    @Body() date: SeteazaNotaDto,
    @UtilizatorCurent() u: UtilizatorJwt,
  ): Promise<NotaScurta> {
    return this.service.seteaza(disciplinaId, inscriereId, date, u);
  }

  @Roluri('ADMIN', 'PROFESOR')
  @Delete('catalog/:disciplinaId/:inscriereId')
  @HttpCode(HttpStatus.NO_CONTENT)
  sterge(
    @Param('disciplinaId', ParseIntPipe) disciplinaId: number,
    @Param('inscriereId', ParseIntPipe) inscriereId: number,
    @UtilizatorCurent() u: UtilizatorJwt,
  ): Promise<void> {
    return this.service.sterge(disciplinaId, inscriereId, u);
  }

  // orice rol; accesul la studentul cerut este verificat în serviciu (ca la fișa studentului)
  @Get('student/:studentId')
  situatie(@Param('studentId', ParseIntPipe) studentId: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<SituatieScolara> {
    return this.service.situatie(studentId, u);
  }
}
