import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roluri } from '../auth/roluri.guard.js';
import { Inscriere } from './inscriere.entity.js';
import { CreateInscriereDto, UpdateInscriereDto } from './dto/inscriere.dto.js';
import { InscrieriService } from './inscrieri.service.js';

// /api/inscrieri – înscrierea unui student într-o grupă, într-un an universitar
@ApiTags('inscrieri')
@Controller('inscrieri')
export class InscrieriController {
  constructor(private readonly service: InscrieriService) {}

  @Roluri('ADMIN')
  @Post()
  create(@Body() date: CreateInscriereDto): Promise<Inscriere> {
    return this.service.create(date);
  }

  @Roluri('ADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateInscriereDto): Promise<Inscriere> {
    return this.service.update(id, date);
  }

  @Roluri('ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }
}
