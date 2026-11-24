import { Link, useParams } from 'react-router'
import { mesajeDin } from '../api/client'
import { useSituatie } from '../api/hooks'
import { usePermisiuni } from '../auth/permisiuni'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'

// Situația școlară: /studenti/:id/note – notele pe ani universitari și mediile
export default function NotePage() {
  const id = Number(useParams().id)
  const { data: situatie, error } = useSituatie(id)
  const { esteStudent } = usePermisiuni()

  if (!situatie) return <MesajEroare mesaje={error ? mesajeDin(error) : []} />
  const { student, note, medii } = situatie

  return (
    <>
      {!esteStudent && <p><Link to={`/studenti/${id}`}>‹ Fișa studentului</Link></p>}
      <h1>{esteStudent ? 'Notele mele' : `Notele: ${student.nume} ${student.prenume}`}</h1>
      {medii.length === 0 && <p>Nu există încă note.</p>}
      {medii.map((m) => (
        <section className="card" key={m.anUniversitar}>
          <h2>Anul universitar {m.anUniversitar}</h2>
          <table className="tabel">
            <thead>
              <tr><th>Disciplina</th><th className="numar">Sem.</th><th className="numar">Credite</th><th className="numar">Nota</th><th>Data</th></tr>
            </thead>
            <tbody>
              {note
                .filter((n) => n.anUniversitar === m.anUniversitar)
                .map((n) => (
                  <tr key={n.id} className={n.valoare < 5 ? 'restant' : undefined}>
                    <td>{n.disciplina.denumire}</td>
                    <td className="numar">{n.disciplina.semestru}</td>
                    <td className="numar">{n.disciplina.credite}</td>
                    <td className="numar"><strong>{n.valoare}</strong></td>
                    <td>{formatData(n.data)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="cifre" style={{ marginTop: '0.75rem' }}>
            <div><strong>{m.medieAritmetica.toFixed(2)}</strong> media aritmetică</div>
            <div><strong>{m.mediePonderata.toFixed(2)}</strong> media ponderată</div>
            <div><strong>{m.crediteObtinute} / {m.crediteTotale}</strong> credite obținute</div>
          </div>
        </section>
      ))}
    </>
  )
}
