// Forma răspunsurilor modulului de note

export class NotaScurta {
  id: number;
  /** 1–10 */
  valoare: number;
  /** Data examenului */
  data: Date;
  modificatLa: Date;
}

export class StudentCatalog {
  id: number;
  nrMatricol: string;
  nume: string;
  prenume: string;
}

export class RandCatalog {
  inscriereId: number;
  grupa: string;
  student: StudentCatalog;
  nota: NotaScurta | null;
}

export class DisciplinaCatalog {
  id: number;
  cod: string;
  denumire: string;
  credite: number;
  semestru: number;
  specializare: string;
  an: number;
}

// Catalogul unei discipline în anul universitar curent
export class Catalog {
  disciplina: DisciplinaCatalog;
  anUniversitar: string;
  randuri: RandCatalog[];
}

export class NotaStudent {
  id: number;
  valoare: number;
  data: Date;
  anUniversitar: string;
  disciplina: DisciplinaCatalog;
}

export class MedieAn {
  anUniversitar: string;
  numarNote: number;
  /** Media aritmetică a notelor */
  medieAritmetica: number;
  /** Media ponderată cu creditele: suma(notă × credite) / suma(credite) */
  mediePonderata: number;
  /** Creditele disciplinelor promovate (notă cel puțin 5) */
  crediteObtinute: number;
  crediteTotale: number;
}

// Situația școlară a unui student: toate notele și mediile pe ani
export class SituatieScolara {
  student: StudentCatalog;
  note: NotaStudent[];
  medii: MedieAn[];
}
