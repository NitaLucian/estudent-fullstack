import { mesajeDin } from '../api/client'
import { useStareServer, useStatistici } from '../api/hooks'

// Pagina de start: starea serverului și a bazei de date.
export default function AcasaPage() {
  // useQuery ne dă direct: datele, eroarea, starea de încărcare și o funcție de reîncărcare
  const { data: stare, error, isFetching, refetch } = useStareServer()
  const { data: statistici } = useStatistici()

  return (
    <>
      <h1>Bine ați venit!</h1>
      <p>
        Aplicația este formată din două programe care comunică prin HTTP: frontendul
        (React, în browser) și backendul (NestJS, pe server). Backendul păstrează datele
        într-o bază de date PostgreSQL.
      </p>

      {statistici && (
        <section className="card">
          <h2>Facultatea în anul {statistici.anCurent}</h2>
          <div className="cifre">
            <div><strong>{statistici.studenti}</strong> studenți</div>
            <div><strong>{statistici.grupe}</strong> grupe</div>
            <div><strong>{statistici.specializari}</strong> specializări</div>
            <div><strong>{statistici.discipline}</strong> discipline</div>
            <div><strong>{statistici.profesori}</strong> profesori</div>
          </div>
        </section>
      )}

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
        {error && (
          <p className="mesaj eroare">
            <span className="punct rosu" /> API indisponibil: {mesajeDin(error).join('; ')}. Porniți backendul
            cu <code>npm run start:dev</code>.
          </p>
        )}
        <button onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? 'Se verifică…' : 'Verifică din nou'}
        </button>
      </section>
    </>
  )
}
