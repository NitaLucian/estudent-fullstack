import { Controller, Get } from '@nestjs/common';

// Forma răspunsului: ce câmpuri trimite serverul și de ce tip sunt.
export interface StareServer {
  status: 'ok';
  aplicatie: string;
  versiune: string;
  ora: string;
}

// Un controller primește cereri HTTP. Prefixul 'health' + prefixul global 'api'
// dau ruta completă: GET /api/health
@Controller('health')
export class HealthController {
  @Get()
  verifica(): StareServer {
    return {
      status: 'ok',
      aplicatie: 'eStudent API',
      versiune: '0.1.0',
      ora: new Date().toISOString(),
    };
  }
}
