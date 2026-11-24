// Încărcarea fișierelor. Corpul cererii nu este JSON, ci multipart/form-data (FormData),
// așa că folosim direct fetch-ul autentificat (cu token și reîmprospătare), nu clientul tipizat.
import { ApiError, fetchAutentificat } from './client'

export async function incarcaFisier<T>(adresa: string, fisier: File): Promise<T | undefined> {
  const formular = new FormData()
  formular.append('fisier', fisier) // același nume de câmp ca în FileInterceptor('fisier')
  // NU setăm Content-Type: browserul îl completează singur, cu „boundary” (separatorul părților)
  const raspuns = await fetchAutentificat(new Request(adresa, { method: 'POST', body: formular }))
  if (!raspuns.ok) {
    const eroare = await raspuns.json().catch(() => null)
    const mesaj = eroare?.message ?? `HTTP ${raspuns.status}`
    throw new ApiError(raspuns.status, Array.isArray(mesaj) ? mesaj : [mesaj])
  }
  return raspuns.status === 204 ? undefined : ((await raspuns.json()) as T)
}
