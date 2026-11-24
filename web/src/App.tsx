import { Route, Routes } from 'react-router'
import RutaProtejata from './auth/RutaProtejata'
import Layout from './components/Layout'
import AcasaPage from './pages/AcasaPage'
import AniUniversitariPage from './pages/AniUniversitariPage'
import ContPage from './pages/ContPage'
import DisciplinePage from './pages/DisciplinePage'
import GrupePage from './pages/GrupePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfesoriPage from './pages/ProfesoriPage'
import ProfesorPage from './pages/ProfesorPage'
import SpecializariPage from './pages/SpecializariPage'
import StudentFormPage from './pages/StudentFormPage'
import StudentiPage from './pages/StudentiPage'
import StudentPage from './pages/StudentPage'

// Harta aplicației: fiecare adresă are pagina ei.
// Pagina de login este publică; toate celelalte cer autentificare (RutaProtejata)
// și sunt desenate în interiorul componentei Layout (bara de sus + conținut).
export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RutaProtejata />}>
        <Route element={<Layout />}>
          <Route index element={<AcasaPage />} />
          <Route path="specializari" element={<SpecializariPage />} />
          <Route path="grupe" element={<GrupePage />} />
          <Route path="studenti" element={<StudentiPage />} />
          <Route path="studenti/nou" element={<StudentFormPage />} />
          <Route path="studenti/:id" element={<StudentPage />} />
          <Route path="studenti/:id/editare" element={<StudentFormPage />} />
          <Route path="discipline" element={<DisciplinePage />} />
          <Route path="profesori" element={<ProfesoriPage />} />
          <Route path="profesori/:id" element={<ProfesorPage />} />
          <Route path="ani-universitari" element={<AniUniversitariPage />} />
          <Route path="cont" element={<ContPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
