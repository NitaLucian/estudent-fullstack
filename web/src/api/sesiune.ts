// Sesiunea utilizatorului în browser.
// Token-ul de acces stă DOAR în memorie (o variabilă), nu în localStorage:
// la reîncărcarea paginii se pierde, iar sesiunea se reface cu refresh token-ul din cookie.
import type { components } from './schema'

export type RaspunsAutentificare = components['schemas']['RaspunsAutentificare']
export type UtilizatorAutentificat = components['schemas']['UtilizatorAutentificat']

let accessToken: string | null = null

// cine trebuie anunțat când sesiunea se schimbă (AuthProvider)
type Ascultator = (utilizator: UtilizatorAutentificat | null) => void
const ascultatori = new Set<Ascultator>()

export function asculta(f: Ascultator) {
  ascultatori.add(f)
  return () => {
    ascultatori.delete(f)
  }
}

export const tokenCurent = () => accessToken

export function seteazaSesiune(r: RaspunsAutentificare | null) {
  accessToken = r?.accessToken ?? null
  ascultatori.forEach((f) => f(r?.utilizator ?? null))
}

// O singură reîmprospătare la un moment dat: dacă mai multe cereri primesc 401
// deodată, toate așteaptă aceeași promisiune (altfel am roti token-ul de mai multe ori,
// iar serverul ar crede că un token a fost furat).
let inCurs: Promise<boolean> | null = null

export function reimprospateaza(): Promise<boolean> {
  inCurs ??= (async () => {
    try {
      // cookie-ul httpOnly „refresh” este trimis automat de browser (aceeași origine)
      const r = await fetch('/api/auth/refresh', { method: 'POST' })
      if (!r.ok) {
        seteazaSesiune(null)
        return false
      }
      seteazaSesiune((await r.json()) as RaspunsAutentificare)
      return true
    } catch {
      seteazaSesiune(null)
      return false
    } finally {
      inCurs = null
    }
  })()
  return inCurs
}
