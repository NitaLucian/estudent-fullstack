import { useEffect, useState } from 'react'
import { citeste } from '../api'
import type { Specializare } from '../tipuri'

// Lista specializărilor, citită din baza de date prin GET /api/specializari.
export default function SpecializariPage() {
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [incarcare, setIncarcare] = useState(true)
  const [eroare, setEroare] = useState<string | null>(null)

  // [] = efectul rulează o singură dată, la prima afișare a paginii
  useEffect(() => {
    citeste<Specializare[]>('/api/specializari')
      .then(setSpecializari)
      .catch((e: Error) => setEroare(e.message))
      .finally(() => setIncarcare(false))
  }, [])

  return (
    <>
      <h1>Specializări</h1>
      {incarcare && <p>Se încarcă…</p>}
      {eroare && <p className="mesaj eroare">Nu am putut citi specializările: {eroare}</p>}
      {!incarcare && !eroare && (
        <table className="tabel">
          <thead>
            <tr>
              <th>Cod</th>
              <th>Denumire</th>
            </tr>
          </thead>
          <tbody>
            {/* key ajută React să recunoască fiecare rând între două afișări */}
            {specializari.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.cod}</strong></td>
                <td>{s.denumire}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!incarcare && !eroare && <p className="nota">Total: {specializari.length} specializări.</p>}
    </>
  )
}
