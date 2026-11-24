import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Forma răspunsului: ce câmpuri trimite serverul și de ce tip sunt.
export interface StareServer {
  status: 'ok';
  aplicatie: string;
  versiune: string;
  ora: string;
  bazaDeDate: 'conectată' | 'indisponibilă';
}

// GET /api/health – starea serverului și a conexiunii la baza de date
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
      versiune: '0.5.0',
      ora: new Date().toISOString(),
      bazaDeDate,
    };
  }
}
