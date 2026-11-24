import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { SpecializariService } from './specializari.service.js';

// Rutele: GET /api/specializari[?cauta=text] și GET /api/specializari/:id
@Controller('specializari')
export class SpecializariController {
  constructor(private readonly service: SpecializariService) {}

  // @Query('cauta') citește parametrul din URL: /api/specializari?cauta=inf
  @Get()
  findAll(@Query('cauta') cauta?: string) {
    return this.service.findAll(cauta);
  }

  // ParseIntPipe transformă textul din URL („3”) în număr și respinge valorile nenumerice
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
