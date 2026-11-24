import { ConfigService } from '@nestjs/config';
import nodemailer, { type Transporter } from 'nodemailer';
import { MesajEmail, ServiciuEmail } from './email.js';

// Trimitere prin protocolul SMTP (biblioteca nodemailer).
// Local: Mailpit (localhost:1025). În producție: serverul SMTP al unui furnizor de email.
export class EmailSmtp extends ServiciuEmail {
  private readonly transport: Transporter;
  private readonly expeditor: string;

  constructor(config: ConfigService) {
    super();
    const port = config.get<number>('SMTP_PORT') ?? 1025;
    const utilizator = config.get<string>('SMTP_UTILIZATOR');
    this.expeditor = config.get<string>('EMAIL_EXPEDITOR') ?? 'eStudent <no-reply@estudent.local>';
    this.transport = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST') ?? 'localhost',
      port,
      secure: port === 465, // 465 = conexiune criptată de la început; 587 = STARTTLS
      auth: utilizator ? { user: utilizator, pass: config.get<string>('SMTP_PAROLA') } : undefined,
    });
  }

  async trimite(m: MesajEmail) {
    await this.transport.sendMail({ from: this.expeditor, to: m.catre, subject: m.subiect, text: m.text, html: m.html });
  }
}
