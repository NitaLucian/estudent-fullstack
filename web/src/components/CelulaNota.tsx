import { useState, type KeyboardEvent } from 'react'

interface Props {
  valoare: number | null // nota salvată (null = fără notă)
  seSalveaza: boolean
  onSalveaza: (valoare: number) => void
  onSterge: () => void
}

// Un câmp de notă din catalog: se editează direct în tabel și se salvează
// la Enter sau la părăsirea câmpului. Escape anulează modificarea.
export default function CelulaNota({ valoare, seSalveaza, onSalveaza, onSterge }: Props) {
  const [text, setText] = useState(valoare?.toString() ?? '')
  const [eroare, setEroare] = useState(false)

  function salveaza() {
    const t = text.trim()
    if (t === (valoare?.toString() ?? '')) return // nimic schimbat
    if (t === '') {
      if (valoare !== null && window.confirm('Ștergeți nota?')) onSterge()
      else setText(valoare?.toString() ?? '')
      return
    }
    const n = Number(t)
    // verificare rapidă în browser; serverul verifică oricum (1–10, număr întreg)
    if (!Number.isInteger(n) || n < 1 || n > 10) {
      setEroare(true)
      return
    }
    setEroare(false)
    onSalveaza(n)
  }

  function laTasta(ev: KeyboardEvent<HTMLInputElement>) {
    if (ev.key === 'Enter') ev.currentTarget.blur() // blur => salvare
    if (ev.key === 'Escape') {
      setText(valoare?.toString() ?? '')
      setEroare(false)
    }
  }

  return (
    <input
      className={`nota-input${eroare ? ' invalid' : ''}`}
      inputMode="numeric"
      value={text}
      disabled={seSalveaza}
      onChange={(e) => setText(e.target.value)}
      onBlur={salveaza}
      onKeyDown={laTasta}
      aria-label="Nota"
    />
  )
}
