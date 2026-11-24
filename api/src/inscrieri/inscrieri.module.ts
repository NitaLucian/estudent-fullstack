import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { InscrieriController } from './inscrieri.controller.js';
import { InscrieriService } from './inscrieri.service.js';

@Module({
  imports: [AniModule],
  controllers: [InscrieriController],
  providers: [InscrieriService],
})
export class InscrieriModule {}
