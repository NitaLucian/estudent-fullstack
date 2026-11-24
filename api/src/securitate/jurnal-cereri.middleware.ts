import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

// Jurnalul cererilor: metoda, adresa, codul răspunsului și durata.
// NU scriem în jurnal corpul cererii (parole!), antetele (token-uri!) sau cookie-urile.
@Injectable()
export class JurnalCereriMiddleware implements NestMiddleware {
  private readonly jurnal = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = performance.now();
    // evenimentul „finish” apare după ce răspunsul a fost trimis
    res.on('finish', () => {
      const ms = Math.round(performance.now() - start);
      const text = `${req.method} ${req.originalUrl.split('?')[0]} ${res.statusCode} ${ms}ms`;
      if (res.statusCode >= 500) this.jurnal.error(text);
      else if (res.statusCode >= 400) this.jurnal.warn(text);
      else this.jurnal.log(text);
    });
    next();
  }
}
