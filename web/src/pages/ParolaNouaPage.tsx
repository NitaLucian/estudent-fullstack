import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { client, date, mesajeDin } from '../api/client'
import MesajEroare from '../components/MesajEroare'

// /parola-noua?token=... – alegerea parolei din legătura primită pe email
// (pentru un cont nou sau după „parola uitată”). Pagină publică.
export default function ParolaNouaPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [parola, setParola] = useState('')
  const [confirmare, setConfirmare] = useState('')
  const [gata, setGata] = useState(false)
  const [erori, setErori] = useState<string[]>([])

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    if (parola !== confirmare) {
      setErori(['Parola și confirmarea diferă'])
      return
    }
    try {
      await date(client.POST('/api/auth/parola-noua', { body: { token, parola } }))
      setGata(true)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <div className="pagina-login">
      <form className="card" onSubmit={laTrimitere}>
        <h1>Parola nouă</h1>
        {gata ? (
          <>
            <p className="mesaj succes">Parola a fost salvată. Vă puteți autentifica.</p>
            <Link className="buton" to="/login">Intră în cont</Link>
          </>
        ) : !token ? (
          <p className="mesaj eroare">Legătura este incompletă. Folosiți legătura din email.</p>
        ) : (
          <>
            <label>
              Parola nouă (cel puțin 10 caractere)
              <input type="password" autoComplete="new-password" value={parola} onChange={(e) => setParola(e.target.value)} required />
            </label>
            <label>
              Confirmarea parolei
              <input type="password" autoComplete="new-password" value={confirmare} onChange={(e) => setConfirmare(e.target.value)} required />
            </label>
            <MesajEroare mesaje={erori} />
            <button type="submit">Salvează parola</button>
          </>
        )}
      </form>
    </div>
  )
}
