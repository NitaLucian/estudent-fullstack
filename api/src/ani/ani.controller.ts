import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AniUniversitariService } from './ani-universitari.service.js';
import { CreateAnUniversitarDto } from './dto/create-an-universitar.dto.js';

// /api/ani-universitari
@Controller('ani-universitari')
export class AniUniversitariController {
  constructor(private readonly service: AniUniversitariService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('curent')
  curent() {
    return this.service.curent();
  }

  @Post()
  create(@Body() date: CreateAnUniversitarDto) {
    return this.service.create(date);
  }

  // POST /api/ani-universitari/3/curent – anul 3 devine anul curent
  @Post(':id/curent')
  stabilesteCurent(@Param('id', ParseIntPipe) id: number) {
    return this.service.stabilesteCurent(id);
  }
}

// /api/ani-studiu – lista fixă a anilor de studiu (doar citire)
@Controller('ani-studiu')
export class AniStudiuController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.anStudiu.findMany({ orderBy: { numar: 'asc' } });
  }
}
