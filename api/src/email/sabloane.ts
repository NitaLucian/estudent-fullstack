import type { MesajEmail } from './email.js';

// Orice text venit din baza de date (nume, denumiri) trece prin escapeHtml înainte să
// ajungă în HTML: un nume ca „<script>…” trebuie afișat ca text, nu interpretat.
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Cadrul comun al emailurilor: antet, conținut, subsol. Stilurile sunt „inline”,
// pentru că mulți clienți de email ignoră foile de stil.
function cadru(titlu: string, continut: string): string {
  return `<!doctype html><html lang="ro"><body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;color:#1f2328">
<div style="max-width:560px;margin:24px auto;background:#fff;border:1px solid #d0d7de;border-radius:10px;overflow:hidden">
<div style="background:#1f4e79;color:#fff;padding:14px 20px;font-size:20px;font-weight:bold">eStudent</div>
<div style="padding:20px"><h1 style="font-size:18px;color:#1f4e79;margin:0 0 12px">${escapeHtml(titlu)}</h1>${continut}</div>
<div style="padding:12px 20px;font-size:12px;color:#59636e;border-top:1px solid #d0d7de">Mesaj trimis automat de aplicația eStudent. Nu răspundeți la acest email.</div>
</div></body></html>`;
}

const buton = (adresa: string, text: string) =>
  `<p><a href="${escapeHtml(adresa)}" style="display:inline-block;background:#1f4e79;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">${escapeHtml(text)}</a></p>`;

export function emailBunVenit(catre: string, nume: string, adresa: string): MesajEmail {
  return {
    catre,
    subiect: 'Bun venit în eStudent',
    text: `Bună, ${nume}!\n\nAți primit un cont în aplicația eStudent. Alegeți-vă parola aici (legătura este valabilă 72 de ore):\n${adresa}\n`,
    html: cadru(
      'Bun venit în eStudent',
      `<p>Bună, ${escapeHtml(nume)}!</p><p>Ați primit un cont în aplicația eStudent. Alegeți-vă parola (legătura este valabilă 72 de ore):</p>${buton(adresa, 'Aleg parola')}`,
    ),
  };
}

export function emailResetareParola(catre: string, nume: string, adresa: string): MesajEmail {
  return {
    catre,
    subiect: 'Resetarea parolei eStudent',
    text: `Bună, ${nume}!\n\nCineva (probabil dumneavoastră) a cerut resetarea parolei. Legătura este valabilă o oră:\n${adresa}\n\nDacă nu ați cerut-o, ignorați acest mesaj: parola rămâne aceeași.\n`,
    html: cadru(
      'Resetarea parolei',
      `<p>Bună, ${escapeHtml(nume)}!</p><p>Cineva (probabil dumneavoastră) a cerut resetarea parolei. Legătura este valabilă o oră:</p>${buton(adresa, 'Aleg o parolă nouă')}<p style="color:#59636e;font-size:13px">Dacă nu ați cerut-o, ignorați acest mesaj: parola rămâne aceeași.</p>`,
    ),
  };
}

export function emailNotaNoua(catre: string, nume: string, disciplina: string, nota: number, adresa: string): MesajEmail {
  return {
    catre,
    subiect: `Notă nouă: ${disciplina}`,
    text: `Bună, ${nume}!\n\nAți primit nota ${nota} la disciplina ${disciplina}.\nSituația școlară: ${adresa}\n`,
    html: cadru(
      'Ați primit o notă nouă',
      `<p>Bună, ${escapeHtml(nume)}!</p><p>La disciplina <strong>${escapeHtml(disciplina)}</strong> ați primit nota <strong style="font-size:20px">${nota}</strong>.</p>${buton(adresa, 'Situația școlară')}`,
    ),
  };
}
