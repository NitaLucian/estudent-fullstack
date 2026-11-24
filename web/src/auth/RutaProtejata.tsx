import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './context'

// Paginile din interiorul acestei rute cer autentificare.
// Atenție: este doar o comoditate pentru utilizator. Protecția reală o face serverul,
// care respinge cu 401 orice cerere fără token valid.
export default function RutaProtejata() {
  const { utilizator, seVerifica } = useAuth()
  const locatie = useLocation()

  if (seVerifica) return <p className="continut">Se verifică sesiunea…</p>
  if (!utilizator) {
    // ținem minte pagina cerută, ca după login să ajungem înapoi la ea
    return <Navigate to="/login" replace state={{ deUnde: locatie.pathname + locatie.search }} />
  }
  return <Outlet />
}
