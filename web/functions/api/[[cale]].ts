// Cloudflare Pages Function: rulează pe serverele Cloudflare pentru orice adresă /api/...
// (fișierul [[cale]].ts prinde toate căile de sub /api). Face, în producție, ce face
// proxy-ul lui Vite în dezvoltare: trimite cererea mai departe la backend (API_URL)
// și întoarce răspunsul neschimbat. Pentru browser, frontendul și API-ul au aceeași
// origine, deci cookie-ul SameSite=Strict funcționează și nu este nevoie de CORS.

interface Mediu {
  API_URL: string // de exemplu https://estudent-api.onrender.com (setat în Cloudflare)
}

export async function onRequest({ request, env }: { request: Request; env: Mediu }): Promise<Response> {
  const adresa = new URL(request.url)
  const tinta = new URL(adresa.pathname + adresa.search, env.API_URL)

  const antete = new Headers(request.headers)
  // adresa IP reală a vizitatorului (pentru limitarea cererilor); suprascriem orice
  // X-Forwarded-For trimis de client, ca să nu poată pretinde o altă adresă
  antete.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') ?? '')

  return fetch(tinta, {
    method: request.method,
    headers: antete,
    body: request.body, // null pentru GET; altfel conținutul (JSON, fișiere) trece direct
    redirect: 'manual', // redirecționările (de ex. spre un URL presemnat) ajung la browser
  })
}
