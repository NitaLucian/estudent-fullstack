import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto.js';
import { ListaStudentiDto } from './dto/lista-studenti.dto.js';
import { UpdateStudentDto } from './dto/update-student.dto.js';
import { StudentiService } from './studenti.service.js';

// Resursa REST /api/studenti
//   GET /api/studenti?pagina=1&perPagina=20&cauta=...&specializareId=...&grupaId=...&ordonare=...
@Controller('studenti')
export class StudentiController {
  constructor(private readonly service: StudentiService) {}

  // @Query() fără nume: toți parametrii din URL, validați de ListaStudentiDto
  @Get()
  findAll(@Query() q: ListaStudentiDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateStudentDto) {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateStudentDto) {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
