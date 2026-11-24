import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { citeste, creeaza, mesajeDin, modifica, sterge } from '../api'
import MesajEroare from '../components/MesajEroare'
import ProfesorForm from '../components/ProfesorForm'
import { GRADE } from '../format'
import type { Disciplina, ProfesorDate, ProfesorDetaliu } from '../tipuri'

// Fișa profesorului: /profesori/:id – datele și disciplinele predate
export default function ProfesorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [profesor, setProfesor] = useState<ProfesorDetaliu | null>(null)
  const [discipline, setDiscipline] = useState<Disciplina[]>([])
  const [disciplinaNoua, setDisciplinaNoua] = useState(0)
  const [editare, setEditare] = useState(false)
  const [erori, setErori] = useState<string[]>([])
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<ProfesorDetaliu>(`/api/profesori/${id}`).then(setProfesor).catch((e) => setErori(mesajeDin(e)))
  }, [id, versiune])

  useEffect(() => {
    citeste<Disciplina[]>('/api/discipline').then(setDiscipline).catch((e) => setErori(mesajeDin(e)))
  }, [])

  async function salveaza(date: ProfesorDate) {
    await modifica(`/api/profesori/${id}`, date)
    setEditare(false)
    setVersiune(versiune + 1)
  }

  async function stergeProfesorul() {
    if (!profesor || !window.confirm(`Ștergeți profesorul ${profesor.nume} ${profesor.prenume}?`)) return
    try {
      await sterge(`/api/profesori/${id}`)
      navigate('/profesori')
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  // o legătură nouă în relația M–N profesori–discipline (în anul curent)
  async function adaugaDisciplina(ev: FormEvent) {
    ev.preventDefault()
    try {
      await creeaza(`/api/profesori/${id}/predari`, { disciplinaId: disciplinaNoua })
      setDisciplinaNoua(0)
      setErori([])
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  async function stergePredarea(predareId: number) {
    try {
      await sterge(`/api/profesori/${id}/predari/${predareId}`)
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  if (!profesor) return <MesajEroare mesaje={erori} />

  return (
    <>
      <p><Link to="/profesori">‹ Toți profesorii</Link></p>
      <MesajEroare mesaje={erori} />
      {editare ? (
        <ProfesorForm titlu="Modificarea datelor" initial={profesor} onSalveaza={salveaza} onRenunta={() => setEditare(false)} />
      ) : (
        <section className="card">
          <div className="titlu-pagina">
            <h1>{profesor.nume} {profesor.prenume}</h1>
            <div className="butoane">
              <button className="secundar" onClick={() => setEditare(true)}>Modifică</button>
              <button className="pericol" onClick={stergeProfesorul}>Șterge</button>
            </div>
          </div>
          <dl className="detalii">
            <dt>Grad didactic</dt>
            <dd>{GRADE[profesor.grad]}</dd>
            <dt>Email</dt>
            <dd>{profesor.email}</dd>
          </dl>
        </section>
      )}

      <section className="card">
        <h2>Discipline predate</h2>
        <table className="tabel">
          <thead>
            <tr><th>An universitar</th><th>Cod</th><th>Disciplina</th><th>Spec.</th><th className="numar">An</th><th className="numar">Sem.</th><th className="actiuni"></th></tr>
          </thead>
          <tbody>
            {profesor.predari.map((p) => (
              <tr key={p.id}>
                <td>{p.anUniversitar.cod}</td>
                <td>{p.disciplina.cod}</td>
                <td>{p.disciplina.denumire}</td>
                <td>{p.disciplina.specializare.cod}</td>
                <td className="numar">{p.disciplina.anStudiu.numar}</td>
                <td className="numar">{p.disciplina.semestru}</td>
                <td className="actiuni">
                  {p.anUniversitar.curent && <button className="mic pericol" onClick={() => stergePredarea(p.id)}>Renunță</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <form className="bara-filtre" style={{ marginTop: '0.75rem' }} onSubmit={adaugaDisciplina}>
          <select value={disciplinaNoua} onChange={(e) => setDisciplinaNoua(Number(e.target.value))} required>
            <option value={0} disabled>– disciplina –</option>
            {discipline.map((d) => (
              <option key={d.id} value={d.id}>{d.cod} – {d.denumire}</option>
            ))}
          </select>
          <button type="submit" disabled={!disciplinaNoua}>Adaugă în anul curent</button>
        </form>
      </section>
    </>
  )
}
