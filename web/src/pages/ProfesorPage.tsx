import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { mesajeDin } from '../api/client'
import {
  useAdaugaPredare, useDiscipline, useProfesor, useSalveazaProfesor, useStergePredare, useStergeProfesor,
} from '../api/hooks'
import { usePermisiuni } from '../auth/permisiuni'
import MesajEroare from '../components/MesajEroare'
import ProfesorForm from '../components/ProfesorForm'
import { GRADE } from '../format'
import type { ProfesorDate } from '../tipuri'

// Fișa profesorului: /profesori/:id – datele și disciplinele predate
export default function ProfesorPage() {
  const id = Number(useParams().id)
  const navigate = useNavigate()
  const { data: profesor, error } = useProfesor(id)
  const { data: discipline = [] } = useDiscipline()
  const salvare = useSalveazaProfesor()
  const stergere = useStergeProfesor()
  const adaugarePredare = useAdaugaPredare(id)
  const stergerePredare = useStergePredare(id)
  const [disciplinaNoua, setDisciplinaNoua] = useState(0)
  const [editare, setEditare] = useState(false)
  const { esteAdmin } = usePermisiuni()

  async function salveaza(date: ProfesorDate) {
    await salvare.mutateAsync({ id, corp: date })
    setEditare(false)
  }

  async function stergeProfesorul() {
    if (!profesor || !window.confirm(`Ștergeți profesorul ${profesor.nume} ${profesor.prenume}?`)) return
    await stergere.mutateAsync(id)
    navigate('/profesori')
  }

  // o legătură nouă în relația M–N profesori–discipline (în anul curent)
  async function adaugaDisciplina(ev: FormEvent) {
    ev.preventDefault()
    await adaugarePredare.mutateAsync(disciplinaNoua)
    setDisciplinaNoua(0)
  }

  const erori = [error, stergere.error, adaugarePredare.error, stergerePredare.error].flatMap((e) => (e ? mesajeDin(e) : []))
  if (!profesor) return <MesajEroare mesaje={erori} />

  return (
    <>
      {esteAdmin && <p><Link to="/profesori">‹ Toți profesorii</Link></p>}
      <MesajEroare mesaje={erori} />
      {editare ? (
        <ProfesorForm titlu="Modificarea datelor" initial={profesor} onSalveaza={salveaza} onRenunta={() => setEditare(false)} />
      ) : (
        <section className="card">
          <div className="titlu-pagina">
            <h1>{profesor.nume} {profesor.prenume}</h1>
            {esteAdmin && (
              <div className="butoane">
                <button className="secundar" onClick={() => setEditare(true)}>Modifică</button>
                <button className="pericol" onClick={stergeProfesorul}>Șterge</button>
              </div>
            )}
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
                  {esteAdmin && p.anUniversitar.curent && (
                    <button className="mic pericol" onClick={() => stergerePredare.mutate(p.id)}>Renunță</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {esteAdmin && (
          <form className="bara-filtre" style={{ marginTop: '0.75rem' }} onSubmit={(ev) => adaugaDisciplina(ev).catch(() => {})}>
            <select value={disciplinaNoua} onChange={(e) => setDisciplinaNoua(Number(e.target.value))} required>
              <option value={0} disabled>– disciplina –</option>
              {discipline.map((d) => (
                <option key={d.id} value={d.id}>{d.cod} – {d.denumire}</option>
              ))}
            </select>
            <button type="submit" disabled={!disciplinaNoua || adaugarePredare.isPending}>Adaugă în anul curent</button>
          </form>
        )}
      </section>
    </>
  )
}
