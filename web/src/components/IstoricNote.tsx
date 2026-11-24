import { useState } from 'react'
import { useIstoricNote } from '../api/hooks'

// Istoricul modificărilor din catalog, afișat la cerere
export default function IstoricNote({ disciplinaId }: { disciplinaId: number }) {
  const [deschis, setDeschis] = useState(false)
  const { data: istoric = [], isFetching } = useIstoricNote(disciplinaId, deschis)

  const valoare = (v: number | null) => (v === null ? '–' : v)

  return (
    <section className="card">
      <div className="titlu-pagina">
        <h2>Istoricul modificărilor</h2>
        <button className="mic secundar" onClick={() => setDeschis(!deschis)}>{deschis ? 'Ascunde' : 'Arată'}</button>
      </div>
      {deschis && (
        <>
          {isFetching && <p className="nota">Se încarcă…</p>}
          <table className="tabel">
            <thead>
              <tr><th>Momentul</th><th>Student</th><th className="numar">Din</th><th className="numar">În</th><th>Modificat de</th></tr>
            </thead>
            <tbody>
              {istoric.map((m) => (
                <tr key={m.id}>
                  <td>{new Date(m.la).toLocaleString('ro-RO')}</td>
                  <td>{m.student}</td>
                  <td className="numar">{valoare(m.valoareVeche)}</td>
                  <td className="numar">{valoare(m.valoareNoua)}</td>
                  <td>{m.autor}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {istoric.length === 0 && <p className="nota">Nicio modificare încă.</p>}
        </>
      )}
    </section>
  )
}
