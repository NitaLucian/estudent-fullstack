import type { ReactNode } from 'react'

// Descrierea unei coloane: titlul și cum se obține conținutul celulei dintr-un rând.
export interface Coloana<T> {
  titlu: string
  celula: (rand: T) => ReactNode
  clasa?: string // clasă CSS opțională (de ex. „numar”)
}

interface Props<T> {
  coloane: Coloana<T>[]
  randuri: T[]
  cheie: (rand: T) => string | number // cheia unică a fiecărui rând
  gol?: string // mesajul afișat când lista este goală
}

// Un tabel care funcționează pentru orice tip de rânduri (studenți, grupe ...).
// T este un parametru de tip: îl deduce TypeScript din „randuri”.
export default function Tabel<T>({ coloane, randuri, cheie, gol = 'Nu există date.' }: Props<T>) {
  return (
    <table className="tabel">
      <thead>
        <tr>
          {coloane.map((c) => (
            <th key={c.titlu} className={c.clasa}>{c.titlu}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {randuri.length === 0 && (
          <tr>
            <td colSpan={coloane.length} className="gol">{gol}</td>
          </tr>
        )}
        {randuri.map((r) => (
          <tr key={cheie(r)}>
            {coloane.map((c) => (
              <td key={c.titlu} className={c.clasa}>{c.celula(r)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
