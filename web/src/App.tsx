import { useState } from 'react'
import AcasaPage from './pages/AcasaPage'
import SpecializariPage from './pages/SpecializariPage'

// Paginile aplicației. Tipul Pagina acceptă doar aceste două valori.
type Pagina = 'acasa' | 'specializari'

export default function App() {
  const [pagina, setPagina] = useState<Pagina>('acasa')

  return (
    <>
      <header className="bara-sus">
        <span className="logo">eStudent</span>
        <nav className="meniu">
          <button className={pagina === 'acasa' ? 'activ' : ''} onClick={() => setPagina('acasa')}>
            Acasă
          </button>
          <button
            className={pagina === 'specializari' ? 'activ' : ''}
            onClick={() => setPagina('specializari')}
          >
            Specializări
          </button>
        </nav>
      </header>

      <main className="continut">
        {pagina === 'acasa' && <AcasaPage />}
        {pagina === 'specializari' && <SpecializariPage />}
      </main>
    </>
  )
}
