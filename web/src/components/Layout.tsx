import { NavLink, Outlet } from 'react-router'
import type { UtilizatorAutentificat } from '../api/sesiune'
import { useAuth } from '../auth/context'

// Variabilele de mediu ale frontendului: doar cele cu prefixul VITE_ ajung în codul din browser.
const titlu = import.meta.env.VITE_TITLU_APLICATIE ?? 'eStudent'

// Meniul fiecărui rol. Funcția primește utilizatorul (pentru legăturile personale).
function meniuPentru(u: UtilizatorAutentificat): { adresa: string; eticheta: string }[] {
  switch (u.rol) {
    case 'ADMIN':
      return [
        { adresa: '/', eticheta: 'Acasă' },
        { adresa: '/studenti', eticheta: 'Studenți' },
        { adresa: '/grupe', eticheta: 'Grupe' },
        { adresa: '/specializari', eticheta: 'Specializări' },
        { adresa: '/discipline', eticheta: 'Discipline' },
        { adresa: '/profesori', eticheta: 'Profesori' },
        { adresa: '/ani-universitari', eticheta: 'Ani universitari' },
      ]
    case 'PROFESOR':
      return [
        { adresa: '/', eticheta: 'Acasă' },
        { adresa: `/profesori/${u.profesorId}`, eticheta: 'Disciplinele mele' },
        { adresa: '/studenti', eticheta: 'Studenții mei' },
        { adresa: '/grupe', eticheta: 'Grupe' },
        { adresa: '/discipline', eticheta: 'Plan de învățământ' },
      ]
    case 'STUDENT':
      return [
        { adresa: '/', eticheta: 'Acasă' },
        { adresa: `/studenti/${u.studentId}`, eticheta: 'Fișa mea' },
        { adresa: '/discipline', eticheta: 'Plan de învățământ' },
      ]
  }
}

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
          {utilizator && meniuPentru(utilizator).map((m) => (
            // NavLink adaugă singur clasa „active” legăturii paginii curente
            <NavLink key={m.adresa} to={m.adresa} end={m.adresa === '/'}>
              {m.eticheta}
            </NavLink>
          ))}
        </nav>
        {utilizator && (
          <div className="cont">
            <span>
              {utilizator.nume} <small>({ROLURI[utilizator.rol]})</small>
            </span>
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
