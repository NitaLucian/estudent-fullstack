import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UtilizatorCurent, type UtilizatorJwt } from '../auth/auth.decorators.js';
import { Roluri } from '../auth/roluri.guard.js';
import { ListaConturiDto, StareContDto } from './dto/utilizatori.dto.js';
import { Cont } from './utilizator.entity.js';
import { UtilizatoriService } from './utilizatori.service.js';

// /api/utilizatori – conturile de acces; doar pentru administrator (decorator pe clasă)
@ApiTags('utilizatori')
@Roluri('ADMIN')
@Controller('utilizatori')
export class UtilizatoriController {
  constructor(private readonly service: UtilizatoriService) {}

  @Get()
  findAll(@Query() q: ListaConturiDto): Promise<Cont[]> {
    return this.service.findAll(q);
  }

  @Patch(':id/activ')
  seteazaActiv(
    @Param('id', ParseIntPipe) id: number,
    @Body() date: StareContDto,
    @UtilizatorCurent() admin: UtilizatorJwt,
  ): Promise<Cont> {
    return this.service.seteazaActiv(id, date.activ, admin.id);
  }
}
