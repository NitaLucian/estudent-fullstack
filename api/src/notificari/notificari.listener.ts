import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { MesajEmail, ServiciuEmail } from '../email/email.js';
import { emailBunVenit, emailNotaNoua, emailResetareParola } from '../email/sabloane.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CONT_CREAT, ContCreat, NOTA_SALVATA, NotaSalvata, PAROLA_CERUTA, ParolaCeruta } from './evenimente.js';

// Ascultă evenimentele și trimite emailurile. { async: true }: metoda rulează după ce
// cererea HTTP a primit deja răspuns – utilizatorul nu așteaptă trimiterea emailului.
@Injectable()
export class NotificariListener {
  private readonly jurnal = new Logger(NotificariListener.name);
  private readonly aplicatie: string;

  constructor(
    private readonly email: ServiciuEmail,
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.aplicatie = config.get<string>('APP_URL') ?? 'http://localhost:5173';
  }

  @OnEvent(CONT_CREAT, { async: true })
  async contCreat(e: ContCreat) {
    await this.trimite(emailBunVenit(e.email, e.nume, `${this.aplicatie}/parola-noua?token=${e.token}`));
  }

  @OnEvent(PAROLA_CERUTA, { async: true })
  async parolaCeruta(e: ParolaCeruta) {
    await this.trimite(emailResetareParola(e.email, e.nume, `${this.aplicatie}/parola-noua?token=${e.token}`));
  }

  @OnEvent(NOTA_SALVATA, { async: true })
  async notaSalvata(e: NotaSalvata) {
    const [inscriere, disciplina] = await Promise.all([
      this.prisma.inscriere.findUniqueOrThrow({ where: { id: e.inscriereId }, include: { student: true } }),
      this.prisma.disciplina.findUniqueOrThrow({ where: { id: e.disciplinaId } }),
    ]);
    const s = inscriere.student;
    await this.trimite(
      emailNotaNoua(s.email, `${s.prenume} ${s.nume}`, disciplina.denumire, e.valoare, `${this.aplicatie}/studenti/${s.id}/note`),
    );
  }

  // O eroare la trimitere NU trebuie să afecteze aplicația: o notăm în jurnal.
  private async trimite(mesaj: MesajEmail) {
    try {
      await this.email.trimite(mesaj);
      this.jurnal.log(`Email trimis către ${mesaj.catre}: ${mesaj.subiect}`);
    } catch (eroare) {
      this.jurnal.error(`Emailul către ${mesaj.catre} nu a putut fi trimis: ${(eroare as Error).message}`);
    }
  }
}
