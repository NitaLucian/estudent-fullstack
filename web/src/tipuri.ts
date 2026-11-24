// Tipurile datelor schimbate cu API-ul. Nu le mai scriem de mână: sunt nume scurte
// pentru schemele generate automat din documentația OpenAPI a backendului (api/schema.d.ts).
import type { components } from './api/schema'

type Scheme = components['schemas']

export type StareServer = Scheme['StareServer']
export type Specializare = Scheme['SpecializareCuNumar']
export type AnStudiu = Scheme['AnStudiu']
export type AnUniversitar = Scheme['AnUniversitarCuNumar']
export type Grupa = Scheme['Grupa']
export type GrupaStudent = Scheme['GrupaStudent']
export type Student = Scheme['Student']
export type StudentDetaliu = Scheme['StudentDetaliu']
export type Pagina<T> = { date: T[]; total: number; pagina: number; perPagina: number }
export type GradDidactic = Scheme['GradDidactic']
export type Profesor = Scheme['ProfesorCuNumar']
export type ProfesorDetaliu = Scheme['ProfesorDetaliu']
export type Disciplina = Scheme['Disciplina']

// Datele trimise la creare: exact DTO-urile de creare din backend.
export type SpecializareDate = Scheme['CreateSpecializareDto']
export type GrupaDate = Scheme['CreateGrupaDto']
export type StudentDate = Scheme['CreateStudentDto']
export type DisciplinaDate = Scheme['CreateDisciplinaDto']
export type ProfesorDate = Scheme['CreateProfesorDto']
