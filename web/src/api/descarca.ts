// Descărcarea unui fișier generat de API.
// O legătură obișnuită (<a href="/api/...">) nu ar trimite token-ul de acces, care stă
// în memorie, nu într-un cookie. Așa că cerem fișierul cu fetch (prin clientul nostru,
// cu antetul Authorization), apoi îl „dăm” browserului ca pe un fișier local.
export function salveazaFisier(continut: Blob, numeFisier: string) {
  const adresa = URL.createObjectURL(continut) // o adresă temporară, „blob:...”, spre datele din memorie
  const legatura = document.createElement('a')
  legatura.href = adresa
  legatura.download = numeFisier
  legatura.click()
  URL.revokeObjectURL(adresa) // eliberăm memoria
}
