import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AniModule } from './ani/ani.module.js';
import { valideazaMediul } from './config/variabile-mediu.js';
import { DisciplineModule } from './discipline/discipline.module.js';
import { GrupeModule } from './grupe/grupe.module.js';
import { HealthController } from './health/health.controller.js';
import { InscrieriModule } from './inscrieri/inscrieri.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfesoriModule } from './profesori/profesori.module.js';
import { SpecializariModule } from './specializari/specializari.module.js';
import { StatisticiModule } from './statistici/statistici.module.js';
import { StudentiModule } from './studenti/studenti.module.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
@Module({
  imports: [
    // citește .env, validează variabilele și oferă ConfigService în toată aplicația
    ConfigModule.forRoot({ isGlobal: true, validate: valideazaMediul }),
    PrismaModule,
    AniModule,
    SpecializariModule,
    GrupeModule,
    StudentiModule,
    InscrieriModule,
    DisciplineModule,
    ProfesoriModule,
    StatisticiModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
