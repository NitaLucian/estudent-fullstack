import { useState } from 'react'
import { mesajeDin } from '../api/client'
import { useAniStudiu, useGrupe, useSalveazaGrupa, useSpecializari, useStergeGrupa } from '../api/hooks'
import GrupaForm from '../components/GrupaForm'
import MesajEroare from '../components/MesajEroare'
import type { Grupa, GrupaDate } from '../tipuri'

type StareFormular = { mod: 'ascuns' } | { mod: 'adaugare' } | { mod: 'modificare'; grupa: Grupa }

export default function GrupePage() {
  const [filtru, setFiltru] = useState(0) // 0 = toate specializările
  // cheia cererii conține filtrul: fiecare filtru are propria intrare în cache
  const { data: grupe = [], error } = useGrupe(filtru || undefined)
  const { data: specializari = [] } = useSpecializari()
  const { data: ani = [] } = useAniStudiu()
  const salvare = useSalveazaGrupa()
  const stergere = useStergeGrupa()
  const [formular, setFormular] = useState<StareFormular>({ mod: 'ascuns' })

  async function salveaza(date: GrupaDate) {
    await salvare.mutateAsync({ id: formular.mod === 'modificare' ? formular.grupa.id : undefined, corp: date })
    setFormular({ mod: 'ascuns' })
  }

  function stergeGrupa(g: Grupa) {
    if (window.confirm(`Ștergeți grupa ${g.cod}?`)) stergere.mutate(g.id)
  }

  const initialNou: GrupaDate = { cod: '', anStudiuId: ani[0]?.id ?? 0, specializareId: filtru }

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
          ani={ani}
          onSalveaza={salveaza}
          onRenunta={() => setFormular({ mod: 'ascuns' })}
        />
      )}

      <MesajEroare mesaje={[...(error ? mesajeDin(error) : []), ...(stergere.error ? mesajeDin(stergere.error) : [])]} />

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
              <td className="numar">{g.anStudiu.numar}</td>
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
