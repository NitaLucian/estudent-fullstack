import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { ProfesoriController } from './profesori.controller.js';
import { ProfesoriService } from './profesori.service.js';

@Module({
  imports: [AniModule],
  controllers: [ProfesoriController],
  providers: [ProfesoriService],
})
export class ProfesoriModule {}
