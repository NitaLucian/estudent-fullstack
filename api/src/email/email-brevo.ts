import { ConfigService } from '@nestjs/config';
import { MesajEmail, ServiciuEmail } from './email.js';

// Trimitere prin API-ul HTTP al unui furnizor de email (aici Brevo): o cerere POST cu JSON,
// autentificată cu o cheie de API. Mulți furnizori (Resend, Postmark, SendGrid ...)
// funcționează la fel; s-ar schimba doar adresa și forma JSON-ului.
export class EmailBrevo extends ServiciuEmail {
  private readonly cheie: string;
  private readonly adresa: string;
  private readonly expeditor: { name: string; email: string };

  constructor(config: ConfigService) {
    super();
    this.cheie = config.getOrThrow<string>('BREVO_API_KEY');
    this.adresa = config.get<string>('BREVO_URL') ?? 'https://api.brevo.com/v3/smtp/email';
    // „eStudent <no-reply@domeniu.ro>” -> { name: 'eStudent', email: 'no-reply@domeniu.ro' }
    const text = config.get<string>('EMAIL_EXPEDITOR') ?? 'eStudent <no-reply@estudent.local>';
    const [, nume, email] = /^(.*)<(.+)>$/.exec(text) ?? [null, 'eStudent', text];
    this.expeditor = { name: nume.trim(), email: email.trim() };
  }

  async trimite(m: MesajEmail) {
    const raspuns = await fetch(this.adresa, {
      method: 'POST',
      headers: { 'api-key': this.cheie, 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        sender: this.expeditor,
        to: [{ email: m.catre }],
        subject: m.subiect,
        textContent: m.text,
        htmlContent: m.html,
      }),
    });
    if (!raspuns.ok) throw new Error(`Furnizorul de email a răspuns ${raspuns.status}: ${await raspuns.text()}`);
  }
}
