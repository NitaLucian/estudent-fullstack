import { Module } from '@nestjs/common';
import { AniStudiuController, AniUniversitariController } from './ani.controller.js';
import { AniUniversitariService } from './ani-universitari.service.js';

@Module({
  controllers: [AniUniversitariController, AniStudiuController],
  providers: [AniUniversitariService],
  // alte module (studenți, profesori) au nevoie să afle anul curent
  exports: [AniUniversitariService],
})
export class AniModule {}
