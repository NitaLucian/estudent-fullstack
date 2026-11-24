import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// Clientul Prisma al aplicației. Nest creează o singură instanță
// și o „injectează” în toate serviciile care o cer în constructor.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
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
