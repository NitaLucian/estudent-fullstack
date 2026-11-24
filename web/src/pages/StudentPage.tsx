import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { citeste, creeaza, mesajeDin, sterge } from '../api'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'
import type { AnUniversitar, Grupa, StudentDetaliu } from '../tipuri'

// Fișa unui student: /studenti/:id – datele personale și înscrierile pe ani universitari
export default function StudentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [student, setStudent] = useState<StudentDetaliu | null>(null)
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [ani, setAni] = useState<AnUniversitar[]>([])
  const [grupaNoua, setGrupaNoua] = useState(0)
  const [anNou, setAnNou] = useState(0)
  const [erori, setErori] = useState<string[]>([])
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<StudentDetaliu>(`/api/studenti/${id}`)
      .then(setStudent)
      .catch((e) => setErori(mesajeDin(e)))
  }, [id, versiune])

  useEffect(() => {
    citeste<Grupa[]>('/api/grupe').then(setGrupe).catch((e) => setErori(mesajeDin(e)))
    citeste<AnUniversitar[]>('/api/ani-universitari').then(setAni).catch((e) => setErori(mesajeDin(e)))
  }, [])

  async function stergeStudentul() {
    if (!student || !window.confirm(`Ștergeți studentul ${student.nume} ${student.prenume}?`)) return
    try {
      await sterge(`/api/studenti/${student.id}`)
      navigate('/studenti')
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  async function inscrie(ev: FormEvent) {
    ev.preventDefault()
    try {
      await creeaza('/api/inscrieri', {
        studentId: Number(id),
        grupaId: grupaNoua,
        ...(anNou && { anUniversitarId: anNou }), // 0 = anul curent
      })
      setErori([])
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  async function stergeInscrierea(inscriereId: number) {
    if (!window.confirm('Ștergeți această înscriere?')) return
    try {
      await sterge(`/api/inscrieri/${inscriereId}`)
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <>
      <p><Link to="/studenti">‹ Înapoi la listă</Link></p>
      <MesajEroare mesaje={erori} />
      {student && (
        <>
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
              <dt>Grupa (anul curent)</dt>
              <dd>{student.grupa ? `${student.grupa.cod} (anul ${student.grupa.an}, ${student.grupa.specializare.cod})` : '–'}</dd>
            </dl>
          </section>

          <section className="card">
            <h2>Înscrieri</h2>
            <table className="tabel">
              <thead>
                <tr><th>An universitar</th><th>Grupa</th><th className="numar">An de studiu</th><th className="actiuni"></th></tr>
              </thead>
              <tbody>
                {student.inscrieri.map((i) => (
                  <tr key={i.id}>
                    <td>{i.anUniversitar.cod}{i.anUniversitar.curent && ' (curent)'}</td>
                    <td><Link to={`/grupe`}>{i.grupa.cod}</Link> – {i.grupa.specializare.cod}</td>
                    <td className="numar">{i.grupa.an}</td>
                    <td className="actiuni">
                      <button className="mic pericol" onClick={() => stergeInscrierea(i.id)}>Șterge</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <form className="bara-filtre" style={{ marginTop: '0.75rem' }} onSubmit={inscrie}>
              <select value={anNou} onChange={(e) => setAnNou(Number(e.target.value))}>
                <option value={0}>anul universitar curent</option>
                {ani.filter((a) => !a.curent).map((a) => (
                  <option key={a.id} value={a.id}>{a.cod}</option>
                ))}
              </select>
              <select value={grupaNoua} onChange={(e) => setGrupaNoua(Number(e.target.value))} required>
                <option value={0} disabled>– grupa –</option>
                {grupe.map((g) => (
                  <option key={g.id} value={g.id}>{g.cod}</option>
                ))}
              </select>
              <button type="submit" disabled={!grupaNoua}>Înscrie</button>
            </form>
          </section>
        </>
      )}
    </>
  )
}
