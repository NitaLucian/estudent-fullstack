import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { mesajeDin } from '../api/client'
import { useAuth } from '../auth/context'
import MesajEroare from '../components/MesajEroare'

export default function LoginPage() {
  const { utilizator, login } = useAuth()
  const navigate = useNavigate()
  const deUnde = (useLocation().state as { deUnde?: string } | null)?.deUnde ?? '/'
  const [email, setEmail] = useState('')
  const [parola, setParola] = useState('')
  const [erori, setErori] = useState<string[]>([])
  const [seTrimite, setSeTrimite] = useState(false)

  // deja autentificat: nu are rost să vadă formularul
  if (utilizator) return <Navigate to={deUnde} replace />

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    setSeTrimite(true)
    try {
      await login(email.trim(), parola)
      navigate(deUnde, { replace: true })
    } catch (e) {
      setErori(mesajeDin(e))
      setParola('') // nu păstrăm parola greșită în formular
    } finally {
      setSeTrimite(false)
    }
  }

  return (
    <div className="pagina-login">
      <form className="card" onSubmit={laTrimitere}>
        <h1>eStudent</h1>
        <p className="nota">Autentificați-vă cu adresa instituțională.</p>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Parola
          <input
            type="password"
            autoComplete="current-password"
            value={parola}
            onChange={(e) => setParola(e.target.value)}
            required
          />
        </label>
        <MesajEroare mesaje={erori} />
        <button type="submit" disabled={seTrimite}>{seTrimite ? 'Se verifică…' : 'Intră în cont'}</button>
      </form>
    </div>
  )
}
