import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service.js';
import { AnStudiu, AnUniversitar, AnUniversitarCuNumar } from './ani.entity.js';
import { AniUniversitariService } from './ani-universitari.service.js';
import { CreateAnUniversitarDto } from './dto/create-an-universitar.dto.js';

// /api/ani-universitari
@ApiTags('ani')
@Controller('ani-universitari')
export class AniUniversitariController {
  constructor(private readonly service: AniUniversitariService) {}

  @Get()
  findAll(): Promise<AnUniversitarCuNumar[]> {
    return this.service.findAll();
  }

  @Get('curent')
  curent(): Promise<AnUniversitar> {
    return this.service.curent();
  }

  @Post()
  create(@Body() date: CreateAnUniversitarDto): Promise<AnUniversitar> {
    return this.service.create(date);
  }

  // POST /api/ani-universitari/3/curent – anul 3 devine anul curent
  @Post(':id/curent')
  stabilesteCurent(@Param('id', ParseIntPipe) id: number): Promise<AnUniversitar> {
    return this.service.stabilesteCurent(id);
  }
}

// /api/ani-studiu – lista fixă a anilor de studiu (doar citire)
@ApiTags('ani')
@Controller('ani-studiu')
export class AniStudiuController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll(): Promise<AnStudiu[]> {
    return this.prisma.anStudiu.findMany({ orderBy: { numar: 'asc' } });
  }
}
