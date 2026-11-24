import 'dotenv/config'; // primul import: încarcă variabilele din .env (DATABASE_URL, PORT)
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';

// Punctul de pornire al serverului: construiește aplicația din modulul rădăcină
// și o pune să asculte cereri HTTP pe un port.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Toate rutele API încep cu /api (ex.: /api/health).
  app.setGlobalPrefix('api');

  // Validează automat corpul fiecărei cereri după regulile din clasele DTO:
  //  whitelist            – elimină câmpurile care nu apar în DTO
  //  forbidNonWhitelisted – ... sau, mai strict, respinge cererea care le conține
  //  transform            – transformă JSON-ul primit într-un obiect al clasei DTO
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Erorile bazei de date devin răspunsuri HTTP clare (409, 404 ...)
  app.useGlobalFilters(new PrismaExceptionFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`eStudent API ascultă pe http://localhost:${port}/api`);
}
await bootstrap();
