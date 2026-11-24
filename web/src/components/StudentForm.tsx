import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api/client'
import type { Grupa, StudentDate } from '../tipuri'
import MesajEroare from './MesajEroare'

interface Props {
  initial: StudentDate
  grupe: Grupa[]
  onSalveaza: (date: StudentDate) => Promise<void>
  onRenunta: () => void
}

export default function StudentForm({ initial, grupe, onSalveaza, onRenunta }: Props) {
  const [date, setDate] = useState<StudentDate>(initial)
  const [erori, setErori] = useState<string[]>([])
  // grupa se alege doar la adăugare; ulterior, grupa se schimbă din înscrieri
  const cuGrupa = initial.grupaId !== undefined

  function schimba<K extends keyof StudentDate>(camp: K, valoare: StudentDate[K]) {
    setDate({ ...date, [camp]: valoare })
  }

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    try {
      await onSalveaza({
        nrMatricol: date.nrMatricol.trim().toUpperCase(),
        nume: date.nume.trim(),
        prenume: date.prenume.trim(),
        email: date.email.trim().toLowerCase(),
        dataNasterii: date.dataNasterii || null, // textul gol devine null
        ...(cuGrupa && { grupaId: date.grupaId }),
      })
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <form className="card formular" onSubmit={laTrimitere}>
      <label>
        Nr. matricol
        <input value={date.nrMatricol} onChange={(e) => schimba('nrMatricol', e.target.value)} maxLength={12} required />
      </label>
      <label>
        Nume
        <input value={date.nume} onChange={(e) => schimba('nume', e.target.value)} maxLength={50} required />
      </label>
      <label>
        Prenume
        <input value={date.prenume} onChange={(e) => schimba('prenume', e.target.value)} maxLength={50} required />
      </label>
      <label>
        Email
        <input type="email" value={date.email} onChange={(e) => schimba('email', e.target.value)} required />
      </label>
      <label>
        Data nașterii
        <input type="date" value={date.dataNasterii ?? ''} onChange={(e) => schimba('dataNasterii', e.target.value)} />
      </label>
      {cuGrupa && (
        <label>
          Grupa
          <select
            value={date.grupaId ?? ''}
            onChange={(e) => schimba('grupaId', e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">– fără grupă –</option>
            {grupe.map((g) => (
              <option key={g.id} value={g.id}>{g.cod} (anul {g.anStudiu.numar})</option>
            ))}
          </select>
        </label>
      )}
      <MesajEroare mesaje={erori} />
      <div className="butoane">
        <button type="submit">Salvează</button>
        <button type="button" className="secundar" onClick={onRenunta}>Renunță</button>
      </div>
    </form>
  )
}
