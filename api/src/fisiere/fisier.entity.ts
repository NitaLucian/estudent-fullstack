export class DocumentStudent {
  id: number;
  nume: string;
  tip: string;
  /** Mărimea, în octeți */
  marime: number;
  incarcatLa: Date;
}

// O adresă temporară (presemnată) de la care browserul descarcă direct fișierul
export class AdresaFisier {
  url: string;
  /** Câte secunde mai este valabilă adresa */
  expiraIn: number;
}
