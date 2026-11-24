import { useEffect, useState } from 'react'
import { citeste } from '../api'
import type { Specializare } from '../tipuri'

// Lista specializărilor, cu căutare pe server: GET /api/specializari?cauta=...
export default function SpecializariPage() {
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [cauta, setCauta] = useState('')
  const [eroare, setEroare] = useState<string | null>(null)

  // efectul rulează din nou la fiecare schimbare a textului căutat
  useEffect(() => {
    // encodeURIComponent: spațiile și diacriticele devin caractere permise într-un URL
    const url = cauta ? `/api/specializari?cauta=${encodeURIComponent(cauta)}` : '/api/specializari'
    citeste<Specializare[]>(url)
      .then((date) => {
        setSpecializari(date)
        setEroare(null)
      })
      .catch((e: Error) => setEroare(e.message))
  }, [cauta])

  return (
    <>
      <h1>Specializări</h1>
      <p>
        <input
          placeholder="Caută după cod sau denumire…"
          value={cauta}
          onChange={(e) => setCauta(e.target.value)}
        />
      </p>
      {eroare && <p className="mesaj eroare">Nu am putut citi specializările: {eroare}</p>}
      <table className="tabel">
        <thead>
          <tr>
            <th>Cod</th>
            <th>Denumire</th>
          </tr>
        </thead>
        <tbody>
          {specializari.map((s) => (
            <tr key={s.id}>
              <td><strong>{s.cod}</strong></td>
              <td>{s.denumire}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">{specializari.length} specializări găsite.</p>
    </>
  )
}
