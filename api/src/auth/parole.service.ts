import { BadRequestException, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as argon2 from 'argon2';
import { ScopToken } from '../generated/prisma/client.js';
import { PAROLA_CERUTA, ParolaCeruta } from '../notificari/evenimente.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { amprenta, tokenAleator } from './amprenta.js';

const ORE: Record<ScopToken, number> = { SETARE: 72, RESETARE: 1 };

@Injectable()
export class ParoleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evenimente: EventEmitter2,
  ) {}

  // Un token nou pentru setarea / resetarea parolei. Întoarcem tokenul (pentru email),
  // dar salvăm doar amprenta lui.
  async creeazaToken(utilizatorId: number, scop: ScopToken): Promise<string> {
    const token = tokenAleator();
    await this.prisma.tokenParola.create({
      data: {
        utilizatorId,
        scop,
        tokenHash: amprenta(token),
        expiraLa: new Date(Date.now() + ORE[scop] * 60 * 60 * 1000),
      },
    });
    return token;
  }

  // „Am uitat parola”. Răspunsul către client este ACELAȘI indiferent dacă emailul
  // există sau nu: altfel formularul ar spune oricui ce adrese au cont.
  async cereResetare(email: string) {
    const u = await this.prisma.utilizator.findUnique({
      where: { email: email.toLowerCase() },
      include: { student: true, profesor: true },
    });
    if (!u || !u.activ) return;
    // tokenurile de resetare cerute anterior și nefolosite devin invalide
    await this.prisma.tokenParola.updateMany({
      where: { utilizatorId: u.id, scop: 'RESETARE', folositLa: null },
      data: { folositLa: new Date() },
    });
    const token = await this.creeazaToken(u.id, 'RESETARE');
    const persoana = u.student ?? u.profesor;
    const nume = persoana ? `${persoana.prenume} ${persoana.nume}` : 'Administrator';
    this.evenimente.emit(PAROLA_CERUTA, new ParolaCeruta(u.email, nume, token));
  }

  // Parola nouă, aleasă din legătura primită pe email. Tokenul se folosește o singură dată.
  async seteazaParola(token: string, parola: string) {
    const t = await this.prisma.tokenParola.findUnique({ where: { tokenHash: amprenta(token) } });
    if (!t || t.folositLa || t.expiraLa < new Date()) {
      throw new BadRequestException('Legătura nu este validă sau a expirat. Cereți una nouă.');
    }
    const parolaHash = await argon2.hash(parola);
    await this.prisma.$transaction([
      this.prisma.utilizator.update({ where: { id: t.utilizatorId }, data: { parolaHash } }),
      this.prisma.tokenParola.update({ where: { id: t.id }, data: { folositLa: new Date() } }),
      // cine avea o sesiune deschisă cu parola veche este deconectat
      this.prisma.sesiuneRefresh.updateMany({
        where: { utilizatorId: t.utilizatorId, revocataLa: null },
        data: { revocataLa: new Date() },
      }),
    ]);
  }
}
