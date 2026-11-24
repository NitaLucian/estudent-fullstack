import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';

// Punctul de pornire al serverului: construiește aplicația din modulul rădăcină
// și o pune să asculte cereri HTTP pe un port.
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Toate rutele API încep cu /api (ex.: /api/health).
  app.setGlobalPrefix('api');

  // citește cookie-urile cererii în req.cookies (refresh token-ul)
  app.use(cookieParser());

  // Validează automat corpul fiecărei cereri după regulile din clasele DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  // Erorile bazei de date devin răspunsuri HTTP clare (409, 404 ...)
  app.useGlobalFilters(new PrismaExceptionFilter());

  // Documentația OpenAPI: pagina /api/docs și descrierea JSON /api/docs-json.
  // Din descrierea JSON, frontendul își generează tipurile (npm run api:tipuri).
  const config = new DocumentBuilder()
    .setTitle('eStudent API')
    .setDescription('API-ul aplicației de evidență a studenților')
    .setVersion('0.10.0')
    .addBearerAuth() // butonul „Authorize” din Swagger UI: token-ul JWT
    .addSecurityRequirements('bearer')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config));

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`eStudent API ascultă pe http://localhost:${port}/api (documentația: /api/docs)`);
}
await bootstrap();
