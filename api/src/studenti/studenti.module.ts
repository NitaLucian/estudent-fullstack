import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { StudentiController } from './studenti.controller.js';
import { StudentiService } from './studenti.service.js';

@Module({
  imports: [AniModule], // pentru AniUniversitariService (anul curent)
  controllers: [StudentiController],
  providers: [StudentiService],
})
export class StudentiModule {}
