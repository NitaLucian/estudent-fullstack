import { Link, NavLink, Outlet } from 'react-router'
import { useAuth } from '../auth/context'

// Variabilele de mediu ale frontendului: doar cele cu prefixul VITE_ ajung în codul din browser.
const titlu = import.meta.env.VITE_TITLU_APLICATIE ?? 'eStudent'

const meniu = [
  { adresa: '/', eticheta: 'Acasă' },
  { adresa: '/studenti', eticheta: 'Studenți' },
  { adresa: '/grupe', eticheta: 'Grupe' },
  { adresa: '/specializari', eticheta: 'Specializări' },
  { adresa: '/discipline', eticheta: 'Discipline' },
  { adresa: '/profesori', eticheta: 'Profesori' },
  { adresa: '/ani-universitari', eticheta: 'Ani universitari' },
]

// Scheletul comun al paginilor: bara de sus cu meniul și, dedesubt,
// pagina corespunzătoare adresei curente (locul ei este marcat de <Outlet />).
const ROLURI = { ADMIN: 'administrator', PROFESOR: 'profesor', STUDENT: 'student' }

export default function Layout() {
  const { utilizator, logout } = useAuth()
  return (
    <>
      <header className="bara-sus">
        <span className="logo">{titlu}</span>
        <nav className="meniu">
          {meniu.map((m) => (
            // NavLink adaugă singur clasa „active” legăturii paginii curente
            <NavLink key={m.adresa} to={m.adresa} end={m.adresa === '/'}>
              {m.eticheta}
            </NavLink>
          ))}
        </nav>
        {utilizator && (
          <div className="cont">
            <Link to="/cont">
              {utilizator.nume} <small>({ROLURI[utilizator.rol]})</small>
            </Link>
            <button className="mic secundar" onClick={logout}>Ieșire</button>
          </div>
        )}
      </header>
      <main className="continut">
        <Outlet />
      </main>
    </>
  )
}
