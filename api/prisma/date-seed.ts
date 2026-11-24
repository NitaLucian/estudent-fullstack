// Listele din care seed-ul construiește date de test realiste.

// Parola tuturor conturilor de test (folosită și de testele e2e). DOAR pentru dezvoltare:
// o bază de date reală nu primește niciodată conturi cu parole cunoscute.
export const PAROLA_DEMO = 'eStudent2027!';

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

// textul fără diacritice, cu litere mici (pentru adresele de email):
// normalize('NFD') desparte „ă” în „a” + semnul „˘”, iar \p{M} (orice semn diacritic) le elimină
export function faraDiacritice(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export const aniStudiu = [
  { numar: 1, denumire: 'Anul I' },
  { numar: 2, denumire: 'Anul II' },
  { numar: 3, denumire: 'Anul III' },
  { numar: 4, denumire: 'Anul IV' },
];

// Doi ani universitari: cel trecut (pentru istoric) și cel curent, calculați față de AN_INCEPUT.
const anUniversitar = (inceput: number, curent: boolean) => ({
  cod: `${inceput}-${inceput + 1}`, // de exemplu 2028-2029
  dataInceput: new Date(Date.UTC(inceput, 9, 1)), // 1 octombrie
  dataSfarsit: new Date(Date.UTC(inceput + 1, 8, 30)), // 30 septembrie
  curent,
});
export const anTrecut = anUniversitar(AN_INCEPUT - 1, false);
export const anCurent = anUniversitar(AN_INCEPUT, true);
export const aniUniversitari = [anTrecut, anCurent];

// Planul de învățământ (simplificat): aceleași denumiri pentru toate specializările.
// planInvatamant[an - 1][semestru - 1] = lista disciplinelor; creditele sunt pe aceeași poziție în CREDITE.
export const planInvatamant: string[][][] = [
  [
    ['Analiză matematică', 'Algebră liniară', 'Programarea calculatoarelor', 'Fizică', 'Limba engleză I'],
    ['Matematici speciale', 'Structuri de date', 'Electrotehnică', 'Grafică asistată', 'Limba engleză II'],
  ],
  [
    ['Programare orientată pe obiecte', 'Baze de date', 'Circuite electronice', 'Metode numerice', 'Comunicare profesională'],
    ['Proiectarea algoritmilor', 'Sisteme de operare', 'Teoria sistemelor', 'Microprocesoare', 'Economie'],
  ],
  [
    ['Rețele de calculatoare', 'Ingineria programării', 'Prelucrarea semnalelor', 'Inteligență artificială', 'Electronică de putere'],
    ['Aplicații web', 'Securitatea informației', 'Sisteme încorporate', 'Grafică pe calculator', 'Management'],
  ],
  [
    ['Sisteme distribuite', 'Cloud computing', 'Proiectare asistată', 'Disciplină opțională I', 'Disciplină opțională II'],
    ['Calitatea produselor software', 'Proiect de diplomă', 'Etică profesională', 'Disciplină opțională III', 'Antreprenoriat'],
  ],
];
export const CREDITE = [7, 6, 6, 6, 5]; // 30 de credite pe semestru

export const profesori: { nume: string; prenume: string; grad: 'ASISTENT' | 'LECTOR' | 'CONFERENTIAR' | 'PROFESOR' }[] = [
  { nume: 'Andrei', prenume: 'Mihaela', grad: 'PROFESOR' },
  { nume: 'Bălan', prenume: 'Victor', grad: 'PROFESOR' },
  { nume: 'Cazacu', prenume: 'Dan', grad: 'PROFESOR' },
  { nume: 'Dobre', prenume: 'Laura', grad: 'CONFERENTIAR' },
  { nume: 'Enache', prenume: 'Sorin', grad: 'CONFERENTIAR' },
  { nume: 'Filip', prenume: 'Corina', grad: 'CONFERENTIAR' },
  { nume: 'Grigore', prenume: 'Paul', grad: 'CONFERENTIAR' },
  { nume: 'Hagiu', prenume: 'Monica', grad: 'LECTOR' },
  { nume: 'Iordache', prenume: 'Florin', grad: 'LECTOR' },
  { nume: 'Jitaru', prenume: 'Oana', grad: 'LECTOR' },
  { nume: 'Lazăr', prenume: 'Cosmin', grad: 'LECTOR' },
  { nume: 'Manole', prenume: 'Adina', grad: 'LECTOR' },
  { nume: 'Neculai', prenume: 'Eugen', grad: 'LECTOR' },
  { nume: 'Olaru', prenume: 'Simona', grad: 'LECTOR' },
  { nume: 'Pavel', prenume: 'Lucian', grad: 'ASISTENT' },
  { nume: 'Rotaru', prenume: 'Iulia', grad: 'ASISTENT' },
  { nume: 'Sandu', prenume: 'Marius', grad: 'ASISTENT' },
  { nume: 'Tănase', prenume: 'Roxana', grad: 'ASISTENT' },
  { nume: 'Ursu', prenume: 'Claudiu', grad: 'ASISTENT' },
  { nume: 'Vasilescu', prenume: 'Anca', grad: 'ASISTENT' },
];
