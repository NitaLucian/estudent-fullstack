import { useState, type FormEvent } from 'react'
import { mesajeDin } from '../api/client'
import { useAniUniversitari, useCreeazaAnUniversitar, useStabilesteAnCurent } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'
import type { AnUniversitar } from '../tipuri'

export default function AniUniversitariPage() {
  const { data: ani = [], error } = useAniUniversitari()
  const creare = useCreeazaAnUniversitar()
  const faCurent = useStabilesteAnCurent()
  const [cod, setCod] = useState('')
  const [inceput, setInceput] = useState('')
  const [sfarsit, setSfarsit] = useState('')

  function adauga(ev: FormEvent) {
    ev.preventDefault()
    creare.mutate(
      { cod: cod.trim(), dataInceput: inceput, dataSfarsit: sfarsit },
      { onSuccess: () => setCod('') }, // golim câmpul doar dacă adăugarea a reușit
    )
  }

  function stabilesteCurent(an: AnUniversitar) {
    if (window.confirm(`Anul ${an.cod} devine anul universitar curent. Continuați?`)) faCurent.mutate(an.id)
  }

  return (
    <>
      <h1>Ani universitari</h1>
      <MesajEroare mesaje={[error, creare.error, faCurent.error].flatMap((e) => (e ? mesajeDin(e) : []))} />
      <table className="tabel">
        <thead>
          <tr><th>Cod</th><th>Început</th><th>Sfârșit</th><th className="numar">Înscrieri</th><th className="actiuni"></th></tr>
        </thead>
        <tbody>
          {ani.map((a) => (
            <tr key={a.id}>
              <td><strong>{a.cod}</strong>{a.curent && <span className="eticheta">curent</span>}</td>
              <td>{formatData(a.dataInceput)}</td>
              <td>{formatData(a.dataSfarsit)}</td>
              <td className="numar">{a._count.inscrieri}</td>
              <td className="actiuni">
                {!a.curent && <button className="mic secundar" onClick={() => stabilesteCurent(a)}>Fă-l curent</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <form className="card formular" onSubmit={adauga}>
        <h2>An universitar nou</h2>
        <label>
          Cod
          <input value={cod} onChange={(e) => setCod(e.target.value)} placeholder="2027-2028" required />
        </label>
        <label>
          Data de început
          <input type="date" value={inceput} onChange={(e) => setInceput(e.target.value)} required />
        </label>
        <label>
          Data de sfârșit
          <input type="date" value={sfarsit} onChange={(e) => setSfarsit(e.target.value)} required />
        </label>
        <div className="butoane">
          <button type="submit" disabled={creare.isPending}>Adaugă</button>
        </div>
      </form>
    </>
  )
}
