import { useState } from 'react'
import { Link } from 'react-router'
import { mesajeDin } from '../api/client'
import { useProfesori, useSalveazaProfesor } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import ProfesorForm from '../components/ProfesorForm'
import Tabel, { type Coloana } from '../components/Tabel'
import { GRADE } from '../format'
import type { Profesor, ProfesorDate } from '../tipuri'

const coloane: Coloana<Profesor>[] = [
  { titlu: 'Nume și prenume', celula: (p) => <Link to={`/profesori/${p.id}`}>{p.nume} {p.prenume}</Link> },
  { titlu: 'Grad', celula: (p) => GRADE[p.grad] },
  { titlu: 'Email', celula: (p) => p.email },
  { titlu: 'Discipline (anul curent)', celula: (p) => p._count.predari, clasa: 'numar' },
]

export default function ProfesoriPage() {
  const { data: profesori = [], error } = useProfesori()
  const salvare = useSalveazaProfesor()
  const [adaugare, setAdaugare] = useState(false)

  async function salveaza(date: ProfesorDate) {
    await salvare.mutateAsync({ corp: date })
    setAdaugare(false)
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
      <MesajEroare mesaje={error ? mesajeDin(error) : []} />
      <Tabel coloane={coloane} randuri={profesori} cheie={(p) => p.id} />
    </>
  )
}
