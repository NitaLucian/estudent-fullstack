import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { mesajeDin } from '../api/client'
import { useGrupe, useSpecializari, useStudenti, type FiltreStudenti } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import Paginare from '../components/Paginare'
import Tabel, { type Coloana } from '../components/Tabel'
import { formatData } from '../format'
import { useDebounce } from '../hooks/useDebounce'
import type { Student } from '../tipuri'

// O copie a parametrilor, cu un parametru schimbat. Orice filtru nou
// ne întoarce la prima pagină.
function cuParametru(p: URLSearchParams, nume: string, valoare: string) {
  const noi = new URLSearchParams(p)
  if (valoare) noi.set(nume, valoare)
  else noi.delete(nume)
  if (nume !== 'pagina') noi.delete('pagina')
  return noi
}

// un număr din adresă sau undefined (parametrul lipsește)
const numar = (text: string | null) => (text ? Number(text) : undefined)

const coloane: Coloana<Student>[] = [
  { titlu: 'Nr. matricol', celula: (s) => s.nrMatricol },
  { titlu: 'Nume și prenume', celula: (s) => <Link to={`/studenti/${s.id}`}>{s.nume} {s.prenume}</Link> },
  { titlu: 'Email', celula: (s) => s.email },
  { titlu: 'Grupa', celula: (s) => s.grupa?.cod ?? '–' },
  { titlu: 'An', celula: (s) => s.grupa?.an ?? '–', clasa: 'numar' },
  { titlu: 'Data nașterii', celula: (s) => formatData(s.dataNasterii) },
]

export default function StudentiPage() {
  // Filtrele stau în adresa paginii (?cauta=...&pagina=2)
  const [params, setParams] = useSearchParams()
  const filtre: FiltreStudenti = {
    pagina: numar(params.get('pagina')),
    cauta: params.get('cauta') ?? undefined,
    specializareId: numar(params.get('specializareId')),
    grupaId: numar(params.get('grupaId')),
    ordonare: params.get('ordonare') === 'nrMatricol' ? 'nrMatricol' : undefined,
  }

  const [text, setText] = useState(params.get('cauta') ?? '')
  const cauta = useDebounce(text)

  // Cererile: TanStack Query le face, le păstrează în cache și ignoră singur
  // răspunsurile întârziate ale unor cereri mai vechi.
  const { data: rezultat, error, isFetching } = useStudenti(filtre)
  const { data: specializari = [] } = useSpecializari()
  const { data: grupe = [] } = useGrupe(filtre.specializareId)

  // textul căutat ajunge în adresă abia după pauza de tastare
  useEffect(() => {
    setParams((p) => ((p.get('cauta') ?? '') === cauta ? p : cuParametru(p, 'cauta', cauta)), { replace: true })
  }, [cauta, setParams])

  return (
    <>
      <div className="titlu-pagina">
        <h1>Studenți {isFetching && <span className="nota">se actualizează…</span>}</h1>
        <Link className="buton" to="/studenti/nou">+ Adaugă student</Link>
      </div>

      <div className="bara-filtre">
        <input placeholder="Caută nume, matricol, email…" value={text} onChange={(e) => setText(e.target.value)} />
        <select
          value={params.get('specializareId') ?? ''}
          onChange={(e) => setParams(cuParametru(cuParametru(params, 'grupaId', ''), 'specializareId', e.target.value))}
        >
          <option value="">toate specializările</option>
          {specializari.map((s) => (
            <option key={s.id} value={s.id}>{s.cod}</option>
          ))}
        </select>
        <select value={params.get('grupaId') ?? ''} onChange={(e) => setParams(cuParametru(params, 'grupaId', e.target.value))}>
          <option value="">toate grupele</option>
          {grupe.map((g) => (
            <option key={g.id} value={g.id}>{g.cod}</option>
          ))}
        </select>
        <select value={params.get('ordonare') ?? 'nume'} onChange={(e) => setParams(cuParametru(params, 'ordonare', e.target.value))}>
          <option value="nume">ordonați după nume</option>
          <option value="nrMatricol">ordonați după nr. matricol</option>
        </select>
      </div>

      <MesajEroare mesaje={error ? mesajeDin(error) : []} />

      {rezultat && (
        <>
          <Tabel coloane={coloane} randuri={rezultat.date} cheie={(s) => s.id} gol="Niciun student nu corespunde filtrelor." />
          <Paginare
            pagina={rezultat.pagina}
            perPagina={rezultat.perPagina}
            total={rezultat.total}
            onPagina={(p) => setParams(cuParametru(params, 'pagina', String(p)))}
          />
        </>
      )}
    </>
  )
}
