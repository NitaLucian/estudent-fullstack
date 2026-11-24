import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { citeste, creeaza, mesajeDin, modifica, sterge } from '../api'
import DisciplinaForm from '../components/DisciplinaForm'
import MesajEroare from '../components/MesajEroare'
import Tabel, { type Coloana } from '../components/Tabel'
import type { AnStudiu, Disciplina, DisciplinaDate, Specializare } from '../tipuri'

type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; disciplina: Disciplina }

// Planul de învățământ: disciplinele, filtrate după specializare, an și semestru.
export default function DisciplinePage() {
  const [params, setParams] = useSearchParams()
  const [discipline, setDiscipline] = useState<Disciplina[]>([])
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [ani, setAni] = useState<AnStudiu[]>([])
  const [erori, setErori] = useState<string[]>([])
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<Specializare[]>('/api/specializari').then(setSpecializari).catch((e) => setErori(mesajeDin(e)))
    citeste<AnStudiu[]>('/api/ani-studiu').then(setAni).catch((e) => setErori(mesajeDin(e)))
  }, [])

  const interogare = params.toString()
  useEffect(() => {
    citeste<Disciplina[]>(`/api/discipline?${interogare}`)
      .then(setDiscipline)
      .catch((e) => setErori(mesajeDin(e)))
  }, [interogare, versiune])

  function filtru(nume: string, valoare: string) {
    const noi = new URLSearchParams(params)
    if (valoare) noi.set(nume, valoare)
    else noi.delete(nume)
    setParams(noi)
  }

  async function salveaza(date: DisciplinaDate) {
    if (formular.mod === 'modificare') await modifica(`/api/discipline/${formular.disciplina.id}`, date)
    else await creeaza('/api/discipline', date)
    setFormular({ mod: 'ascuns' })
    setVersiune(versiune + 1)
  }

  async function stergeDisciplina(d: Disciplina) {
    if (!window.confirm(`Ștergeți disciplina ${d.cod} – ${d.denumire}?`)) return
    try {
      await sterge(`/api/discipline/${d.id}`)
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  const coloane: Coloana<Disciplina>[] = [
    { titlu: 'Cod', celula: (d) => d.cod },
    { titlu: 'Denumire', celula: (d) => d.denumire },
    { titlu: 'Spec.', celula: (d) => d.specializare.cod },
    { titlu: 'An', celula: (d) => d.anStudiu.numar, clasa: 'numar' },
    { titlu: 'Sem.', celula: (d) => d.semestru, clasa: 'numar' },
    { titlu: 'Credite', celula: (d) => d.credite, clasa: 'numar' },
    {
      titlu: 'Profesor (anul curent)',
      celula: (d) =>
        d.predari.map((p) => (
          <Link key={p.id} to={`/profesori/${p.profesor.id}`}>{p.profesor.nume} {p.profesor.prenume}</Link>
        )),
    },
    {
      titlu: 'Acțiuni',
      clasa: 'actiuni',
      celula: (d) => (
        <>
          <button className="mic secundar" onClick={() => setFormular({ mod: 'modificare', disciplina: d })}>Modifică</button>
          <button className="mic pericol" onClick={() => stergeDisciplina(d)}>Șterge</button>
        </>
      ),
    },
  ]

  const specFiltru = Number(params.get('specializareId') ?? 0)
  const anFiltru = Number(params.get('anStudiuId') ?? 0)
  const initialNou: DisciplinaDate = {
    cod: '', denumire: '', credite: 5, semestru: Number(params.get('semestru') ?? 1),
    specializareId: specFiltru, anStudiuId: anFiltru,
  }

  return (
    <>
      <div className="titlu-pagina">
        <h1>Discipline</h1>
        {formular.mod === 'ascuns' && <button onClick={() => setFormular({ mod: 'adaugare' })}>+ Adaugă disciplină</button>}
      </div>
      <div className="bara-filtre">
        <select value={params.get('specializareId') ?? ''} onChange={(e) => filtru('specializareId', e.target.value)}>
          <option value="">toate specializările</option>
          {specializari.map((s) => <option key={s.id} value={s.id}>{s.cod}</option>)}
        </select>
        <select value={params.get('anStudiuId') ?? ''} onChange={(e) => filtru('anStudiuId', e.target.value)}>
          <option value="">toți anii</option>
          {ani.map((a) => <option key={a.id} value={a.id}>{a.denumire}</option>)}
        </select>
        <select value={params.get('semestru') ?? ''} onChange={(e) => filtru('semestru', e.target.value)}>
          <option value="">ambele semestre</option>
          <option value="1">semestrul 1</option>
          <option value="2">semestrul 2</option>
        </select>
      </div>
      {formular.mod !== 'ascuns' && (
        <DisciplinaForm
          key={formular.mod === 'modificare' ? formular.disciplina.id : 'nou'}
          titlu={formular.mod === 'modificare' ? `Modificare ${formular.disciplina.cod}` : 'Disciplină nouă'}
          initial={formular.mod === 'modificare' ? formular.disciplina : initialNou}
          specializari={specializari}
          ani={ani}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}
      <MesajEroare mesaje={erori} />
      <Tabel coloane={coloane} randuri={discipline} cheie={(d) => d.id} gol="Nicio disciplină nu corespunde filtrelor." />
      <p className="nota">
        {discipline.length} discipline, {discipline.reduce((s, d) => s + d.credite, 0)} credite în total.
      </p>
    </>
  )
}
