// Tipul real al unui fișier, după primii octeți ai conținutului („semnătura” formatului).
// NU ne bazăm pe extensie sau pe tipul declarat de browser: ambele pot fi falsificate
// (un fișier „poza.jpg” poate fi, de fapt, un program sau o pagină HTML).
const SEMNATURI: { tip: string; extensie: string; octeti: number[]; dela?: number }[] = [
  { tip: 'image/jpeg', extensie: 'jpg', octeti: [0xff, 0xd8, 0xff] },
  { tip: 'image/png', extensie: 'png', octeti: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { tip: 'application/pdf', extensie: 'pdf', octeti: [0x25, 0x50, 0x44, 0x46, 0x2d] }, // „%PDF-”
  { tip: 'image/webp', extensie: 'webp', octeti: [0x57, 0x45, 0x42, 0x50], dela: 8 }, // „WEBP” după antetul RIFF
];

export function tipDupaContinut(continut: Buffer): { tip: string; extensie: string } | null {
  for (const s of SEMNATURI) {
    const start = s.dela ?? 0;
    if (s.octeti.every((b, i) => continut[start + i] === b)) return { tip: s.tip, extensie: s.extensie };
  }
  return null;
}

// Un nume de fișier sigur pentru afișare și descărcare: fără căi („../”), fără caractere
// de control (codurile 0–31) și fără caracterele interzise în numele de fișiere pe Windows.
const INTERZISE = '"<>|:*?';
export function numeSigur(nume: string): string {
  const doarNumele = nume.split(/[\\/]/).pop() ?? '';
  const curat = doarNumele
    .split('')
    .map((c) => (c.charCodeAt(0) < 32 || INTERZISE.includes(c) ? '_' : c))
    .join('')
    .slice(0, 150);
  return curat || 'fisier';
}
