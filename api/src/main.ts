import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// Punctul de pornire al serverului: construiește aplicația din modulul rădăcină
// și o pune să asculte cereri HTTP pe un port.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Toate rutele API încep cu /api (ex.: /api/health). Așa le deosebim
  // ușor de paginile frontendului.
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`eStudent API ascultă pe http://localhost:${port}/api`);
}
await bootstrap();
