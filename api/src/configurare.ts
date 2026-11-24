import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { PrismaExceptionFilter } from './common/prisma-exception.filter.js';
import { doarPrinProxy } from './securitate/proxy.js';

// Configurarea comună a aplicației, folosită de main.ts ȘI de testele e2e:
// testele verifică exact aplicația care rulează în producție, nu o variantă a ei.
export function configureazaAplicatia(app: NestExpressApplication) {
  // Antete HTTP de securitate (Helmet): interzic încadrarea paginii în alte site-uri,
  // ghicirea tipului de conținut, scurgerea adresei în Referer etc.
  app.use(helmet());

  // În spatele unor proxy-uri (Cloudflare și platforma de găzduire, în producție),
  // adresa IP reală a clientului vine în antetul X-Forwarded-For. Limitarea cererilor
  // pe IP are nevoie de ea; TRUST_PROXY spune CÂTE proxy-uri de încredere sunt în față.
  // Implicit 0: antetul este ignorat. Altfel, oricine apelează serverul direct ar putea
  // pretinde, cu un X-Forwarded-For inventat, că vine de la altă adresă la fiecare cerere.
  app.set('trust proxy', Number(process.env.TRUST_PROXY ?? 0));

  // în producție: doar cererile venite prin proxy-ul Cloudflare (vezi securitate/proxy.ts)
  const secretProxy = process.env.PROXY_SECRET;
  if (secretProxy) app.use(doarPrinProxy(secretProxy));

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());
}
