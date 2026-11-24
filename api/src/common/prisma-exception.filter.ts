import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

// Transformă erorile cunoscute ale Prisma în răspunsuri HTTP cu sens,
// în loc de „500 Internal server error”.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const raspuns = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mesaj = 'Eroare la accesul bazei de date';
    switch (e.code) {
      case 'P2002': // încălcarea unei constrângeri UNIQUE
        status = HttpStatus.CONFLICT;
        mesaj = 'Există deja o înregistrare cu acest cod';
        break;
      case 'P2003': // încălcarea unei chei străine (FOREIGN KEY)
        status = HttpStatus.CONFLICT;
        mesaj = 'Înregistrarea este folosită de alte date și nu poate fi ștearsă';
        break;
      case 'P2025': // înregistrarea de modificat sau de șters nu există
        status = HttpStatus.NOT_FOUND;
        mesaj = 'Înregistrarea nu există';
        break;
    }
    raspuns.status(status).json({ statusCode: status, message: mesaj, cod: e.code });
  }
}
