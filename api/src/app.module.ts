import { Module } from '@nestjs/common';
import { GrupeModule } from './grupe/grupe.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SpecializariModule } from './specializari/specializari.module.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
@Module({
  imports: [PrismaModule, SpecializariModule, GrupeModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
