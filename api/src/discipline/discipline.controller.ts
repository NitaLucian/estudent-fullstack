import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { DisciplineService } from './discipline.service.js';
import { CreateDisciplinaDto, ListaDisciplineDto, UpdateDisciplinaDto } from './dto/disciplina.dto.js';

// /api/discipline
@Controller('discipline')
export class DisciplineController {
  constructor(private readonly service: DisciplineService) {}

  @Get()
  findAll(@Query() q: ListaDisciplineDto) {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateDisciplinaDto) {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateDisciplinaDto) {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
