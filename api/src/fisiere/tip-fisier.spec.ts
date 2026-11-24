import { numeSigur, tipDupaContinut } from './tip-fisier.js';

describe('tipDupaContinut', () => {
  it('recunoaște un PNG după semnătură', () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
    expect(tipDupaContinut(png)).toEqual({ tip: 'image/png', extensie: 'png' });
  });

  it('recunoaște un PDF', () => {
    expect(tipDupaContinut(Buffer.from('%PDF-1.7\n...'))?.tip).toBe('application/pdf');
  });

  it('respinge un fișier text, oricum s-ar numi', () => {
    expect(tipDupaContinut(Buffer.from('<html><script>alert(1)</script></html>'))).toBeNull();
  });
});

describe('numeSigur', () => {
  it('elimină căile din nume', () => {
    expect(numeSigur('../../etc/passwd')).toBe('passwd');
    expect(numeSigur('C:\\Users\\ana\\adeverinta.pdf')).toBe('adeverinta.pdf');
  });

  it('înlocuiește caracterele interzise și păstrează diacriticele', () => {
    expect(numeSigur('notă: "finală"?.pdf')).toBe('notă_ _finală__.pdf');
  });

  it('nu întoarce niciodată un nume gol', () => {
    expect(numeSigur('')).toBe('fisier');
  });
});
