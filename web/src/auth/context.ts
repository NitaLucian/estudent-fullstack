import { createContext, useContext } from 'react'
import type { UtilizatorAutentificat } from '../api/sesiune'

export interface StareAutentificare {
  utilizator: UtilizatorAutentificat | null
  // true cât timp, la pornire, încercăm să refacem sesiunea din cookie
  seVerifica: boolean
  login: (email: string, parola: string) => Promise<void>
  logout: () => Promise<void>
}

// Contextul face starea autentificării accesibilă oricărei componente,
// fără s-o transmitem din părinte în copil prin proprietăți.
export const AuthContext = createContext<StareAutentificare | null>(null)

export function useAuth(): StareAutentificare {
  const valoare = useContext(AuthContext)
  if (!valoare) throw new Error('useAuth se folosește doar în interiorul <AuthProvider>')
  return valoare
}
