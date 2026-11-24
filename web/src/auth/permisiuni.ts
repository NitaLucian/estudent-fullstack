import { useAuth } from './context'

// Ce poate face utilizatorul curent, pentru a ascunde din interfață butoanele inutile.
// (Serverul verifică oricum fiecare cerere.)
export function usePermisiuni() {
  const { utilizator } = useAuth()
  const rol = utilizator?.rol
  return {
    esteAdmin: rol === 'ADMIN',
    esteProfesor: rol === 'PROFESOR',
    esteStudent: rol === 'STUDENT',
    studentId: utilizator?.studentId ?? null,
    profesorId: utilizator?.profesorId ?? null,
  }
}
