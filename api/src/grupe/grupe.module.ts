import { Module } from '@nestjs/common';
import { GrupeController } from './grupe.controller.js';
import { GrupeService } from './grupe.service.js';

@Module({
  controllers: [GrupeController],
  providers: [GrupeService],
})
export class GrupeModule {}
