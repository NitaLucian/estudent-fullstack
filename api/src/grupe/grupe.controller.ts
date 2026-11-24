import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post, Query,
} from '@nestjs/common';
import { CreateGrupaDto } from './dto/create-grupa.dto.js';
import { UpdateGrupaDto } from './dto/update-grupa.dto.js';
import { GrupeService } from './grupe.service.js';

// Resursa REST /api/grupe
//   GET /api/grupe?specializareId=1  – filtrare opțională după specializare
@Controller('grupe')
export class GrupeController {
  constructor(private readonly service: GrupeService) {}

  @Get()
  findAll(@Query('specializareId', new ParseIntPipe({ optional: true })) specializareId?: number) {
    return this.service.findAll(specializareId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() date: CreateGrupaDto) {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateGrupaDto) {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
