import { Route, Routes } from 'react-router'
import Layout from './components/Layout'
import AcasaPage from './pages/AcasaPage'
import GrupePage from './pages/GrupePage'
import NotFoundPage from './pages/NotFoundPage'
import SpecializariPage from './pages/SpecializariPage'
import StudentFormPage from './pages/StudentFormPage'
import StudentiPage from './pages/StudentiPage'
import StudentPage from './pages/StudentPage'

// Harta aplicației: fiecare adresă are pagina ei.
// Toate paginile sunt desenate în interiorul componentei Layout (bara de sus + conținut).
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<AcasaPage />} />
        <Route path="specializari" element={<SpecializariPage />} />
        <Route path="grupe" element={<GrupePage />} />
        <Route path="studenti" element={<StudentiPage />} />
        <Route path="studenti/nou" element={<StudentFormPage />} />
        <Route path="studenti/:id" element={<StudentPage />} />
        <Route path="studenti/:id/editare" element={<StudentFormPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
