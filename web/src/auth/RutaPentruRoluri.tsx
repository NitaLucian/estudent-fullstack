import { Outlet } from 'react-router'
import type { components } from '../api/schema'
import { useAuth } from './context'

type Rol = components['schemas']['Rol']

// Paginile din interior sunt afișate doar utilizatorilor cu unul dintre rolurile date.
// Din nou: este o comoditate de interfață; regula reală este verificată de server (403).
export default function RutaPentruRoluri({ roluri }: { roluri: Rol[] }) {
  const { utilizator } = useAuth()
  if (!utilizator || !roluri.includes(utilizator.rol)) {
    return (
      <section className="card">
        <h1>Acces interzis</h1>
        <p>Contul dumneavoastră nu are acces la această pagină.</p>
      </section>
    )
  }
  return <Outlet />
}
