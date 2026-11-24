import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UtilizatorCurent, type UtilizatorJwt } from '../auth/auth.decorators.js';
import { Roluri } from '../auth/roluri.guard.js';
import { PaginaStudenti, StudentDetaliu } from './student.entity.js';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListaStudentiDto } from './dto/lista-studenti.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentiService } from './studenti.service.js';

// Resursa REST /api/studenti
//   GET /api/studenti?pagina=1&perPagina=20&cauta=...&specializareId=...&grupaId=...&ordonare=...
@ApiTags('studenti')
@Controller('studenti')
export class StudentiController {
  constructor(private readonly service: StudentiService) {}

  // @Query() fără nume: toți parametrii din URL, validați de ListaStudentiDto
  // un student nu vede lista colegilor; un profesor vede doar studenții de la disciplinele lui
  @Roluri('ADMIN', 'PROFESOR')
  @Get()
  findAll(@Query() q: ListaStudentiDto, @UtilizatorCurent() u: UtilizatorJwt): Promise<PaginaStudenti> {
    return this.service.findAll(q, u);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @UtilizatorCurent() u: UtilizatorJwt): Promise<StudentDetaliu> {
    return this.service.findOneVerificat(id, u);
  }

  @Roluri('ADMIN')
  @Post()
  create(@Body() date: CreateStudentDto): Promise<StudentDetaliu> {
    return this.service.create(date);
  }

  @Roluri('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateStudentDto): Promise<StudentDetaliu> {
    return this.service.update(id, date);
  }

  // POST /api/studenti/:id/invitatie – un email nou cu legătura de alegere a parolei
  @Roluri('ADMIN')
  @Post(':id/invitatie')
  @HttpCode(HttpStatus.NO_CONTENT)
  retrimiteInvitatia(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.retrimiteInvitatia(id);
  }

  @Roluri('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
