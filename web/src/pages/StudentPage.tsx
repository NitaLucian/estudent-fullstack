import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { mesajeDin } from '../api/client'
import {
  useAniUniversitari, useCreeazaInscriere, useGrupe, useStergeInscriere, useStergeStudent, useStudent,
} from '../api/hooks'
import { usePermisiuni } from '../auth/permisiuni'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'

// Fișa unui student: /studenti/:id – datele personale și înscrierile pe ani universitari
export default function StudentPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: student, error } = useStudent(id)
  const { data: grupe = [] } = useGrupe()
  const { data: ani = [] } = useAniUniversitari()
  const stergereStudent = useStergeStudent()
  const inscriere = useCreeazaInscriere()
  const stergereInscriere = useStergeInscriere()
  const [grupaNoua, setGrupaNoua] = useState(0)
  const [anNou, setAnNou] = useState(0)
  const { esteAdmin, esteStudent } = usePermisiuni()

  async function stergeStudentul() {
    if (!student || !window.confirm(`Ștergeți studentul ${student.nume} ${student.prenume}?`)) return
    await stergereStudent.mutateAsync(id)
    navigate('/studenti')
  }

  function inscrie(ev: FormEvent) {
    ev.preventDefault()
    inscriere.mutate({ studentId: id, grupaId: grupaNoua, ...(anNou && { anUniversitarId: anNou }) })
  }

  // toate erorile paginii, într-o singură listă
  const erori = [error, stergereStudent.error, inscriere.error, stergereInscriere.error].flatMap((e) => (e ? mesajeDin(e) : []))

  return (
    <>
      {!esteStudent && <p><Link to="/studenti">‹ Înapoi la listă</Link></p>}
      <MesajEroare mesaje={erori} />
      {student && (
        <>
          <section className="card">
            <div className="titlu-pagina">
              <h1>{student.nume} {student.prenume}</h1>
              {esteAdmin && (
                <div className="butoane">
                  <Link className="buton secundar" to={`/studenti/${student.id}/editare`}>Modifică</Link>
                  <button className="pericol" onClick={stergeStudentul}>Șterge</button>
                </div>
              )}
            </div>
            <dl className="detalii">
              <dt>Nr. matricol</dt>
              <dd>{student.nrMatricol}</dd>
              <dt>Email</dt>
              <dd>{student.email}</dd>
              <dt>Data nașterii</dt>
              <dd>{formatData(student.dataNasterii)}</dd>
              <dt>Note</dt>
              <dd><Link to={`/studenti/${student.id}/note`}>situația școlară</Link></dd>
              <dt>Grupa (anul curent)</dt>
              <dd>{student.grupa ? `${student.grupa.cod} (anul ${student.grupa.an}, ${student.grupa.specializare.cod})` : '–'}</dd>
            </dl>
          </section>

          <section className="card">
            <h2>Înscrieri</h2>
            <table className="tabel">
              <thead>
                <tr><th>An universitar</th><th>Grupa</th><th className="numar">An de studiu</th>{esteAdmin && <th className="actiuni"></th>}</tr>
              </thead>
              <tbody>
                {student.inscrieri.map((i) => (
                  <tr key={i.id}>
                    <td>{i.anUniversitar.cod}{i.anUniversitar.curent && ' (curent)'}</td>
                    <td>{i.grupa?.cod} – {i.grupa?.specializare.cod}</td>
                    <td className="numar">{i.grupa?.an}</td>
                    {esteAdmin && (
                      <td className="actiuni">
                        <button
                          className="mic pericol"
                          onClick={() => window.confirm('Ștergeți această înscriere?') && stergereInscriere.mutate(i.id)}
                        >
                          Șterge
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {esteAdmin && (
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
                <button type="submit" disabled={!grupaNoua || inscriere.isPending}>Înscrie</button>
              </form>
            )}
          </section>
        </>
      )}
    </>
  )
}
