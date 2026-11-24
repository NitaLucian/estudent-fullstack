import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

// @Global: PrismaService poate fi injectat în orice modul, fără import explicit.
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
