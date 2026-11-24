import { useNavigate, useParams } from 'react-router'
import { mesajeDin } from '../api/client'
import { useGrupe, useSalveazaStudent, useStudent } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import StudentForm from '../components/StudentForm'
import { pentruInputData } from '../format'
import type { StudentDate } from '../tipuri'

const gol: StudentDate = { nrMatricol: '', nume: '', prenume: '', email: '', dataNasterii: null, grupaId: null }

// Aceeași pagină pentru /studenti/nou (adăugare) și /studenti/:id/editare (modificare).
export default function StudentFormPage() {
  const { id: idText } = useParams()
  const id = idText ? Number(idText) : undefined
  const navigate = useNavigate()
  const { data: grupe = [] } = useGrupe()
  // la adăugare nu există student de citit: interogarea este oprită (enabled: false)
  const { data: student, error } = useStudent(id)
  const salvare = useSalveazaStudent()

  async function salveaza(date: StudentDate) {
    const salvat = await salvare.mutateAsync({ id, corp: date })
    navigate(`/studenti/${salvat.id}`)
  }

  // valorile de pornire ale formularului
  const initial: StudentDate | null = !id
    ? gol
    : student
      ? {
          nrMatricol: student.nrMatricol,
          nume: student.nume,
          prenume: student.prenume,
          email: student.email,
          dataNasterii: pentruInputData(student.dataNasterii),
        }
      : null

  return (
    <>
      <h1>{id ? 'Modificarea datelor studentului' : 'Student nou'}</h1>
      <MesajEroare mesaje={error ? mesajeDin(error) : []} />
      {initial && (
        <StudentForm key={id ?? 'nou'} initial={initial} grupe={grupe} onSalveaza={salveaza} onRenunta={() => navigate(-1)} />
      )}
    </>
  )
}

