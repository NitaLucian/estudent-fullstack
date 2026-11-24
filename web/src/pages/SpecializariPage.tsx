import { useEffect, useState } from 'react'
import { citeste, creeaza, mesajeDin, modifica, sterge } from '../api'
import MesajEroare from '../components/MesajEroare'
import SpecializareForm from '../components/SpecializareForm'
import type { Specializare, SpecializareDate } from '../tipuri'

// Ce afișează formularul: nimic, adăugare sau modificarea unei specializări anume.
type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; specializare: Specializare }

export default function SpecializariPage() {
  const [specializari, setSpecializari] = useState<Specializare[]>([])
  const [erori, setErori] = useState<string[]>([])
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })
  // crește după fiecare modificare a datelor => efectul de mai jos recitește lista
  const [versiune, setVersiune] = useState(0)

  useEffect(() => {
    citeste<Specializare[]>('/api/specializari')
      .then(setSpecializari)
      .catch((e) => setErori(mesajeDin(e)))
  }, [versiune])

  // POST pentru adăugare, PATCH pentru modificare; apoi recitim lista
  async function salveaza(date: SpecializareDate) {
    if (formular.mod === 'modificare') {
      await modifica(`/api/specializari/${formular.specializare.id}`, date)
    } else {
      await creeaza('/api/specializari', date)
    }
    setFormular({ mod: 'ascuns' })
    setVersiune(versiune + 1)
  }

  async function stergeSpecializarea(s: Specializare) {
    if (!window.confirm(`Ștergeți specializarea ${s.cod}?`)) return
    try {
      await sterge(`/api/specializari/${s.id}`)
      setErori([])
      setVersiune(versiune + 1)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <>
      <div className="titlu-pagina">
        <h1>Specializări</h1>
        {formular.mod === 'ascuns' && (
          <button onClick={() => setFormular({ mod: 'adaugare' })}>+ Adaugă specializare</button>
        )}
      </div>

      {formular.mod !== 'ascuns' && (
        <SpecializareForm
          // key diferit => React creează un formular nou, cu valorile inițiale ale altei specializări
          key={formular.mod === 'modificare' ? formular.specializare.id : 'nou'}
          titlu={formular.mod === 'modificare' ? `Modificare ${formular.specializare.cod}` : 'Specializare nouă'}
          initial={formular.mod === 'modificare' ? formular.specializare : { cod: '', denumire: '' }}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}

      <MesajEroare mesaje={erori} />

      <table className="tabel">
        <thead>
          <tr>
            <th>Cod</th>
            <th>Denumire</th>
            <th className="numar">Grupe</th>
            <th className="actiuni">Acțiuni</th>
          </tr>
        </thead>
        <tbody>
          {specializari.map((s) => (
            <tr key={s.id}>
              <td><strong>{s.cod}</strong></td>
              <td>{s.denumire}</td>
              <td className="numar">{s._count?.grupe ?? 0}</td>
              <td className="actiuni">
                <button className="mic secundar" onClick={() => setFormular({ mod: 'modificare', specializare: s })}>
                  Modifică
                </button>
                <button className="mic pericol" onClick={() => stergeSpecializarea(s)}>
                  Șterge
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">Total: {specializari.length} specializări.</p>
    </>
  )
}
