import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { citeste, creeaza, mesajeDin } from '../api'
import MesajEroare from '../components/MesajEroare'
import ProfesorForm from '../components/ProfesorForm'
import Tabel, { type Coloana } from '../components/Tabel'
import { GRADE } from '../format'
import type { Profesor, ProfesorDate } from '../tipuri'

const coloane: Coloana<Profesor>[] = [
  { titlu: 'Nume și prenume', celula: (p) => <Link to={`/profesori/${p.id}`}>{p.nume} {p.prenume}</Link> },
  { titlu: 'Grad', celula: (p) => GRADE[p.grad] },
  { titlu: 'Email', celula: (p) => p.email },
  { titlu: 'Discipline (anul curent)', celula: (p) => p._count?.predari ?? 0, clasa: 'numar' },
]

export default function ProfesoriPage() {
  const [profesori, setProfesori] = useState<Profesor[]>([])
  const [adaugare, setAdaugare] = useState(false)
  const [erori, setErori] = useState<string[]>([])
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<Profesor[]>('/api/profesori').then(setProfesori).catch((e) => setErori(mesajeDin(e)))
  }, [versiune])

  async function salveaza(date: ProfesorDate) {
    await creeaza('/api/profesori', date)
    setAdaugare(false)
    setVersiune(versiune + 1)
  }

  return (
    <>
      <div className="titlu-pagina">
        <h1>Profesori</h1>
        {!adaugare && <button onClick={() => setAdaugare(true)}>+ Adaugă profesor</button>}
      </div>
      {adaugare && (
        <ProfesorForm
          titlu="Profesor nou"
          initial={{ nume: '', prenume: '', email: '', grad: 'ASISTENT' }}
          onSalveaza={salveaza}
          onRenunta={() => setAdaugare(false)}
        />
      )}
      <MesajEroare mesaje={erori} />
      <Tabel coloane={coloane} randuri={profesori} cheie={(p) => p.id} />
    </>
  )
}
