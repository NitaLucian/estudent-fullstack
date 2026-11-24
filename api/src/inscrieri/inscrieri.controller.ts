import { Body, Controller, Delete, HttpCode, HttpStatus, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CreateInscriereDto, PromovareDto, UpdateInscriereDto } from './dto/inscriere.dto.js';
import { InscrieriService } from './inscrieri.service.js';

// /api/inscrieri – înscrierea unui student într-o grupă, într-un an universitar
@Controller('inscrieri')
export class InscrieriController {
  constructor(private readonly service: InscrieriService) {}

  @Post()
  create(@Body() date: CreateInscriereDto) {
    return this.service.create(date);
  }

  // POST /api/inscrieri/promovare – întreaga grupă trece în anul următor
  @Post('promovare')
  promoveaza(@Body() date: PromovareDto) {
    return this.service.promoveaza(date);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() date: UpdateInscriereDto) {
    return this.service.update(id, date);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
