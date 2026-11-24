import { useRef } from 'react'
import { client, date, mesajeDin } from '../api/client'
import { useDocumente, useIncarcaDocument, useStergeDocument } from '../api/hooks'
import MesajEroare from './MesajEroare'

// mărimea unui fișier, ușor de citit
const marime = (octeti: number) =>
  octeti < 1024 ? `${octeti} o` : octeti < 1024 * 1024 ? `${(octeti / 1024).toFixed(0)} KB` : `${(octeti / 1024 / 1024).toFixed(1)} MB`

export default function DocumenteStudent({ studentId, poateModifica }: { studentId: number; poateModifica: boolean }) {
  const { data: documente = [], error } = useDocumente(studentId)
  const incarcare = useIncarcaDocument(studentId)
  const stergere = useStergeDocument(studentId)
  const alegere = useRef<HTMLInputElement>(null)

  // cerem o adresă presemnată și lăsăm browserul să descarce fișierul de acolo
  async function descarca(id: number) {
    const { url } = await date(client.GET('/api/documente/{id}/url', { params: { path: { id } } }))
    window.location.assign(url)
  }

  return (
    <section className="card">
      <div className="titlu-pagina">
        <h2>Documente</h2>
        {poateModifica && (
          <>
            <input
              ref={alegere}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              hidden
              onChange={(e) => {
                const fisier = e.target.files?.[0]
                if (fisier) incarcare.mutate(fisier)
                e.target.value = ''
              }}
            />
            <button className="secundar" disabled={incarcare.isPending} onClick={() => alegere.current?.click()}>
              {incarcare.isPending ? 'Se încarcă…' : '+ Încarcă un document'}
            </button>
          </>
        )}
      </div>
      <MesajEroare mesaje={[error, incarcare.error, stergere.error].flatMap((e) => (e ? mesajeDin(e) : []))} />
      {documente.length === 0 ? (
        <p className="nota">Nu există documente. Sunt acceptate fișiere PDF, JPEG și PNG, de cel mult 5 MB.</p>
      ) : (
        <table className="tabel">
          <thead>
            <tr><th>Document</th><th>Mărime</th><th>Încărcat la</th><th className="actiuni"></th></tr>
          </thead>
          <tbody>
            {documente.map((d) => (
              <tr key={d.id}>
                <td>{d.nume}</td>
                <td>{marime(d.marime)}</td>
                <td>{new Date(d.incarcatLa).toLocaleString('ro-RO')}</td>
                <td className="actiuni">
                  <button className="mic secundar" onClick={() => descarca(d.id)}>Descarcă</button>
                  {poateModifica && (
                    <button className="mic pericol" onClick={() => window.confirm(`Ștergeți „${d.nume}”?`) && stergere.mutate(d.id)}>
                      Șterge
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
