import { ApiProperty } from '@nestjs/swagger';
import { AnUniversitarScurt } from '../ani/ani.entity.js';
import { GradDidactic } from '../generated/prisma/client.js';

export class Profesor {
  id: number;
  nume: string;
  prenume: string;
  email: string;
  // enum-ul generat de Prisma trebuie declarat explicit, ca să apară în documentație
  @ApiProperty({ enum: GradDidactic, enumName: 'GradDidactic' })
  grad: GradDidactic;
}

export class NumarPredari {
  predari: number;
}

export class ProfesorCuNumar extends Profesor {
  /** Disciplinele predate în anul universitar curent */
  _count: NumarPredari;
}

export class Predare {
  id: number;
  profesorId: number;
  disciplinaId: number;
  anUniversitarId: number;
}

export class CodSimplu {
  cod: string;
}

export class NumarAn {
  numar: number;
}

export class DisciplinaPredata {
  id: number;
  cod: string;
  denumire: string;
  credite: number;
  semestru: number;
  specializare: CodSimplu;
  anStudiu: NumarAn;
}

export class PredareProfesor extends Predare {
  disciplina: DisciplinaPredata;
  anUniversitar: AnUniversitarScurt;
}

export class ProfesorDetaliu extends Profesor {
  predari: PredareProfesor[];
}
