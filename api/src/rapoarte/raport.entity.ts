// Răspunsurile rapoartelor

export class NumarNote {
  /** Nota (1–10) */
  valoare: number;
  /** Câți studenți au primit această notă */
  numar: number;
}

export class PromovabilitateDisciplina {
  disciplinaId: number;
  cod: string;
  denumire: string;
  numarNote: number;
  medie: number;
  promovati: number;
  /** Procentul notelor de cel puțin 5 */
  procent: number;
}

export class LocClasament {
  /** Locul în clasamentul specializării și anului (RANK) */
  loc: number;
  studentId: number;
  nrMatricol: string;
  nume: string;
  prenume: string;
  grupa: string;
  specializare: string;
  an: number;
  numarNote: number;
  medieAritmetica: number | null;
  mediePonderata: number | null;
  crediteObtinute: number;
  restante: number;
}
