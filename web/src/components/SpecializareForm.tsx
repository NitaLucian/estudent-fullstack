import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api'
import type { SpecializareDate } from '../tipuri'
import MesajEroare from './MesajEroare'

interface Props {
  initial: SpecializareDate // valorile de pornire (goale la adăugare)
  titlu: string
  onSalveaza: (date: SpecializareDate) => Promise<void>
  onRenunta: () => void
}

// Formular controlat: valoarea fiecărui câmp este ținută în starea componentei.
export default function SpecializareForm({ initial, titlu, onSalveaza, onRenunta }: Props) {
  const [cod, setCod] = useState(initial.cod)
  const [denumire, setDenumire] = useState(initial.denumire)
  const [erori, setErori] = useState<string[]>([])
  const [seTrimite, setSeTrimite] = useState(false)

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault() // fără reîncărcarea paginii (comportamentul implicit al unui <form>)
    setSeTrimite(true)
    try {
      await onSalveaza({ cod: cod.trim().toUpperCase(), denumire: denumire.trim() })
    } catch (e) {
      setErori(mesajeDin(e))
    } finally {
      setSeTrimite(false)
    }
  }

  return (
    <form className="card formular" onSubmit={laTrimitere}>
      <h2>{titlu}</h2>
      <label>
        Cod
        <input value={cod} onChange={(e) => setCod(e.target.value)} maxLength={15} required />
      </label>
      <label>
        Denumire
        <input value={denumire} onChange={(e) => setDenumire(e.target.value)} maxLength={100} required />
      </label>
      <MesajEroare mesaje={erori} />
      <div className="butoane">
        <button type="submit" disabled={seTrimite}>Salvează</button>
        <button type="button" className="secundar" onClick={onRenunta}>Renunță</button>
      </div>
    </form>
  )
}
