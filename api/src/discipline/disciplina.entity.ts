import { ApiProperty } from '@nestjs/swagger';
import { GradDidactic } from '../generated/prisma/client.js';

export class SpecializareScurta {
  id: number;
  cod: string;
}

export class AnStudiuScurt {
  id: number;
  numar: number;
}

export class ProfesorScurt {
  id: number;
  nume: string;
  prenume: string;
  @ApiProperty({ enum: GradDidactic, enumName: 'GradDidactic' })
  grad: GradDidactic;
}

export class PredareDisciplina {
  id: number;
  profesor: ProfesorScurt;
}

export class Disciplina {
  id: number;
  cod: string;
  denumire: string;
  credite: number;
  /** 1 sau 2 */
  semestru: number;
  specializareId: number;
  anStudiuId: number;
  specializare: SpecializareScurta;
  anStudiu: AnStudiuScurt;
  /** Profesorii disciplinei în anul universitar curent */
  predari: PredareDisciplina[];
}
