import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api/client'
import { GRADE } from '../format'
import type { GradDidactic, ProfesorDate } from '../tipuri'
import MesajEroare from './MesajEroare'

interface Props {
  initial: ProfesorDate
  titlu: string
  onSalveaza: (date: ProfesorDate) => Promise<void>
  onRenunta: () => void
}

export default function ProfesorForm({ initial, titlu, onSalveaza, onRenunta }: Props) {
  const [date, setDate] = useState<ProfesorDate>(initial)
  const [erori, setErori] = useState<string[]>([])

  function schimba<K extends keyof ProfesorDate>(camp: K, valoare: ProfesorDate[K]) {
    setDate({ ...date, [camp]: valoare })
  }

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    try {
      await onSalveaza({
        nume: date.nume.trim(),
        prenume: date.prenume.trim(),
        email: date.email.trim().toLowerCase(),
        grad: date.grad,
      })
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <form className="card formular" onSubmit={laTrimitere}>
      <h2>{titlu}</h2>
      <label>
        Nume
        <input value={date.nume} onChange={(e) => schimba('nume', e.target.value)} required />
      </label>
      <label>
        Prenume
        <input value={date.prenume} onChange={(e) => schimba('prenume', e.target.value)} required />
      </label>
      <label>
        Email
        <input type="email" value={date.email} onChange={(e) => schimba('email', e.target.value)} required />
      </label>
      <label>
        Grad didactic
        <select value={date.grad} onChange={(e) => schimba('grad', e.target.value as GradDidactic)}>
          {/* Object.entries transformă obiectul GRADE într-o listă de perechi [cheie, valoare] */}
          {Object.entries(GRADE).map(([cheie, denumire]) => (
            <option key={cheie} value={cheie}>{denumire}</option>
          ))}
        </select>
      </label>
      <MesajEroare mesaje={erori} />
      <div className="butoane">
        <button type="submit">Salvează</button>
        <button type="button" className="secundar" onClick={onRenunta}>Renunță</button>
      </div>
    </form>
  )
}
