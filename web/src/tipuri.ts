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
  specializareId: number
  specializare: Pick<Specializare, 'id' | 'cod' | 'denumire'>
}

// Grupa, așa cum o trimite GET /api/grupe/:id: cu lista studenților
export interface GrupaCuStudenti extends Grupa {
  studenti: Pick<Student, 'id' | 'nrMatricol' | 'nume' | 'prenume' | 'email'>[]
}

export interface Student {
  id: number
  nrMatricol: string
  nume: string
  prenume: string
  email: string
  dataNasterii: string | null // text ISO: „2006-03-15T00:00:00.000Z”
  grupaId: number | null
  grupa: {
    id: number
    cod: string
    an: number
    specializare: { id: number; cod: string }
  } | null
}

// O pagină dintr-o listă paginată, așa cum o trimite API-ul.
export interface Pagina<T> {
  date: T[]
  total: number
  pagina: number
  perPagina: number
}

// Datele trimise la creare/modificare: fără id și fără câmpurile calculate de server.
export type StudentDate = Pick<Student, 'nrMatricol' | 'nume' | 'prenume' | 'email' | 'grupaId'> & {
  dataNasterii: string | null // „2006-03-15” sau null
}
export type SpecializareDate = Pick<Specializare, 'cod' | 'denumire'>
export type GrupaDate = Pick<Grupa, 'cod' | 'an' | 'specializareId'>
