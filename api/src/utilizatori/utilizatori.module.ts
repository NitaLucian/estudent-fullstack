import { Module } from '@nestjs/common';
import { UtilizatoriController } from './utilizatori.controller.js';
import { UtilizatoriService } from './utilizatori.service.js';

@Module({
  controllers: [UtilizatoriController],
  providers: [UtilizatoriService],
})
export class UtilizatoriModule {}
