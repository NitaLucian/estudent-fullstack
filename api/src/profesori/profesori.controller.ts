import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Predare, Profesor, ProfesorCuNumar, ProfesorDetaliu } from './profesor.entity.js';
import { CreatePredareDto, CreateProfesorDto, UpdateProfesorDto } from './dto/profesor.dto.js';
import { ProfesoriService } from './profesori.service.js';

// /api/profesori și sub-resursa /api/profesori/:id/predari
@ApiTags('profesori')
@Controller('profesori')
export class ProfesoriController {
  constructor(private readonly service: ProfesoriService) {}

  @Get()
  findAll(): Promise<ProfesorCuNumar[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ProfesorDetaliu> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateProfesorDto): Promise<Profesor> {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateProfesorDto): Promise<Profesor> {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }

  @Post(':id/predari')
  adaugaPredare(@Param('id', ParseIntPipe) id: number, @Body() date: CreatePredareDto): Promise<Predare> {
    return this.service.adaugaPredare(id, date);
  }

  @Delete(':id/predari/:predareId')
  @HttpCode(HttpStatus.NO_CONTENT)
  stergePredare(@Param('id', ParseIntPipe) id: number, @Param('predareId', ParseIntPipe) predareId: number): Promise<void> {
    return this.service.stergePredare(id, predareId);
  }
}
