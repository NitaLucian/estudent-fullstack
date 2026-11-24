// Calculul mediilor, separat de baza de date: o funcție „pură” (rezultatul depinde doar
// de parametri, fără efecte), deci ușor de testat cu teste unitare.

export interface NotaCuCredite {
  anUniversitar: string;
  valoare: number;
  credite: number;
}

export interface Medii {
  anUniversitar: string;
  numarNote: number;
  medieAritmetica: number;
  mediePonderata: number;
  crediteObtinute: number;
  crediteTotale: number;
}

// rotunjire la două zecimale
export const rotunjeste = (x: number) => Math.round(x * 100) / 100;

export function calculeazaMedii(note: NotaCuCredite[]): Medii[] {
  // grupăm notele după anul universitar, păstrând ordinea primei apariții
  const peAni = new Map<string, NotaCuCredite[]>();
  for (const n of note) peAni.set(n.anUniversitar, [...(peAni.get(n.anUniversitar) ?? []), n]);

  return [...peAni.entries()].map(([anUniversitar, ale]) => {
    const crediteTotale = ale.reduce((s, n) => s + n.credite, 0);
    return {
      anUniversitar,
      numarNote: ale.length,
      medieAritmetica: rotunjeste(ale.reduce((s, n) => s + n.valoare, 0) / ale.length),
      mediePonderata: crediteTotale ? rotunjeste(ale.reduce((s, n) => s + n.valoare * n.credite, 0) / crediteTotale) : 0,
      crediteObtinute: ale.filter((n) => n.valoare >= 5).reduce((s, n) => s + n.credite, 0),
      crediteTotale,
    };
  });
}
