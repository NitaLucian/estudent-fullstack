import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api'
import type { GrupaDate, Specializare } from '../tipuri'
import MesajEroare from './MesajEroare'

interface Props {
  initial: GrupaDate
  titlu: string
  specializari: Specializare[] // pentru lista de alegere
  onSalveaza: (date: GrupaDate) => Promise<void>
  onRenunta: () => void
}

export default function GrupaForm({ initial, titlu, specializari, onSalveaza, onRenunta }: Props) {
  // o singură variabilă de stare pentru toate câmpurile
  const [date, setDate] = useState<GrupaDate>(initial)
  const [erori, setErori] = useState<string[]>([])

  // actualizează un singur câmp și păstrează restul (operatorul ... copiază obiectul)
  function schimba<K extends keyof GrupaDate>(camp: K, valoare: GrupaDate[K]) {
    setDate({ ...date, [camp]: valoare })
  }

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    try {
      // trimitem doar câmpurile din GrupaDate: la modificare, „initial” este o grupă întreagă
      // (cu id, specializare ...), iar serverul respinge câmpurile pe care nu le cunoaște
      await onSalveaza({
        cod: date.cod.trim().toUpperCase(),
        an: date.an,
        capacitate: date.capacitate,
        specializareId: date.specializareId,
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
        <input value={date.cod} onChange={(e) => schimba('cod', e.target.value)} maxLength={15} required />
      </label>
      <label>
        Specializare
        <select
          value={date.specializareId}
          onChange={(e) => schimba('specializareId', Number(e.target.value))}
          required
        >
          <option value={0} disabled>– alegeți –</option>
          {specializari.map((s) => (
            <option key={s.id} value={s.id}>{s.cod} – {s.denumire}</option>
          ))}
        </select>
      </label>
      <label>
        An de studiu
        <select value={date.an} onChange={(e) => schimba('an', Number(e.target.value))}>
          {[1, 2, 3, 4].map((an) => (
            <option key={an} value={an}>Anul {an}</option>
          ))}
        </select>
      </label>
      <label>
        Capacitate (studenți)
        <input
          type="number"
          min={10}
          max={40}
          value={date.capacitate}
          onChange={(e) => schimba('capacitate', Number(e.target.value))}
        />
      </label>
      <MesajEroare mesaje={erori} />
      <div className="butoane">
        <button type="submit">Salvează</button>
        <button type="button" className="secundar" onClick={onRenunta}>Renunță</button>
      </div>
    </form>
  )
}
