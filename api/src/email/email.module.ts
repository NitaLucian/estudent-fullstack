import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailBrevo } from './email-brevo.js';
import { EmailSmtp } from './email-smtp.js';
import { ServiciuEmail } from './email.js';

// Provider „fabrică”: implementarea se alege LA PORNIRE, după variabila EMAIL_FURNIZOR.
// Restul aplicației cere doar `ServiciuEmail` și nu știe (și nici nu-i pasă) care este.
@Global()
@Module({
  providers: [
    {
      provide: ServiciuEmail,
      inject: [ConfigService],
      useFactory: (config: ConfigService): ServiciuEmail =>
        config.get('EMAIL_FURNIZOR') === 'brevo' ? new EmailBrevo(config) : new EmailSmtp(config),
    },
  ],
  exports: [ServiciuEmail],
})
export class EmailModule {}
