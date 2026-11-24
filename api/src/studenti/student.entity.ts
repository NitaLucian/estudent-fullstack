import { AnUniversitarScurt } from '../ani/ani.entity.js';

export class SpecializareCod {
  id: number;
  cod: string;
}

// grupa, așa cum apare în datele unui student
export class GrupaStudent {
  id: number;
  cod: string;
  /** Anul de studiu (1–4) */
  an: number;
  specializare: SpecializareCod;
}

export class Student {
  id: number;
  nrMatricol: string;
  nume: string;
  prenume: string;
  email: string;
  dataNasterii: Date | null;
  /** Grupa din anul universitar curent (null dacă nu este înscris) */
  grupa: GrupaStudent | null;
}

export class InscriereStudent {
  id: number;
  anUniversitar: AnUniversitarScurt;
  grupa: GrupaStudent | null;
}

// fișa studentului: și istoricul înscrierilor
export class StudentDetaliu extends Student {
  inscrieri: InscriereStudent[];
}

// o pagină din lista de studenți
export class PaginaStudenti {
  date: Student[];
  total: number;
  pagina: number;
  perPagina: number;
}
