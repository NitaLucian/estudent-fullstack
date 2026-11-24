import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api'
import type { AnStudiu, DisciplinaDate, Specializare } from '../tipuri'
import MesajEroare from './MesajEroare'

interface Props {
  initial: DisciplinaDate
  titlu: string
  specializari: Specializare[]
  ani: AnStudiu[]
  onSalveaza: (date: DisciplinaDate) => Promise<void>
  onRenunta: () => void
}

export default function DisciplinaForm({ initial, titlu, specializari, ani, onSalveaza, onRenunta }: Props) {
  const [date, setDate] = useState<DisciplinaDate>(initial)
  const [erori, setErori] = useState<string[]>([])

  function schimba<K extends keyof DisciplinaDate>(camp: K, valoare: DisciplinaDate[K]) {
    setDate({ ...date, [camp]: valoare })
  }

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    try {
      await onSalveaza({
        cod: date.cod.trim().toUpperCase(),
        denumire: date.denumire.trim(),
        credite: date.credite,
        semestru: date.semestru,
        specializareId: date.specializareId,
        anStudiuId: date.anStudiuId,
      })
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <form className="card formular" onSubmit={laTrimitere}>
      <h2>{titlu}</h2>
      <label>
        Cod
        <input value={date.cod} onChange={(e) => schimba('cod', e.target.value)} maxLength={20} required />
      </label>
      <label>
        Denumire
        <input value={date.denumire} onChange={(e) => schimba('denumire', e.target.value)} maxLength={100} required />
      </label>
      <label>
        Specializare
        <select value={date.specializareId} onChange={(e) => schimba('specializareId', Number(e.target.value))} required>
          <option value={0} disabled>– alegeți –</option>
          {specializari.map((s) => (
            <option key={s.id} value={s.id}>{s.cod}</option>
          ))}
        </select>
      </label>
      <label>
        An de studiu
        <select value={date.anStudiuId} onChange={(e) => schimba('anStudiuId', Number(e.target.value))} required>
          <option value={0} disabled>– alegeți –</option>
          {ani.map((a) => (
            <option key={a.id} value={a.id}>{a.denumire}</option>
          ))}
        </select>
      </label>
      <label>
        Semestru
        <select value={date.semestru} onChange={(e) => schimba('semestru', Number(e.target.value))}>
          <option value={1}>semestrul 1</option>
          <option value={2}>semestrul 2</option>
        </select>
      </label>
      <label>
        Credite
        <input type="number" min={1} max={30} value={date.credite} onChange={(e) => schimba('credite', Number(e.target.value))} />
      </label>
      <MesajEroare mesaje={erori} />
      <div className="butoane">
        <button type="submit">Salvează</button>
        <button type="button" className="secundar" onClick={onRenunta}>Renunță</button>
      </div>
    </form>
  )
}
