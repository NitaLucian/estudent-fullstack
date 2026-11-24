import { useState } from 'react'
import { mesajeDin } from '../api/client'
import { useSalveazaSpecializare, useSpecializari, useStergeSpecializare } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import SpecializareForm from '../components/SpecializareForm'
import type { Specializare, SpecializareDate } from '../tipuri'

// Ce afișează formularul: nimic, adăugare sau modificarea unei specializări anume.
type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; specializare: Specializare }

export default function SpecializariPage() {
  const { data: specializari = [], isPending, error } = useSpecializari()
  const salvare = useSalveazaSpecializare()
  const stergere = useStergeSpecializare()
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })

  // POST pentru adăugare, PATCH pentru modificare. Lista se recitește singură
  // (mutația invalidează cheia ['specializari']).
  async function salveaza(date: SpecializareDate) {
    await salvare.mutateAsync({ id: formular.mod === 'modificare' ? formular.specializare.id : undefined, corp: date })
    setFormular({ mod: 'ascuns' })
  }

  function stergeSpecializarea(s: Specializare) {
    if (window.confirm(`Ștergeți specializarea ${s.cod}?`)) stergere.mutate(s.id)
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
          key={formular.mod === 'modificare' ? formular.specializare.id : 'nou'}
          titlu={formular.mod === 'modificare' ? `Modificare ${formular.specializare.cod}` : 'Specializare nouă'}
          initial={formular.mod === 'modificare' ? formular.specializare : { cod: '', denumire: '' }}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}

      {/* erorile citirii și ale ștergerii (cele ale salvării apar în formular) */}
      <MesajEroare mesaje={[...(error ? mesajeDin(error) : []), ...(stergere.error ? mesajeDin(stergere.error) : [])]} />
      {isPending && <p>Se încarcă…</p>}

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
              <td className="numar">{s._count.grupe}</td>
              <td className="actiuni">
                <button className="mic secundar" onClick={() => setFormular({ mod: 'modificare', specializare: s })}>
                  Modifică
                </button>
                <button className="mic pericol" onClick={() => stergeSpecializarea(s)} disabled={stergere.isPending}>
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
