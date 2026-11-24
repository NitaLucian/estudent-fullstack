import { Module } from '@nestjs/common';
import { AniModule } from '../ani/ani.module.js';
import { StatisticiController } from './statistici.controller.js';

@Module({
  imports: [AniModule],
  controllers: [StatisticiController],
})
export class StatisticiModule {}
