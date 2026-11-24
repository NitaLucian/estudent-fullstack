import { useEffect, useState } from 'react'
import { citeste } from '../api'
import type { StareServer } from '../tipuri'

// Pagina de start: starea serverului și a bazei de date.
export default function AcasaPage() {
  const [stare, setStare] = useState<StareServer | null>(null)
  const [eroare, setEroare] = useState<string | null>(null)
  const [nrVerificari, setNrVerificari] = useState(0)

  useEffect(() => {
    citeste<StareServer>('/api/health')
      .then((date) => {
        setStare(date)
        setEroare(null)
      })
      .catch((e: Error) => {
        setStare(null)
        setEroare(e.message)
      })
  }, [nrVerificari])

  return (
    <>
      <h1>Bine ați venit!</h1>
      <p>
        Aplicația este formată din două programe care comunică prin HTTP: frontendul
        (React, în browser) și backendul (NestJS, pe server). Backendul păstrează datele
        într-o bază de date PostgreSQL.
      </p>

      <section className="card">
        <h2>Starea serverului</h2>
        {stare && (
          <dl className="detalii">
            <dt>Stare</dt>
            <dd><span className="punct verde" /> {stare.aplicatie} este online</dd>
            <dt>Baza de date</dt>
            <dd>
              <span className={stare.bazaDeDate === 'conectată' ? 'punct verde' : 'punct rosu'} />{' '}
              {stare.bazaDeDate}
            </dd>
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
    </>
  )
}
