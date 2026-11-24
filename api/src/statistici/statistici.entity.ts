// Răspunsul la GET /api/statistici
export class Statistici {
  /** Codul anului universitar curent */
  anCurent: string;
  /** Studenții înscriși în anul curent */
  studenti: number;
  grupe: number;
  specializari: number;
  discipline: number;
  profesori: number;
}
