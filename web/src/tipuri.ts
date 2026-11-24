// Tipurile datelor primite de la API. Trebuie să corespundă cu ce trimite backendul.

export interface StareServer {
  status: 'ok'
  aplicatie: string
  versiune: string
  ora: string
  bazaDeDate: 'conectată' | 'indisponibilă'
}

export interface Specializare {
  id: number
  cod: string
  denumire: string
}
