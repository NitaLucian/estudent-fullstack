// Funcții pure pentru fișierele CSV (separate de serviciu ca să poată fi testate unitar).

// Injecția de formule (CSV injection): o celulă care începe cu = + - @ este interpretată
// de Excel ca formulă. Un nume „=HYPERLINK(...)” introdus de un utilizator ar deveni un
// link activ în fișierul descărcat de administrator. Prefixăm astfel de texte cu un apostrof,
// ca Excel să le afișeze ca text.
const INCEPUT_PERICULOS = /^[=+\-@\t\r]/;

// Un câmp CSV: între ghilimele dacă conține separatorul, ghilimele sau rând nou
export function campCsv(valoare: string | number | null): string {
  if (valoare === null) return '';
  let text = String(valoare);
  if (typeof valoare === 'string' && INCEPUT_PERICULOS.test(text)) text = `'${text}`;
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Documentul întreg: „;” ca separator (Excel în română), rânduri terminate cu CRLF și
// BOM la început, ca diacriticele să fie citite corect
export function documentCsv(randuri: (string | number | null)[][]): string {
  const BOM = String.fromCharCode(0xfeff);
  return BOM + randuri.map((r) => r.map(campCsv).join(';')).join('\r\n');
}
