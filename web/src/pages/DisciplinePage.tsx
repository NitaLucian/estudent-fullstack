import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { mesajeDin } from '../api/client'
import { useAniStudiu, useDiscipline, useSalveazaDisciplina, useSpecializari, useStergeDisciplina } from '../api/hooks'
import DisciplinaForm from '../components/DisciplinaForm'
import MesajEroare from '../components/MesajEroare'
import Tabel, { type Coloana } from '../components/Tabel'
import type { Disciplina, DisciplinaDate } from '../tipuri'

type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; disciplina: Disciplina }

const numar = (text: string | null) => (text ? Number(text) : undefined)

// Planul de învățământ: disciplinele, filtrate după specializare, an și semestru.
export default function DisciplinePage() {
  const [params, setParams] = useSearchParams()
  const filtre = {
    specializareId: numar(params.get('specializareId')),
    anStudiuId: numar(params.get('anStudiuId')),
    // contractul API acceptă doar 1 sau 2: orice altă valoare din adresă este ignorată
    semestru: params.get('semestru') === '1' ? 1 : params.get('semestru') === '2' ? 2 : undefined,
  } as const
  const { data: discipline = [], error } = useDiscipline(filtre)
  const { data: specializari = [] } = useSpecializari()
  const { data: ani = [] } = useAniStudiu()
  const salvare = useSalveazaDisciplina()
  const stergere = useStergeDisciplina()
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })

  function filtru(nume: string, valoare: string) {
    const noi = new URLSearchParams(params)
    if (valoare) noi.set(nume, valoare)
    else noi.delete(nume)
    setParams(noi)
  }

  async function salveaza(date: DisciplinaDate) {
    await salvare.mutateAsync({ id: formular.mod === 'modificare' ? formular.disciplina.id : undefined, corp: date })
    setFormular({ mod: 'ascuns' })
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
          <button
            className="mic pericol"
            onClick={() => window.confirm(`Ștergeți disciplina ${d.cod} – ${d.denumire}?`) && stergere.mutate(d.id)}
          >
            Șterge
          </button>
        </>
      ),
    },
  ]

  const initialNou: DisciplinaDate = {
    cod: '', denumire: '', credite: 5, semestru: filtre.semestru ?? 1,
    specializareId: filtre.specializareId ?? 0, anStudiuId: filtre.anStudiuId ?? 0,
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
          initial={
            formular.mod === 'modificare'
              ? { ...formular.disciplina, semestru: formular.disciplina.semestru === 2 ? 2 : 1 }
              : initialNou
          }
          specializari={specializari}
          ani={ani}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}
      <MesajEroare mesaje={[error, stergere.error].flatMap((e) => (e ? mesajeDin(e) : []))} />
      <Tabel coloane={coloane} randuri={discipline} cheie={(d) => d.id} gol="Nicio disciplină nu corespunde filtrelor." />
      <p className="nota">
        {discipline.length} discipline, {discipline.reduce((s, d) => s + d.credite, 0)} credite în total.
      </p>
    </>
  )
}
