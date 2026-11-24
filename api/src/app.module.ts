import { Module } from '@nestjs/common';
import { GrupeModule } from './grupe/grupe.module.js';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SpecializariModule } from './specializari/specializari.module.js';
import { StudentiModule } from './studenti/studenti.module.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
@Module({
  imports: [PrismaModule, SpecializariModule, GrupeModule, StudentiModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
