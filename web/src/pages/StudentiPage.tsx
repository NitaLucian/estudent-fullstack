import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { citeste, mesajeDin } from '../api'
import MesajEroare from '../components/MesajEroare'
import Paginare from '../components/Paginare'
import Tabel, { type Coloana } from '../components/Tabel'
import { formatData } from '../format'
import { useDebounce } from '../hooks/useDebounce'
import type { Grupa, Pagina, Specializare, Student } from '../tipuri'

// O copie a parametrilor, cu un parametru schimbat. Orice filtru nou
// ne întoarce la prima pagină (altfel am putea rămâne pe pagina 9 dintr-un rezultat de 2 pagini).
function cuParametru(p: URLSearchParams, nume: string, valoare: string) {
  const noi = new URLSearchParams(p)
  if (valoare) noi.set(nume, valoare)
  else noi.delete(nume)
  if (nume !== 'pagina') noi.delete('pagina')
  return noi
}

const coloane: Coloana<Student>[] = [
  { titlu: 'Nr. matricol', celula: (s) => s.nrMatricol },
  { titlu: 'Nume și prenume', celula: (s) => <Link to={`/studenti/${s.id}`}>{s.nume} {s.prenume}</Link> },
  { titlu: 'Email', celula: (s) => s.email },
  { titlu: 'Grupa', celula: (s) => s.grupa?.cod ?? '–' },
  { titlu: 'An', celula: (s) => s.grupa?.an ?? '–', clasa: 'numar' },
  { titlu: 'Data nașterii', celula: (s) => formatData(s.dataNasterii) },
]

export default function StudentiPage() {
  // Filtrele stau în adresa paginii (?cauta=...&pagina=2): pagina poate fi
  // reîncărcată, salvată ca favorit sau trimisă altcuiva cu aceleași filtre.
  const [params, setParams] = useSearchParams()
  const pagina = Number(params.get('pagina') ?? '1')
  const specializareId = params.get('specializareId') ?? ''
  const grupaId = params.get('grupaId') ?? ''
  const ordonare = params.get('ordonare') ?? 'nume'

  const [text, setText] = useState(params.get('cauta') ?? '')
  const cauta = useDebounce(text)

  const [rezultat, setRezultat] = useState<Pagina<Student> | null>(null)
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [erori, setErori] = useState<string[]>([])

  // textul căutat ajunge în adresă abia după pauza de tastare
  useEffect(() => {
    setParams((p) => ((p.get('cauta') ?? '') === cauta ? p : cuParametru(p, 'cauta', cauta)), { replace: true })
  }, [cauta, setParams])

  useEffect(() => {
    citeste<Specializare[]>('/api/specializari').then(setSpecializari).catch((e) => setErori(mesajeDin(e)))
  }, [])

  // grupele din lista de filtrare depind de specializarea aleasă
  useEffect(() => {
    citeste<Grupa[]>(specializareId ? `/api/grupe?specializareId=${specializareId}` : '/api/grupe')
      .then(setGrupe)
      .catch((e) => setErori(mesajeDin(e)))
  }, [specializareId])

  // lista de studenți se recitește la orice schimbare a parametrilor din adresă
  const interogare = params.toString()
  useEffect(() => {
    let activ = true // devine false dacă între timp a plecat o cerere mai nouă
    citeste<Pagina<Student>>(`/api/studenti?${interogare}`)
      .then((r) => {
        if (activ) {
          setRezultat(r)
          setErori([])
        }
      })
      .catch((e) => activ && setErori(mesajeDin(e)))
    return () => {
      activ = false
    }
  }, [interogare])

  return (
    <>
      <div className="titlu-pagina">
        <h1>Studenți</h1>
        <Link className="buton" to="/studenti/nou">+ Adaugă student</Link>
      </div>

      <div className="bara-filtre">
        <input placeholder="Caută nume, matricol, email…" value={text} onChange={(e) => setText(e.target.value)} />
        <select
          value={specializareId}
          onChange={(e) => setParams(cuParametru(cuParametru(params, 'grupaId', ''), 'specializareId', e.target.value))}
        >
          <option value="">toate specializările</option>
          {specializari.map((s) => (
            <option key={s.id} value={s.id}>{s.cod}</option>
          ))}
        </select>
        <select value={grupaId} onChange={(e) => setParams(cuParametru(params, 'grupaId', e.target.value))}>
          <option value="">toate grupele</option>
          {grupe.map((g) => (
            <option key={g.id} value={g.id}>{g.cod}</option>
          ))}
        </select>
        <select value={ordonare} onChange={(e) => setParams(cuParametru(params, 'ordonare', e.target.value))}>
          <option value="nume">ordonați după nume</option>
          <option value="nrMatricol">ordonați după nr. matricol</option>
        </select>
      </div>

      <MesajEroare mesaje={erori} />

      {rezultat && (
        <>
          <Tabel coloane={coloane} randuri={rezultat.date} cheie={(s) => s.id} gol="Niciun student nu corespunde filtrelor." />
          <Paginare
            pagina={pagina}
            perPagina={rezultat.perPagina}
            total={rezultat.total}
            onPagina={(p) => setParams(cuParametru(params, 'pagina', String(p)))}
          />
        </>
      )}
    </>
  )
}
