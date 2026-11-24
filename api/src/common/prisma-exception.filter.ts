import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import { Prisma } from '../generated/prisma/client.js';

// numele prietenoase ale coloanelor cu valori unice
const DENUMIRI: Record<string, string> = {
  cod: 'cod',
  email: 'adresa de email',
  nr_matricol: 'numărul matricol',
};

// Din numele constrângerii („studenti_email_key”) aflăm coloana („email”).
function coloanaDuplicata(e: Prisma.PrismaClientKnownRequestError): string | undefined {
  const cauza = (e.meta?.driverAdapterError as { cause?: { constraint?: { index?: string }; table?: string } })?.cause;
  const index = cauza?.constraint?.index;
  if (!index || !cauza?.table) return undefined;
  return index.replace(`${cauza.table}_`, '').replace(/_key$/, '');
}

// Transformă erorile cunoscute ale Prisma în răspunsuri HTTP cu sens,
// în loc de „500 Internal server error”.
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(e: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const raspuns = host.switchToHttp().getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mesaj = 'Eroare la accesul bazei de date';
    switch (e.code) {
      case 'P2002': { // încălcarea unei constrângeri UNIQUE
        status = HttpStatus.CONFLICT;
        const coloana = coloanaDuplicata(e);
        mesaj = coloana
          ? `Există deja o înregistrare cu aceeași valoare pentru ${DENUMIRI[coloana] ?? coloana}`
          : 'Există deja o înregistrare cu aceeași valoare';
        break;
      }
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
