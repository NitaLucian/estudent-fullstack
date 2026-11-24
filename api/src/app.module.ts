import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { SpecializariModule } from './specializari/specializari.module.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
@Module({
  imports: [PrismaModule, SpecializariModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
