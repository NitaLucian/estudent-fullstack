import { useState } from 'react'
import { mesajeDin } from '../api/client'
import { useConturi, useSeteazaActiv } from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import { useDebounce } from '../hooks/useDebounce'

type Rol = 'ADMIN' | 'PROFESOR' | 'STUDENT'

// Conturile de acces: căutare, filtrare după rol, activare / dezactivare
export default function ConturiPage() {
  const [rol, setRol] = useState<Rol | ''>('')
  const [text, setText] = useState('')
  const cauta = useDebounce(text)
  const { data: conturi = [], error } = useConturi(rol || undefined, cauta || undefined)
  const schimbare = useSeteazaActiv()

  return (
    <>
      <h1>Conturi</h1>
      <div className="bara-filtre">
        <input placeholder="Caută după email…" value={text} onChange={(e) => setText(e.target.value)} />
        <select value={rol} onChange={(e) => setRol(e.target.value as Rol | '')}>
          <option value="">toate rolurile</option>
          <option value="ADMIN">administratori</option>
          <option value="PROFESOR">profesori</option>
          <option value="STUDENT">studenți</option>
        </select>
      </div>
      <MesajEroare mesaje={[error, schimbare.error].flatMap((e) => (e ? mesajeDin(e) : []))} />
      <table className="tabel">
        <thead>
          <tr><th>Email</th><th>Rol</th><th>Ultima autentificare</th><th>Stare</th><th className="actiuni"></th></tr>
        </thead>
        <tbody>
          {conturi.map((c) => (
            <tr key={c.id}>
              <td>{c.email}</td>
              <td>{c.rol}</td>
              <td>{c.ultimaAutentificare ? new Date(c.ultimaAutentificare).toLocaleString('ro-RO') : '–'}</td>
              <td>{c.activ ? 'activ' : <span className="text-rosu">dezactivat</span>}</td>
              <td className="actiuni">
                <button
                  className={c.activ ? 'mic pericol' : 'mic secundar'}
                  onClick={() => schimbare.mutate({ id: c.id, activ: !c.activ })}
                >
                  {c.activ ? 'Dezactivează' : 'Activează'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="nota">Se afișează cel mult 100 de conturi.</p>
    </>
  )
}
