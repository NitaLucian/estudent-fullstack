import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AniModule } from './ani/ani.module.js';
import { AuthModule } from './auth/auth.module.js';
import { valideazaMediul } from './config/variabile-mediu.js';
import { DisciplineModule } from './discipline/discipline.module.js';
import { EmailModule } from './email/email.module.js';
import { FisiereModule } from './fisiere/fisiere.module.js';
import { GrupeModule } from './grupe/grupe.module.js';
import { HealthController } from './health/health.controller.js';
import { InscrieriModule } from './inscrieri/inscrieri.module.js';
import { NoteModule } from './note/note.module.js';
import { NotificariModule } from './notificari/notificari.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { ProfesoriModule } from './profesori/profesori.module.js';
import { JurnalCereriMiddleware } from './securitate/jurnal-cereri.middleware.js';
import { SecuritateModule } from './securitate/securitate.module.js';
import { RapoarteModule } from './rapoarte/rapoarte.module.js';
import { SpecializariModule } from './specializari/specializari.module.js';
import { StocareModule } from './stocare/stocare.module.js';
import { StudentiModule } from './studenti/studenti.module.js';

// Modulul rădăcină: lista tuturor componentelor aplicației.
@Module({
  imports: [
    // citește .env, validează variabilele și oferă ConfigService în toată aplicația
    ConfigModule.forRoot({ isGlobal: true, validate: valideazaMediul }),
    // evenimentele interne ale aplicației (emit / @OnEvent)
    EventEmitterModule.forRoot(),
    PrismaModule,
    SecuritateModule, // înaintea AuthModule: limitarea cererilor rulează prima
    AuthModule,
    AniModule,
    SpecializariModule,
    GrupeModule,
    StudentiModule,
    InscrieriModule,
    DisciplineModule,
    ProfesoriModule,
    NoteModule,
    RapoarteModule,
    StocareModule,
    FisiereModule,
    EmailModule,
    NotificariModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  // middleware-ul de jurnal se aplică tuturor rutelor
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JurnalCereriMiddleware).forRoutes('*');
  }
}
