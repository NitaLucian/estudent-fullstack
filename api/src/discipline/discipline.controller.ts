import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Disciplina } from './disciplina.entity.js';
import { DisciplineService } from './discipline.service.js';
import { CreateDisciplinaDto, ListaDisciplineDto, UpdateDisciplinaDto } from './dto/disciplina.dto.js';

// /api/discipline
@ApiTags('discipline')
@Controller('discipline')
export class DisciplineController {
  constructor(private readonly service: DisciplineService) {}

  @Get()
  findAll(@Query() q: ListaDisciplineDto): Promise<Disciplina[]> {
    return this.service.findAll(q);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Disciplina> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateDisciplinaDto): Promise<Disciplina> {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateDisciplinaDto): Promise<Disciplina> {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
