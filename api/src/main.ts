import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureazaAplicatia } from './configurare.js';

// Punctul de pornire al serverului: construiește aplicația din modulul rădăcină,
// o configurează și o pune să asculte cereri HTTP pe un port.
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureazaAplicatia(app);

  // Documentația OpenAPI: pagina /api/docs și descrierea JSON /api/docs-json.
  const config = new DocumentBuilder()
    .setTitle('eStudent API')
    .setDescription('API-ul aplicației de evidență a studenților')
    .setVersion('1.0.0')
    .addBearerAuth() // butonul „Authorize” din Swagger UI: token-ul JWT
    .addSecurityRequirements('bearer')
    .build();
  SwaggerModule.setup('api/docs', app, () => SwaggerModule.createDocument(app, config));

  const port = app.get(ConfigService).get<number>('PORT') ?? 3000;
  await app.listen(port);
  console.log(`eStudent API ascultă pe http://localhost:${port}/api (documentația: /api/docs)`);
}
await bootstrap();
