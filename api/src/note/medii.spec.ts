import { calculeazaMedii, rotunjeste } from './medii.js';

// Teste unitare: verifică o funcție izolată, fără bază de date și fără server.
// describe grupează testele; it descrie un comportament; expect compară rezultatul.
describe('calculeazaMedii', () => {
  it('calculează media aritmetică, media ponderată și creditele', () => {
    const [an] = calculeazaMedii([
      { anUniversitar: '2025-2026', valoare: 10, credite: 6 },
      { anUniversitar: '2025-2026', valoare: 6, credite: 4 },
    ]);
    expect(an.numarNote).toBe(2);
    expect(an.medieAritmetica).toBe(8); // (10 + 6) / 2
    expect(an.mediePonderata).toBe(8.4); // (10·6 + 6·4) / 10
    expect(an.crediteObtinute).toBe(10);
    expect(an.crediteTotale).toBe(10);
  });

  it('nu numără creditele disciplinelor nepromovate (nota sub 5)', () => {
    const [an] = calculeazaMedii([
      { anUniversitar: '2025-2026', valoare: 4, credite: 6 },
      { anUniversitar: '2025-2026', valoare: 5, credite: 5 },
    ]);
    expect(an.crediteObtinute).toBe(5);
  });

  it('separă anii universitari', () => {
    const medii = calculeazaMedii([
      { anUniversitar: '2026-2027', valoare: 9, credite: 5 },
      { anUniversitar: '2025-2026', valoare: 7, credite: 5 },
      { anUniversitar: '2026-2027', valoare: 7, credite: 5 },
    ]);
    expect(medii.map((m) => m.anUniversitar)).toEqual(['2026-2027', '2025-2026']);
    expect(medii[0].medieAritmetica).toBe(8);
  });

  it('întoarce o listă goală când nu există note', () => {
    expect(calculeazaMedii([])).toEqual([]);
  });
});

describe('rotunjeste', () => {
  it('rotunjește la două zecimale', () => {
    expect(rotunjeste(7.416666)).toBe(7.42);
    expect(rotunjeste(7.9)).toBe(7.9);
  });
});
