// Funcțiile prin care frontendul vorbește cu backendul.
// Toate cererile trec prin acest fișier: un singur loc de modificat mai târziu.

// <T> este un parametru de tip (generic): cine apelează spune ce tip de date așteaptă,
// de exemplu citeste<Specializare[]>('/api/specializari').
export async function citeste<T>(url: string): Promise<T> {
  const raspuns = await fetch(url)
  if (!raspuns.ok) {
    throw new Error(`serverul a răspuns cu HTTP ${raspuns.status}`)
  }
  return (await raspuns.json()) as T
}
