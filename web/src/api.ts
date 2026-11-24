// Funcțiile prin care frontendul vorbește cu backendul.
// Toate cererile trec prin acest fișier: un singur loc de modificat mai târziu.

// O eroare primită de la API: codul HTTP și mesajele serverului.
// Clasa extinde Error, deci poate fi aruncată și prinsă ca orice eroare.
export class ApiError extends Error {
  readonly status: number
  readonly mesaje: string[]

  constructor(status: number, mesaje: string[]) {
    super(mesaje.join('; ')) // constructorul clasei de bază (Error) primește textul erorii
    this.name = 'ApiError'
    this.status = status
    this.mesaje = mesaje
  }
}

type Metoda = 'GET' | 'POST' | 'PATCH' | 'DELETE'

// Trimite o cerere HTTP și întoarce răspunsul JSON, cu tipul T ales de apelant.
async function trimite<T>(metoda: Metoda, url: string, corp?: unknown): Promise<T> {
  const raspuns = await fetch(url, {
    method: metoda,
    headers: corp !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: corp !== undefined ? JSON.stringify(corp) : undefined,
  })

  if (!raspuns.ok) {
    // NestJS trimite erorile ca { statusCode, message, ... }; message poate fi text sau listă
    const eroare = await raspuns.json().catch(() => null)
    const mesaj = eroare?.message ?? `HTTP ${raspuns.status}`
    throw new ApiError(raspuns.status, Array.isArray(mesaj) ? mesaj : [mesaj])
  }

  // 204 No Content (de ex. după DELETE) nu are corp
  if (raspuns.status === 204) return undefined as T
  return (await raspuns.json()) as T
}

export const citeste = <T>(url: string) => trimite<T>('GET', url)
export const creeaza = <T>(url: string, date: unknown) => trimite<T>('POST', url, date)
export const modifica = <T>(url: string, date: unknown) => trimite<T>('PATCH', url, date)
export const sterge = (url: string) => trimite<void>('DELETE', url)

// Mesajele unei erori oarecare, pentru afișare.
export function mesajeDin(e: unknown): string[] {
  if (e instanceof ApiError) return e.mesaje
  if (e instanceof Error) return [e.message]
  return [String(e)]
}
