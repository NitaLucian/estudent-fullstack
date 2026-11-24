// Clientul HTTP al aplicației, generat din contractul API-ului (OpenAPI).
// Tipurile din schema.d.ts se regenerează cu: npm run api:tipuri (backendul pornit)
import createClient from 'openapi-fetch'
import type { paths } from './schema'
import { reimprospateaza, tokenCurent } from './sesiune'

// Fiecare cerere primește antetul Authorization cu token-ul de acces.
// Dacă serverul răspunde 401 (token expirat), reîmprospătăm sesiunea o dată și repetăm cererea.
export async function fetchAutentificat(cerere: Request): Promise<Response> {
  const copie = cerere.clone() // corpul unei cereri se poate citi o singură dată
  const trimite = (c: Request) => {
    const token = tokenCurent()
    if (token) c.headers.set('Authorization', `Bearer ${token}`)
    return fetch(c)
  }
  const raspuns = await trimite(cerere)
  if (raspuns.status !== 401 || cerere.url.includes('/api/auth/')) return raspuns
  return (await reimprospateaza()) ? trimite(copie) : raspuns
}

// client.GET('/api/studenti/{id}', ...) – adresa, parametrii și răspunsul sunt verificate de TypeScript
export const client = createClient<paths>({ baseUrl: '', fetch: fetchAutentificat })

// O eroare primită de la API: codul HTTP și mesajele serverului.
export class ApiError extends Error {
  readonly status: number
  readonly mesaje: string[]

  constructor(status: number, mesaje: string[]) {
    super(mesaje.join('; '))
    this.name = 'ApiError'
    this.status = status
    this.mesaje = mesaje
  }
}

// Rezultatul unui apel openapi-fetch: datele (la succes) sau eroarea, plus răspunsul HTTP.
interface Rezultat<T> {
  data?: T
  error?: unknown
  response: Response
}

// Așteaptă răspunsul și întoarce datele; la un cod de eroare aruncă ApiError.
// (openapi-fetch nu aruncă singur excepții: întoarce { data } sau { error }.)
export async function date<T>(cerere: Promise<Rezultat<T>>): Promise<T> {
  const { data, error, response } = await cerere
  if (!response.ok) {
    const mesaj = (error as { message?: string | string[] } | undefined)?.message ?? `HTTP ${response.status}`
    throw new ApiError(response.status, Array.isArray(mesaj) ? mesaj : [mesaj])
  }
  return data as T
}

// Mesajele unei erori oarecare, pentru afișare.
export function mesajeDin(e: unknown): string[] {
  if (e instanceof ApiError) return e.mesaje
  if (e instanceof Error) return [e.message]
  return [String(e)]
}
