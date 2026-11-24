import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState, type ReactNode } from 'react'
import { client, date } from '../api/client'
import { asculta, reimprospateaza, seteazaSesiune, type UtilizatorAutentificat } from '../api/sesiune'
import { AuthContext } from './context'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [utilizator, setUtilizator] = useState<UtilizatorAutentificat | null>(null)
  const [seVerifica, setSeVerifica] = useState(true)
  const queryClient = useQueryClient()

  useEffect(() => {
    // orice schimbare a sesiunii (login, logout, refresh eșuat) ajunge aici
    const opreste = asculta(setUtilizator)
    // la pornirea aplicației: există o sesiune (cookie) de la o vizită anterioară?
    reimprospateaza().finally(() => setSeVerifica(false))
    return opreste
  }, [])

  async function login(email: string, parola: string) {
    seteazaSesiune(await date(client.POST('/api/auth/login', { body: { email, parola } })))
  }

  async function logout() {
    await client.POST('/api/auth/logout')
    seteazaSesiune(null)
    // datele utilizatorului anterior nu trebuie să rămână în cache
    queryClient.clear()
  }

  return <AuthContext.Provider value={{ utilizator, seVerifica, login, logout }}>{children}</AuthContext.Provider>
}
