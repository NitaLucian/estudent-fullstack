import { useEffect, useState } from 'react'

// Forma răspunsului trimis de GET /api/health (aceeași ca în backend).
interface StareServer {
  status: 'ok'
  aplicatie: string
  versiune: string
  ora: string
}

// Forma răspunsului trimis de GET /api/despre
interface DespreAplicatie {
  aplicatie: string
  descriere: string
  tehnologii: string[]
}

export default function App() {
  const [despre, setDespre] = useState<DespreAplicatie | null>(null)

  // [] = o singură cerere, la prima afișare (datele nu se schimbă)
  useEffect(() => {
    fetch('/api/despre')
      .then((r) => r.json())
      .then(setDespre)
      .catch(() => setDespre(null))
  }, [])

  // Starea componentei: ce a răspuns serverul, eventuala eroare
  // și un contor care crește la fiecare clic pe „Verifică din nou”.
  const [stare, setStare] = useState<StareServer | null>(null)
  const [eroare, setEroare] = useState<string | null>(null)
  const [nrVerificari, setNrVerificari] = useState(0)

  // Efectul rulează după prima afișare și de fiecare dată când se schimbă nrVerificari.
  useEffect(() => {
    async function verifica() {
      try {
        const raspuns = await fetch('/api/health')
        if (!raspuns.ok) throw new Error(`serverul a răspuns cu HTTP ${raspuns.status}`)
        const date: StareServer = await raspuns.json()
        setStare(date)
        setEroare(null)
      } catch (e) {
        setStare(null)
        setEroare(e instanceof Error ? e.message : String(e))
      }
    }
    verifica()
  }, [nrVerificari])

  return (
    <>
      <header className="bara-sus">
        <span className="logo">eStudent</span>
        <span className="subtitlu">evidența studenților</span>
      </header>

      <main className="continut">
        <h1>Bine ați venit!</h1>
        <p>
          Aplicația este formată din două programe care comunică prin HTTP: frontendul
          (React, în browser) și backendul (NestJS, pe server).
        </p>

        <section className="card">
          <h2>Starea serverului</h2>
          {stare && (
            <dl className="detalii">
              <dt>Stare</dt>
              <dd><span className="punct verde" /> {stare.aplicatie} este online</dd>
              <dt>Versiune</dt>
              <dd>{stare.versiune}</dd>
              <dt>Ora serverului</dt>
              <dd>{new Date(stare.ora).toLocaleString('ro-RO')}</dd>
            </dl>
          )}
          {eroare && (
            <p className="mesaj eroare">
              <span className="punct rosu" /> API indisponibil: {eroare}. Porniți backendul
              cu <code>npm run start:dev</code>.
            </p>
          )}
          {!stare && !eroare && <p>Se verifică…</p>}
          <button onClick={() => setNrVerificari(nrVerificari + 1)}>Verifică din nou</button>
        </section>

        {despre && (
          <section className="card">
            <h2>Despre {despre.aplicatie}</h2>
            <p>{despre.descriere}</p>
            <ul>
              {despre.tehnologii.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  )
}
