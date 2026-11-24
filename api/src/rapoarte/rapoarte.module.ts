import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { RapoarteController } from './rapoarte.controller.js';
import { RapoarteService } from './rapoarte.service.js';

@Module({
  imports: [AniModule],
  controllers: [RapoarteController],
  providers: [RapoarteService],
})
export class RapoarteModule {}
