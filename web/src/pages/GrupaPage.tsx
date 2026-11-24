import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { citeste, mesajeDin } from '../api'
import MesajEroare from '../components/MesajEroare'
import Tabel, { type Coloana } from '../components/Tabel'
import type { GrupaCuStudenti } from '../tipuri'

type StudentGrupa = GrupaCuStudenti['studenti'][number]

const coloane: Coloana<StudentGrupa>[] = [
  { titlu: 'Nr. matricol', celula: (s) => s.nrMatricol },
  { titlu: 'Nume și prenume', celula: (s) => <Link to={`/studenti/${s.id}`}>{s.nume} {s.prenume}</Link> },
  { titlu: 'Email', celula: (s) => s.email },
]

// Pagina unei grupe: /grupe/:id
export default function GrupaPage() {
  const { id } = useParams()
  const [grupa, setGrupa] = useState<GrupaCuStudenti | null>(null)
  const [erori, setErori] = useState<string[]>([])

  useEffect(() => {
    citeste<GrupaCuStudenti>(`/api/grupe/${id}`)
      .then(setGrupa)
      .catch((e) => setErori(mesajeDin(e)))
  }, [id])

  // prima coloană: numărul de ordine (poziția studentului în listă)
  const cuNumar: Coloana<StudentGrupa>[] = [
    { titlu: 'Nr.', celula: (s) => (grupa?.studenti.indexOf(s) ?? 0) + 1, clasa: 'numar' },
    ...coloane,
  ]

  return (
    <>
      <p><Link to="/grupe">‹ Toate grupele</Link></p>
      <MesajEroare mesaje={erori} />
      {grupa && (
        <>
          <h1>Grupa {grupa.cod}</h1>
          <p>
            {grupa.specializare.cod} – {grupa.specializare.denumire}, anul {grupa.an}. {grupa.studenti.length} studenți.
          </p>
          <Tabel coloane={cuNumar} randuri={grupa.studenti} cheie={(s) => s.id} gol="Grupa nu are studenți." />
        </>
      )}
    </>
  )
}
