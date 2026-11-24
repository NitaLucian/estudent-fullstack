import { NavLink, Outlet } from 'react-router'

const meniu = [
  { adresa: '/', eticheta: 'Acasă' },
  { adresa: '/studenti', eticheta: 'Studenți' },
  { adresa: '/grupe', eticheta: 'Grupe' },
  { adresa: '/specializari', eticheta: 'Specializări' },
]

// Scheletul comun al paginilor: bara de sus cu meniul și, dedesubt,
// pagina corespunzătoare adresei curente (locul ei este marcat de <Outlet />).
export default function Layout() {
  return (
    <>
      <header className="bara-sus">
        <span className="logo">eStudent</span>
        <nav className="meniu">
          {meniu.map((m) => (
            // NavLink adaugă singur clasa „active” legăturii paginii curente
            <NavLink key={m.adresa} to={m.adresa} end={m.adresa === '/'}>
              {m.eticheta}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="continut">
        <Outlet />
      </main>
    </>
  )
}
