import { campCsv, documentCsv } from './csv.js';

describe('campCsv', () => {
  it('lasă neschimbate valorile simple', () => {
    expect(campCsv('Popescu')).toBe('Popescu');
    expect(campCsv(3)).toBe('3');
  });

  it('transformă null într-un câmp gol', () => expect(campCsv(null)).toBe(''));

  it('pune între ghilimele textul cu separator sau rând nou', () => {
    expect(campCsv('a;b')).toBe('"a;b"');
    expect(campCsv('rând\nnou')).toBe('"rând\nnou"');
  });

  it('dublează ghilimelele din text', () => expect(campCsv('zis "Gigi"')).toBe('"zis ""Gigi"""'));

  it('neutralizează formulele (CSV injection)', () => {
    expect(campCsv('=HYPERLINK("http://x.ro")')).toBe(`"'=HYPERLINK(""http://x.ro"")"`);
    expect(campCsv('+40 721')).toBe("'+40 721");
    expect(campCsv('@SUM(A1)')).toBe("'@SUM(A1)");
  });

  it('nu atinge numerele negative (nu vin de la utilizatori)', () => expect(campCsv(-2)).toBe('-2'));
});

describe('documentCsv', () => {
  it('începe cu BOM și separă rândurile prin CRLF', () => {
    const csv = documentCsv([
      ['Nume', 'An'],
      ['Ionescu', 2],
    ]);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe('Nume;An\r\nIonescu;2');
  });
});
