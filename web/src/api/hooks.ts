// Cererile către API, sub formă de „hook-uri” TanStack Query.
//  - useQuery citește date și le păstrează într-un cache, după o cheie (queryKey);
//  - useMutation modifică date; după succes, invalidăm cheile afectate, iar
//    toate componentele care afișează acele date le recitesc automat.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  DisciplinaDate, GrupaDate, ProfesorDate, SpecializareDate, StudentDate,
} from '../tipuri'
import { client, date } from './client'

// ---------- starea serverului ----------
export function useStareServer() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => date(client.GET('/api/health')),
    retry: false, // dacă serverul e oprit, vrem să aflăm imediat
  })
}

// ---------- ani ----------
export function useAniStudiu() {
  return useQuery({
    queryKey: ['ani-studiu'],
    queryFn: () => date(client.GET('/api/ani-studiu')),
    staleTime: Infinity, // lista nu se schimbă: o citim o singură dată
  })
}

export function useAniUniversitari() {
  return useQuery({ queryKey: ['ani-universitari'], queryFn: () => date(client.GET('/api/ani-universitari')) })
}

export function useCreeazaAnUniversitar() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (corp: { cod: string; dataInceput: string; dataSfarsit: string }) =>
      date(client.POST('/api/ani-universitari', { body: corp })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ani-universitari'] }),
  })
}

export function useStabilesteAnCurent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.POST('/api/ani-universitari/{id}/curent', { params: { path: { id } } })),
    // anul curent schimbă aproape tot ce se afișează: golim tot cache-ul
    onSuccess: () => qc.invalidateQueries(),
  })
}

// ---------- specializări ----------
export function useSpecializari() {
  return useQuery({ queryKey: ['specializari'], queryFn: () => date(client.GET('/api/specializari')) })
}

export function useSalveazaSpecializare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, corp }: { id?: number; corp: SpecializareDate }) =>
      id
        ? date(client.PATCH('/api/specializari/{id}', { params: { path: { id } }, body: corp }))
        : date(client.POST('/api/specializari', { body: corp })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializari'] }),
  })
}

export function useStergeSpecializare() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/specializari/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['specializari'] }),
  })
}

// ---------- grupe ----------
export function useGrupe(specializareId?: number) {
  return useQuery({
    queryKey: ['grupe', { specializareId }],
    queryFn: () => date(client.GET('/api/grupe', { params: { query: { specializareId } } })),
  })
}

export function useSalveazaGrupa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, corp }: { id?: number; corp: GrupaDate }) =>
      id
        ? date(client.PATCH('/api/grupe/{id}', { params: { path: { id } }, body: corp }))
        : date(client.POST('/api/grupe', { body: corp })),
    // grupele apar și în lista specializărilor (numărul de grupe)
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grupe'] })
      qc.invalidateQueries({ queryKey: ['specializari'] })
    },
  })
}

export function useStergeGrupa() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/grupe/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['grupe'] })
      qc.invalidateQueries({ queryKey: ['specializari'] })
    },
  })
}

// ---------- studenți ----------
export interface FiltreStudenti {
  pagina?: number
  cauta?: string
  specializareId?: number
  grupaId?: number
  ordonare?: 'nume' | 'nrMatricol'
}

export function useStudenti(filtre: FiltreStudenti) {
  return useQuery({
    queryKey: ['studenti', 'lista', filtre],
    queryFn: () => date(client.GET('/api/studenti', { params: { query: filtre } })),
    // la schimbarea paginii, tabelul vechi rămâne pe ecran până sosește cel nou
    placeholderData: keepPreviousData,
  })
}

// id lipsă (pagina de adăugare) => interogarea nu pornește (enabled: false)
export function useStudent(id: number | undefined) {
  return useQuery({
    queryKey: ['studenti', id],
    // id! = „știm că aici id nu este undefined” (cererea pleacă doar când enabled este true)
    queryFn: () => date(client.GET('/api/studenti/{id}', { params: { path: { id: id! } } })),
    enabled: id !== undefined,
  })
}

