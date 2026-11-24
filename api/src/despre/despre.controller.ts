import { Controller, Get } from '@nestjs/common';

export interface DespreAplicatie {
  aplicatie: string;
  descriere: string;
  tehnologii: string[];
}

// GET /api/despre – informații fixe despre aplicație
@Controller('despre')
export class DespreController {
  @Get()
  despre(): DespreAplicatie {
    return {
      aplicatie: 'eStudent',
      descriere: 'Evidența studenților, a grupelor și a notelor',
      tehnologii: ['NestJS', 'React', 'Vite', 'TypeScript'],
    };
  }
}
