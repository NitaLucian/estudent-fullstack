import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { SpecializariService } from './specializari.service.js';

// Rutele: GET /api/specializari și GET /api/specializari/:id
@Controller('specializari')
export class SpecializariController {
  constructor(private readonly service: SpecializariService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  // ParseIntPipe transformă textul din URL („3”) în număr și respinge valorile nenumerice
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
