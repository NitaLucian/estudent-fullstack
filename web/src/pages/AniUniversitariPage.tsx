import { useEffect, useState, type FormEvent } from 'react'
import { citeste, creeaza, mesajeDin } from '../api'
import MesajEroare from '../components/MesajEroare'
import { formatData } from '../format'
import type { AnUniversitar } from '../tipuri'

export default function AniUniversitariPage() {
  const [ani, setAni] = useState<AnUniversitar[]>([])
  const [cod, setCod] = useState('')
  const [inceput, setInceput] = useState('')
  const [sfarsit, setSfarsit] = useState('')
  const [erori, setErori] = useState<string[]>([])
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<AnUniversitar[]>('/api/ani-universitari').then(setAni).catch((e) => setErori(mesajeDin(e)))
  }, [versiune])

  async function adauga(ev: FormEvent) {
    ev.preventDefault()
    try {
      await creeaza('/api/ani-universitari', { cod: cod.trim(), dataInceput: inceput, dataSfarsit: sfarsit })
      setCod('')
      setErori([])
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  async function faCurent(an: AnUniversitar) {
    if (!window.confirm(`Anul ${an.cod} devine anul universitar curent. Continuați?`)) return
    try {
      await creeaza(`/api/ani-universitari/${an.id}/curent`, {})
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <>
      <h1>Ani universitari</h1>
      <MesajEroare mesaje={erori} />
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
              <td className="numar">{a._count?.inscrieri ?? 0}</td>
              <td className="actiuni">
                {!a.curent && <button className="mic secundar" onClick={() => faCurent(a)}>Fă-l curent</button>}
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
          <button type="submit">Adaugă</button>
        </div>
      </form>
    </>
  )
}