export function useSalveazaStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, corp }: { id?: number; corp: StudentDate }) =>
      id
        ? date(client.PATCH('/api/studenti/{id}', { params: { path: { id } }, body: corp }))
        : date(client.POST('/api/studenti', { body: corp })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studenti'] }),
  })
}

export function useStergeStudent() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/studenti/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['studenti'] }),
  })
}

// ---------- înscrieri ----------
export function useCreeazaInscriere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (corp: { studentId: number; grupaId: number; anUniversitarId?: number }) =>
      date(client.POST('/api/inscrieri', { body: corp })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studenti'] })
      qc.invalidateQueries({ queryKey: ['ani-universitari'] })
    },
  })
}

export function useStergeInscriere() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/inscrieri/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['studenti'] })
      qc.invalidateQueries({ queryKey: ['ani-universitari'] })
    },
  })
}

// ---------- discipline ----------
export interface FiltreDiscipline {
  specializareId?: number
  anStudiuId?: number
  semestru?: 1 | 2
}

export function useDiscipline(filtre: FiltreDiscipline = {}) {
  return useQuery({
    queryKey: ['discipline', filtre],
    queryFn: () => date(client.GET('/api/discipline', { params: { query: filtre } })),
  })
}

export function useSalveazaDisciplina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, corp }: { id?: number; corp: DisciplinaDate }) =>
      id
        ? date(client.PATCH('/api/discipline/{id}', { params: { path: { id } }, body: corp }))
        : date(client.POST('/api/discipline', { body: corp })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discipline'] }),
  })
}

export function useStergeDisciplina() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/discipline/{id}', { params: { path: { id } } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['discipline'] })
      qc.invalidateQueries({ queryKey: ['profesori'] })
    },
  })
}

// ---------- profesori ----------
export function useProfesori() {
  return useQuery({ queryKey: ['profesori'], queryFn: () => date(client.GET('/api/profesori')) })
}

export function useProfesor(id: number) {
  return useQuery({
    queryKey: ['profesori', id],
    queryFn: () => date(client.GET('/api/profesori/{id}', { params: { path: { id } } })),
  })
}

export function useSalveazaProfesor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, corp }: { id?: number; corp: ProfesorDate }) =>
      id
        ? date(client.PATCH('/api/profesori/{id}', { params: { path: { id } }, body: corp }))
        : date(client.POST('/api/profesori', { body: corp })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesori'] }),
  })
}

export function useStergeProfesor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => date(client.DELETE('/api/profesori/{id}', { params: { path: { id } } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profesori'] }),
  })
}

// predările schimbă și fișa profesorului, și lista disciplinelor
export function useAdaugaPredare(profesorId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (disciplinaId: number) =>
      date(client.POST('/api/profesori/{id}/predari', { params: { path: { id: profesorId } }, body: { disciplinaId } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profesori'] })
      qc.invalidateQueries({ queryKey: ['discipline'] })
    },
  })
}

export function useStergePredare(profesorId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (predareId: number) =>
      date(client.DELETE('/api/profesori/{id}/predari/{predareId}', { params: { path: { id: profesorId, predareId } } })),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profesori'] })
      qc.invalidateQueries({ queryKey: ['discipline'] })
    },
  })
}

// ---------- conturi (doar administrator) ----------
export function useConturi(rol?: 'ADMIN' | 'PROFESOR' | 'STUDENT', cauta?: string) {
  return useQuery({
    queryKey: ['conturi', { rol, cauta }],
    queryFn: () => date(client.GET('/api/utilizatori', { params: { query: { rol, cauta } } })),
  })
}

export function useSeteazaActiv() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, activ }: { id: number; activ: boolean }) =>
      date(client.PATCH('/api/utilizatori/{id}/activ', { params: { path: { id } }, body: { activ } })),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['conturi'] }),
  })
}
