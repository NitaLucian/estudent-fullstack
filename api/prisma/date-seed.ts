// Listele din care seed-ul construiește date de test realiste.

// Anul universitar începe la 1 octombrie. Datele de test se raportează la data rulării seed-ului,
// nu la un an fix: în noiembrie 2028, de exemplu, anul universitar curent este 2028-2029.
// getMonth() numără lunile de la 0, deci 9 înseamnă octombrie.
const azi = new Date();
export const AN_INCEPUT = azi.getMonth() >= 9 ? azi.getFullYear() : azi.getFullYear() - 1;

export const specializari = [
  { cod: 'CTI', denumire: 'Calculatoare și tehnologia informației' },
  { cod: 'AIA', denumire: 'Automatică și informatică aplicată' },
  { cod: 'IE', denumire: 'Inginerie electrică' },
  { cod: 'EA', denumire: 'Electronică aplicată' },
  { cod: 'IEC', denumire: 'Inginerie economică' },
];

// Câte grupe are fiecare specializare în fiecare an de studiu (anii 1–4).
export const grupePeAn: Record<string, number[]> = {
  CTI: [3, 3, 2, 2],
  AIA: [2, 2, 2, 1],
  IE: [2, 1, 1, 1],
  EA: [1, 1, 1, 1],
  IEC: [1, 1, 1, 1],
};

export const numeFamilie = [
  'Popescu', 'Ionescu', 'Popa', 'Pop', 'Radu', 'Dumitru', 'Stan', 'Stoica', 'Gheorghe', 'Matei',
  'Ciobanu', 'Rusu', 'Munteanu', 'Constantin', 'Mihai', 'Florea', 'Ilie', 'Moldovan', 'Lungu', 'Toma',
  'Marin', 'Tudor', 'Barbu', 'Nistor', 'Zamfir', 'Dinu', 'Cristea', 'Neagu', 'Ungureanu', 'Avram',
];
export const prenumeFete = [
  'Ana', 'Maria', 'Ioana', 'Elena', 'Andreea', 'Alexandra', 'Diana', 'Cristina', 'Raluca', 'Bianca',
  'Teodora', 'Irina', 'Ștefania', 'Larisa', 'Daria',
];
export const prenumeBaieti = [
  'Andrei', 'Alexandru', 'Mihai', 'Ștefan', 'Ion', 'Gabriel', 'Darius', 'Matei', 'Radu', 'Tudor',
  'Vlad', 'Cristian', 'Răzvan', 'Bogdan', 'Ilie',
];

// Generator de numere pseudo-aleatoare cu sămânță fixă: la fiecare rulare
// seed-ul produce exact aceleași date (aceleași nume, în aceleași grupe).
export function generator(samanta: number) {
  let s = samanta;
  return function urmatorul(): number {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296; // un număr între 0 și 1
  };
}

// textul fără diacritice, cu litere mici (pentru adresele de email)
export function faraDiacritice(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
