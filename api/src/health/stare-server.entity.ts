import { ApiProperty } from '@nestjs/swagger';

// Răspunsul la GET /api/health
export class StareServer {
  @ApiProperty({ enum: ['ok'] })
  status: 'ok';
  aplicatie: string;
  versiune: string;
  /** Momentul răspunsului, în format ISO 8601 */
  ora: string;
  @ApiProperty({ enum: ['conectată', 'indisponibilă'] })
  bazaDeDate: 'conectată' | 'indisponibilă';
}
