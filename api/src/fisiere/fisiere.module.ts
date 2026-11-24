import { Module } from '@nestjs/common';
import { StudentiModule } from '../studenti/studenti.module.js';
import { FisiereController } from './fisiere.controller.js';
import { FisiereService } from './fisiere.service.js';

@Module({
  imports: [StudentiModule], // verificarea accesului la fișa studentului
  controllers: [FisiereController],
  providers: [FisiereService],
})
export class FisiereModule {}
