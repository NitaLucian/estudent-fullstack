import { Module } from '@nestjs/common';
import { DespreController } from './despre/despre.controller.js';
import { HealthController } from './health/health.controller.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
// Pe măsură ce aplicația crește, aici vom importa modulele noi.
@Module({
  imports: [],
  controllers: [HealthController, DespreController],
  providers: [],
})
export class AppModule {}
