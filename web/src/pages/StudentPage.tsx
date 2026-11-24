import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { citeste, mesajeDin, sterge } from '../api'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'
import type { Student } from '../tipuri'

// Fișa unui student: /studenti/:id
export default function StudentPage() {
  const { id } = useParams() // parametrul :id din adresă (text)
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [erori, setErori] = useState<string[]>([])

  useEffect(() => {
    citeste<Student>(`/api/studenti/${id}`)
      .then(setStudent)
      .catch((e) => setErori(mesajeDin(e)))
  }, [id])

  async function stergeStudentul() {
    if (!student || !window.confirm(`Ștergeți studentul ${student.nume} ${student.prenume}?`)) return
    try {
      await sterge(`/api/studenti/${student.id}`)
      navigate('/studenti') // înapoi la listă
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <>
      <p><Link to="/studenti">‹ Înapoi la listă</Link></p>
      <MesajEroare mesaje={erori} />
      {student && (
        <section className="card">
          <div className="titlu-pagina">
            <h1>{student.nume} {student.prenume}</h1>
            <div className="butoane">
              <Link className="buton secundar" to={`/studenti/${student.id}/editare`}>Modifică</Link>
              <button className="pericol" onClick={stergeStudentul}>Șterge</button>
            </div>
          </div>
          <dl className="detalii">
            <dt>Nr. matricol</dt>
            <dd>{student.nrMatricol}</dd>
            <dt>Email</dt>
            <dd>{student.email}</dd>
            <dt>Data nașterii</dt>
            <dd>{formatData(student.dataNasterii)}</dd>
            <dt>Grupa</dt>
            <dd>{student.grupa ? `${student.grupa.cod} (anul ${student.grupa.an}, ${student.grupa.specializare.cod})` : '–'}</dd>
          </dl>
        </section>
      )}
    </>
  )
}
