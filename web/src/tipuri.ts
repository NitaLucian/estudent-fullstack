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

export interface AnStudiu {
  id: number
  numar: number
  denumire: string
}

export interface AnUniversitar {
  id: number
  cod: string
  dataInceput: string
  dataSfarsit: string
  curent: boolean
  _count?: { inscrieri: number }
}

export interface Grupa {
  id: number
  cod: string
  anStudiuId: number
  specializareId: number
  specializare: Pick<Specializare, 'id' | 'cod' | 'denumire'>
  anStudiu: AnStudiu
}

// grupa, așa cum apare în datele unui student (an = numărul anului de studiu)
export interface GrupaStudent {
  id: number
  cod: string
  an: number
  specializare: { id: number; cod: string }
}

export interface Student {
  id: number
  nrMatricol: string
  nume: string
  prenume: string
  email: string
  dataNasterii: string | null // text ISO: „2006-03-15T00:00:00.000Z”
  grupa: GrupaStudent | null // grupa din anul universitar curent
}

// fișa studentului: și istoricul înscrierilor
export interface StudentDetaliu extends Student {
  inscrieri: {
    id: number
    anUniversitar: Pick<AnUniversitar, 'id' | 'cod' | 'curent'>
    grupa: GrupaStudent
  }[]
}

// O pagină dintr-o listă paginată, așa cum o trimite API-ul.
export interface Pagina<T> {
  date: T[]
  total: number
  pagina: number
  perPagina: number
}

export type GradDidactic = 'ASISTENT' | 'LECTOR' | 'CONFERENTIAR' | 'PROFESOR'

export interface Profesor {
  id: number
  nume: string
  prenume: string
  email: string
  grad: GradDidactic
  _count?: { predari: number } // disciplinele predate în anul curent (doar în listă)
}

export interface Disciplina {
  id: number
  cod: string
  denumire: string
  credite: number
  semestru: number
  specializareId: number
  anStudiuId: number
  specializare: { id: number; cod: string }
  anStudiu: { id: number; numar: number }
  predari: { id: number; profesor: Pick<Profesor, 'id' | 'nume' | 'prenume' | 'grad'> }[]
}

// profesorul cu toate disciplinele predate, în toți anii
export interface ProfesorDetaliu extends Profesor {
  predari: {
    id: number
    disciplina: Pick<Disciplina, 'id' | 'cod' | 'denumire' | 'credite' | 'semestru'> & {
      specializare: { cod: string }
      anStudiu: { numar: number }
    }
    anUniversitar: Pick<AnUniversitar, 'id' | 'cod' | 'curent'>
  }[]
}

// Datele trimise la creare/modificare: fără id și fără câmpurile calculate de server.
export interface StudentDate {
  nrMatricol: string
  nume: string
  prenume: string
  email: string
  dataNasterii: string | null // „2006-03-15” sau null
  grupaId?: number | null // doar la adăugare: înscrierea în anul curent
}
export type SpecializareDate = Pick<Specializare, 'cod' | 'denumire'>
export type GrupaDate = Pick<Grupa, 'cod' | 'anStudiuId' | 'specializareId'>
export type DisciplinaDate = Pick<Disciplina, 'cod' | 'denumire' | 'credite' | 'semestru' | 'specializareId' | 'anStudiuId'>
export type ProfesorDate = Pick<Profesor, 'nume' | 'prenume' | 'email' | 'grad'>
