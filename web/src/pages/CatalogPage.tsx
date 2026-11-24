import { Link, useParams } from 'react-router'
import { mesajeDin } from '../api/client'
import { useCatalog, useSeteazaNota, useStergeNota } from '../api/hooks'
import CelulaNota from '../components/CelulaNota'
import IstoricNote from '../components/IstoricNote'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'

// Catalogul unei discipline: /catalog/:disciplinaId (profesorul disciplinei sau administratorul)
export default function CatalogPage() {
  const disciplinaId = Number(useParams().disciplinaId)
  const { data: catalog, error } = useCatalog(disciplinaId)
  const seteaza = useSeteazaNota(disciplinaId)
  const stergere = useStergeNota(disciplinaId)

  if (!catalog) return <MesajEroare mesaje={error ? mesajeDin(error) : []} />
  const { disciplina, randuri } = catalog
  const cuNota = randuri.filter((r) => r.nota)
  const promovati = cuNota.filter((r) => r.nota!.valoare >= 5).length

  return (
    <>
      <p><Link to="/">‹ Acasă</Link></p>
      <h1>Catalog: {disciplina.denumire}</h1>
      <p className="nota">
        {disciplina.cod} · {disciplina.specializare}, anul {disciplina.an}, semestrul {disciplina.semestru} ·{' '}
        {disciplina.credite} credite · anul universitar {catalog.anUniversitar}
      </p>
      <MesajEroare mesaje={[seteaza.error, stergere.error].flatMap((e) => (e ? mesajeDin(e) : []))} />
      <table className="tabel">
        <thead>
          <tr>
            <th>Grupa</th><th>Nr. matricol</th><th>Student</th>
            <th className="numar">Nota</th><th>Data examenului</th>
          </tr>
        </thead>
        <tbody>
          {randuri.map((r) => (
            <tr key={r.inscriereId}>
              <td>{r.grupa}</td>
              <td>{r.student.nrMatricol}</td>
              <td>{r.student.nume} {r.student.prenume}</td>
              <td className="numar">
                {/* key: după o salvare reușită, câmpul pornește de la noua valoare din cache */}
                <CelulaNota
                  key={`${r.inscriereId}-${r.nota?.valoare ?? ''}`}
                  valoare={r.nota?.valoare ?? null}
                  seSalveaza={seteaza.isPending && seteaza.variables?.inscriereId === r.inscriereId}
                  onSalveaza={(valoare) => seteaza.mutate({ inscriereId: r.inscriereId, valoare })}
                  onSterge={() => stergere.mutate(r.inscriereId)}
                />
              </td>
              <td>{r.nota ? formatData(r.nota.data) : '–'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">
        {randuri.length} studenți · {cuNota.length} note introduse · {promovati} promovați. Scrieți nota și apăsați
        Enter; un câmp golit șterge nota.
      </p>
      <IstoricNote disciplinaId={disciplinaId} />
    </>
  )
}
