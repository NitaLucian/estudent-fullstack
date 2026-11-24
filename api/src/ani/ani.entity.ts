export class AnStudiu {
  id: number;
  /** 1, 2, 3 sau 4 */
  numar: number;
  denumire: string;
}

export class AnUniversitar {
  id: number;
  /** De exemplu 2026-2027 */
  cod: string;
  dataInceput: Date;
  dataSfarsit: Date;
  curent: boolean;
}

export class NumarInscrieri {
  inscrieri: number;
}

export class AnUniversitarCuNumar extends AnUniversitar {
  _count: NumarInscrieri;
}

// forma scurtă, folosită în alte răspunsuri (înscrieri, predări)
export class AnUniversitarScurt {
  id: number;
  cod: string;
  curent: boolean;
}
