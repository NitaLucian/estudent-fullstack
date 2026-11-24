import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
// Pe măsură ce aplicația crește, aici vom importa modulele noi.
@Module({
  imports: [],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
