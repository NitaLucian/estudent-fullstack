import { Module } from '@nestjs/common';
import { StudentiController } from './studenti.controller.js';
import { StudentiService } from './studenti.service.js';

@Module({
  controllers: [StudentiController],
  providers: [StudentiService],
})
export class StudentiModule {}
