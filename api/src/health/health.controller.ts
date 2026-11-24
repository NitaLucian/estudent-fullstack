import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/auth.decorators.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { StareServer } from './stare-server.entity.js';

// GET /api/health – starea serverului și a conexiunii la baza de date
@ApiTags('health')
@Public() // starea serverului poate fi verificată fără autentificare
@Controller('health')
export class HealthController {
  // Nest „injectează” automat PrismaService: nu scriem nicăieri new PrismaService()
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async verifica(): Promise<StareServer> {
    let bazaDeDate: StareServer['bazaDeDate'] = 'conectată';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      bazaDeDate = 'indisponibilă';
    }
    return {
      status: 'ok',
      aplicatie: 'eStudent API',
      versiune: '0.12.0',
      ora: new Date().toISOString(),
      bazaDeDate,
    };
  }
}
