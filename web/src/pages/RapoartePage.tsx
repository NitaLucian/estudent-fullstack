import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { client, mesajeDin } from '../api/client'
import { salveazaFisier } from '../api/descarca'
import {
  useAniStudiu, useAniUniversitari, useClasament, useDistributieNote, usePromovabilitate, useSpecializari,
  type FiltreRaport,
} from '../api/hooks'
import MesajEroare from '../components/MesajEroare'
import Tabel, { type Coloana } from '../components/Tabel'
import type { components } from '../api/schema'

type LocClasament = components['schemas']['LocClasament']
type Promovabilitate = components['schemas']['PromovabilitateDisciplina']

const medie = (x: number | null) => (x === null ? '–' : x.toFixed(2))

const coloaneClasament: Coloana<LocClasament>[] = [
  { titlu: 'Loc', celula: (r) => r.loc, clasa: 'numar' },
  { titlu: 'Student', celula: (r) => `${r.nume} ${r.prenume}` },
  { titlu: 'Grupa', celula: (r) => r.grupa },
  { titlu: 'Media ponderată', celula: (r) => <strong>{medie(r.mediePonderata)}</strong>, clasa: 'numar' },
  { titlu: 'Media aritm.', celula: (r) => medie(r.medieAritmetica), clasa: 'numar' },
  { titlu: 'Credite', celula: (r) => r.crediteObtinute, clasa: 'numar' },
  { titlu: 'Restanțe', celula: (r) => r.restante, clasa: 'numar' },
]

const coloanePromovabilitate: Coloana<Promovabilitate>[] = [
  { titlu: 'Disciplina', celula: (d) => `${d.cod} – ${d.denumire}` },
  { titlu: 'Note', celula: (d) => d.numarNote, clasa: 'numar' },
  { titlu: 'Media', celula: (d) => d.medie.toFixed(2), clasa: 'numar' },
  {
    titlu: 'Promovabilitate',
    celula: (d) => (
      <div className="bara-procent" title={`${d.promovati} din ${d.numarNote}`}>
        <div style={{ width: `${d.procent}%` }} />
        <span>{d.procent}%</span>
      </div>
    ),
  },
]

// Pagina de rapoarte (administrator): filtre comune + trei rapoarte + exportul CSV
export default function RapoartePage() {
  const { data: ani = [] } = useAniUniversitari()
  const { data: specializari = [] } = useSpecializari()
  const { data: aniStudiu = [] } = useAniStudiu()
  const [filtre, setFiltre] = useState<FiltreRaport>({})
  const distributie = useDistributieNote(filtre)
  const promovabilitate = usePromovabilitate(filtre)
  const clasament = useClasament(filtre)
  const [eroareCsv, setEroareCsv] = useState<string[]>([])

  const seteaza = (camp: keyof FiltreRaport, valoare: string) =>
    setFiltre({ ...filtre, [camp]: valoare ? Number(valoare) : undefined })

  // un singur mod de descărcare pentru ambele fișiere CSV
  async function descarcaCsv(raport: 'grupe' | 'clasament') {
    try {
      // parseAs: 'blob' – răspunsul este un fișier, nu JSON
      const { data, response } =
        raport === 'grupe'
          ? await client.GET('/api/rapoarte/grupe.csv', { params: { query: filtre }, parseAs: 'blob' })
          : await client.GET('/api/rapoarte/clasament.csv', { params: { query: filtre }, parseAs: 'blob' })
      if (!response.ok || !data) throw new Error(`HTTP ${response.status}`)
      salveazaFisier(data, `${raport}.csv`)
      setEroareCsv([])
    } catch (e) {
      setEroareCsv(mesajeDin(e))
    }
  }

  const erori = [distributie.error, promovabilitate.error, clasament.error].flatMap((e) => (e ? mesajeDin(e) : []))

  return (
    <>
      <div className="titlu-pagina">
        <h1>Rapoarte</h1>
        <button onClick={() => descarcaCsv('grupe')}>Descarcă grupele (CSV)</button>
      </div>
      <div className="bara-filtre">
        <select value={filtre.anUniversitarId ?? ''} onChange={(e) => seteaza('anUniversitarId', e.target.value)}>
          <option value="">anul universitar curent</option>
          {ani.map((a) => <option key={a.id} value={a.id}>{a.cod}</option>)}
        </select>
        <select value={filtre.specializareId ?? ''} onChange={(e) => seteaza('specializareId', e.target.value)}>
          <option value="">toate specializările</option>
          {specializari.map((s) => <option key={s.id} value={s.id}>{s.cod}</option>)}
        </select>
        <select value={filtre.anStudiuId ?? ''} onChange={(e) => seteaza('anStudiuId', e.target.value)}>
          <option value="">toți anii de studiu</option>
          {aniStudiu.map((a) => <option key={a.id} value={a.id}>{a.denumire}</option>)}
        </select>
      </div>
      <MesajEroare mesaje={[...erori, ...eroareCsv]} />

      <section className="card">
        <h2>Distribuția notelor</h2>
        {distributie.data?.length === 0 && <p className="nota">Nu există note pentru filtrele alese.</p>}
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={distributie.data ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="valoare" />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(v) => [v, 'note']} labelFormatter={(n) => `Nota ${n}`} />
              <Bar dataKey="numar" fill="#2e75b6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="card">
        <h2>Disciplinele cu cea mai mică promovabilitate</h2>
        <Tabel coloane={coloanePromovabilitate} randuri={(promovabilitate.data ?? []).slice(0, 10)} cheie={(d) => d.disciplinaId} />
      </section>

      <section className="card">
        <div className="titlu-pagina">
          <h2>Clasament (primii 20)</h2>
          <button className="secundar" onClick={() => descarcaCsv('clasament')}>Tot clasamentul (CSV)</button>
        </div>
        <p className="nota">Locul este calculat separat pentru fiecare specializare și an de studiu.</p>
        <Tabel coloane={coloaneClasament} randuri={(clasament.data ?? []).slice(0, 20)} cheie={(r) => r.studentId} />
      </section>
    </>
  )
}
