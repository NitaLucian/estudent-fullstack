import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Clientul Prisma al aplicației. Nest creează o singură instanță
// și o „injectează” în toate serviciile care o cer în constructor.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // adresa bazei de date vine din configurare (ConfigService), nu direct din process.env
  constructor(config: ConfigService) {
    super({
      adapter: new PrismaPg({ connectionString: config.getOrThrow<string>('DATABASE_URL') }),
    });
  }

  // apelată de Nest la pornirea aplicației
  async onModuleInit() {
    await this.$connect();
  }

  // apelată de Nest la oprirea aplicației
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
