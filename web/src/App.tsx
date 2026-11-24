import { useState } from 'react'
import AcasaPage from './pages/AcasaPage'
import GrupePage from './pages/GrupePage'
import SpecializariPage from './pages/SpecializariPage'

// Paginile aplicației. Tipul Pagina acceptă doar aceste valori.
type Pagina = 'acasa' | 'specializari' | 'grupe'

// Meniul: o listă de perechi (pagină, etichetă), afișată cu map()
const meniu: { pagina: Pagina; eticheta: string }[] = [
  { pagina: 'acasa', eticheta: 'Acasă' },
  { pagina: 'specializari', eticheta: 'Specializări' },
  { pagina: 'grupe', eticheta: 'Grupe' },
]

export default function App() {
  const [pagina, setPagina] = useState<Pagina>('acasa')

  return (
    <>
      <header className="bara-sus">
        <span className="logo">eStudent</span>
        <nav className="meniu">
          {meniu.map((m) => (
            <button key={m.pagina} className={pagina === m.pagina ? 'activ' : ''} onClick={() => setPagina(m.pagina)}>
              {m.eticheta}
            </button>
          ))}
        </nav>
      </header>

      <main className="continut">
        {pagina === 'acasa' && <AcasaPage />}
        {pagina === 'specializari' && <SpecializariPage />}
        {pagina === 'grupe' && <GrupePage />}
      </main>
    </>
  )
}
