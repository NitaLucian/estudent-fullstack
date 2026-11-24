import {
  Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Specializare, SpecializareCuNumar } from './specializare.entity.js';
import { CreateSpecializareDto } from './dto/create-specializare.dto.js';
import { UpdateSpecializareDto } from './dto/update-specializare.dto.js';
import { SpecializariService } from './specializari.service.js';

// Resursa REST /api/specializari
//   GET    /api/specializari       – lista
//   GET    /api/specializari/:id   – o specializare
//   POST   /api/specializari       – adăugare        (201 Created)
//   PATCH  /api/specializari/:id   – modificare      (200 OK)
//   DELETE /api/specializari/:id   – ștergere        (204 No Content)
@ApiTags('specializari')
@Controller('specializari')
export class SpecializariController {
  constructor(private readonly service: SpecializariService) {}

  @Get()
  findAll(): Promise<SpecializareCuNumar[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Specializare> {
    return this.service.findOne(id);
  }

  // @Body() ia corpul JSON al cererii; ValidationPipe îl verifică după regulile din DTO
  @Post()
  create(@Body() date: CreateSpecializareDto): Promise<Specializare> {
    return this.service.create(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateSpecializareDto): Promise<Specializare> {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
