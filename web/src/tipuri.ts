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
  _count?: { grupe: number } // numărul de grupe (doar în listă)
}

export interface Grupa {
  id: number
  cod: string
  an: number
  capacitate: number
  specializareId: number
  specializare: Pick<Specializare, 'id' | 'cod' | 'denumire'>
}

// Datele trimise la creare/modificare: fără id și fără câmpurile calculate de server.
export type SpecializareDate = Pick<Specializare, 'cod' | 'denumire'>
export type GrupaDate = Pick<Grupa, 'cod' | 'an' | 'capacitate' | 'specializareId'>
