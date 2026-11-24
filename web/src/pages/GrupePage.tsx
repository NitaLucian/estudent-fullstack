import { useEffect, useState } from 'react'
import { citeste, creeaza, mesajeDin, modifica, sterge } from '../api'
import GrupaForm from '../components/GrupaForm'
import MesajEroare from '../components/MesajEroare'
import type { Grupa, GrupaDate, Specializare } from '../tipuri'

type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; grupa: Grupa }

export default function GrupePage() {
  const [grupe, setGrupe] = useState<Grupa[]>([])
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [filtru, setFiltru] = useState(0) // 0 = toate specializările
  const [erori, setErori] = useState<string[]>([])
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })
  const [versiune, setVersiune] = useState(0)

  // lista de specializări (pentru filtru și formular) se citește o singură dată
  useEffect(() => {
    citeste<Specializare[]>('/api/specializari')
      .then(setSpecializari)
      .catch((e) => setErori(mesajeDin(e)))
  }, [])

  // lista de grupe se recitește când se schimbă filtrul sau datele
  useEffect(() => {
    // filtrul ajunge la server ca parametru în URL: /api/grupe?specializareId=2
    const url = filtru ? `/api/grupe?specializareId=${filtru}` : '/api/grupe'
    citeste<Grupa[]>(url)
      .then(setGrupe)
      .catch((e) => setErori(mesajeDin(e)))
  }, [filtru, versiune])

  async function salveaza(date: GrupaDate) {
    if (formular.mod === 'modificare') await modifica(`/api/grupe/${formular.grupa.id}`, date)
    else await creeaza('/api/grupe', date)
    setFormular({ mod: 'ascuns' })
    setVersiune(versiune + 1)
  }

  async function stergeGrupa(g: Grupa) {
    if (!window.confirm(`Ștergeți grupa ${g.cod}?`)) return
    try {
      await sterge(`/api/grupe/${g.id}`)
      setErori([])
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  const initialNou: GrupaDate = { cod: '', an: 1, specializareId: filtru }

  return (
    <>
      <div className="titlu-pagina">
        <h1>Grupe</h1>
        {formular.mod === 'ascuns' && <button onClick={() => setFormular({ mod: 'adaugare' })}>+ Adaugă grupă</button>}
      </div>

      <div className="bara-filtre">
        <label>
          Specializarea:{' '}
          <select value={filtru} onChange={(e) => setFiltru(Number(e.target.value))}>
            <option value={0}>toate</option>
            {specializari.map((s) => (
              <option key={s.id} value={s.id}>{s.cod}</option>
            ))}
          </select>
        </label>
      </div>

      {formular.mod !== 'ascuns' && (
        <GrupaForm
          key={formular.mod === 'modificare' ? formular.grupa.id : 'nou'}
          titlu={formular.mod === 'modificare' ? `Modificare ${formular.grupa.cod}` : 'Grupă nouă'}
          initial={formular.mod === 'modificare' ? formular.grupa : initialNou}
          specializari={specializari}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}

      <MesajEroare mesaje={erori} />

      <table className="tabel">
        <thead>
          <tr>
            <th>Cod</th>
            <th>Specializare</th>
            <th className="numar">An</th>
            <th className="actiuni">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {grupe.map((g) => (
            <tr key={g.id}>
              <td><strong>{g.cod}</strong></td>
              <td>{g.specializare.cod} – {g.specializare.denumire}</td>
              <td className="numar">{g.an}</td>
              <td className="actiuni">
                <button className="mic secundar" onClick={() => setFormular({ mod: 'modificare', grupa: g })}>
                  Modifică
                </button>
                <button className="mic pericol" onClick={() => stergeGrupa(g)}>Șterge</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">Total: {grupe.length} grupe.</p>
    </>
  )
}
