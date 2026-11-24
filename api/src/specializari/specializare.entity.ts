// Forma datelor trimise de API pentru specializări.
// Plugin-ul @nestjs/swagger citește tipurile câmpurilor din fișierele *.entity.ts
// și le descrie automat în documentația OpenAPI.

export class Specializare {
  id: number;
  /** Codul scurt, de exemplu CTI */
  cod: string;
  denumire: string;
}

export class NumarGrupe {
  grupe: number;
}

// lista de specializări conține și numărul de grupe al fiecăreia
export class SpecializareCuNumar extends Specializare {
  _count: NumarGrupe;
}
