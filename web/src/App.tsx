import { Route, Routes } from 'react-router'
import RutaPentruRoluri from './auth/RutaPentruRoluri'
import RutaProtejata from './auth/RutaProtejata'
import Layout from './components/Layout'
import AcasaPage from './pages/AcasaPage'
import AniUniversitariPage from './pages/AniUniversitariPage'
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

// Harta aplicației. Pagina de login este publică; restul cer autentificare (RutaProtejata),
// iar unele pagini cer și un anumit rol (RutaPentruRoluri).
export default function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RutaProtejata />}>
        <Route element={<Layout />}>
          {/* orice utilizator autentificat */}
          <Route index element={<AcasaPage />} />
          <Route path="discipline" element={<DisciplinePage />} />
          <Route path="studenti/:id" element={<StudentPage />} />
          <Route path="profesori/:id" element={<ProfesorPage />} />

          {/* administrator și profesor */}
          <Route element={<RutaPentruRoluri roluri={['ADMIN', 'PROFESOR']} />}>
            <Route path="studenti" element={<StudentiPage />} />
            <Route path="grupe" element={<GrupePage />} />
          </Route>

          {/* doar administrator */}
          <Route element={<RutaPentruRoluri roluri={['ADMIN']} />}>
            <Route path="specializari" element={<SpecializariPage />} />
            <Route path="studenti/nou" element={<StudentFormPage />} />
            <Route path="studenti/:id/editare" element={<StudentFormPage />} />
            <Route path="profesori" element={<ProfesoriPage />} />
            <Route path="ani-universitari" element={<AniUniversitariPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
