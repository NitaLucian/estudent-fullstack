import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { CreatePredareDto, CreateProfesorDto, UpdateProfesorDto } from './dto/profesor.dto.js';
import { ProfesoriService } from './profesori.service.js';

// /api/profesori și sub-resursa /api/profesori/:id/predari
@Controller('profesori')
export class ProfesoriController {
  constructor(private readonly service: ProfesoriService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateProfesorDto) {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateProfesorDto) {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/predari')
  adaugaPredare(@Param('id', ParseIntPipe) id: number, @Body() date: CreatePredareDto) {
    return this.service.adaugaPredare(id, date);
  }

  @Delete(':id/predari/:predareId')
  @HttpCode(HttpStatus.NO_CONTENT)
  stergePredare(@Param('id', ParseIntPipe) id: number, @Param('predareId', ParseIntPipe) predareId: number) {
    return this.service.stergePredare(id, predareId);
  }
}
