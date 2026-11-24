import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Limitarea numărului de cereri (rate limiting): cel mult LIMITA cereri pe minut
// de la aceeași adresă IP. Rutele sensibile (login, parolă) au limite mai mici,
// date cu @Throttle direct pe metodă. Peste limită, serverul răspunde 429 Too Many Requests.
//
// Modulul este importat în AppModule ÎNAINTEA AuthModule: guard-ul lui rulează primul,
// deci o rafală de cereri este oprită înainte de verificarea token-ului sau a parolei.
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'implicit', ttl: 60_000, limit: Number(process.env.LIMITA_CERERI ?? 300) }],
      errorMessage: 'Prea multe cereri. Încercați din nou peste un minut.',
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class SecuritateModule {}
