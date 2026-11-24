import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { citeste, creeaza, mesajeDin, modifica } from '../api'
import MesajEroare from '../components/MesajEroare'
import StudentForm from '../components/StudentForm'
import { pentruInputData } from '../format'
import type { Grupa, Student, StudentDate } from '../tipuri'

const gol: StudentDate = { nrMatricol: '', nume: '', prenume: '', email: '', dataNasterii: null, grupaId: null }

// Aceeași pagină pentru /studenti/nou (adăugare) și /studenti/:id/editare (modificare).
export default function StudentFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initial, setInitial] = useState<StudentDate | null>(id ? null : gol)
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [erori, setErori] = useState<string[]>([])

  useEffect(() => {
    citeste<Grupa[]>('/api/grupe').then(setGrupe).catch((e) => setErori(mesajeDin(e)))
  }, [])

  // la modificare, formularul pornește de la datele actuale ale studentului
  useEffect(() => {
    if (!id) return
    citeste<Student>(`/api/studenti/${id}`)
      .then((s) =>
        setInitial({
          nrMatricol: s.nrMatricol,
          nume: s.nume,
          prenume: s.prenume,
          email: s.email,
          dataNasterii: pentruInputData(s.dataNasterii),
          grupaId: s.grupaId,
        }),
      )
      .catch((e) => setErori(mesajeDin(e)))
  }, [id])

  async function salveaza(date: StudentDate) {
    const salvat = id
      ? await modifica<Student>(`/api/studenti/${id}`, date)
      : await creeaza<Student>('/api/studenti', date)
    navigate(`/studenti/${salvat.id}`) // mergem la fișa studentului
  }

  return (
    <>
      <h1>{id ? 'Modificarea datelor studentului' : 'Student nou'}</h1>
      <MesajEroare mesaje={erori} />
      {initial && (
        <StudentForm initial={initial} grupe={grupe} onSalveaza={salveaza} onRenunta={() => navigate(-1)} />
      )}
    </>
  )
}
