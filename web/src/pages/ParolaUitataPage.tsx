import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { client, date, mesajeDin } from '../api/client'
import MesajEroare from '../components/MesajEroare'

// /parola-uitata – cererea unei legături de resetare a parolei (pagină publică)
export default function ParolaUitataPage() {
  const [email, setEmail] = useState('')
  const [trimis, setTrimis] = useState(false)
  const [erori, setErori] = useState<string[]>([])

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    try {
      await date(client.POST('/api/auth/parola-uitata', { body: { email: email.trim() } }))
      setTrimis(true)
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <div className="pagina-login">
      <form className="card" onSubmit={laTrimitere}>
        <h1>Parola uitată</h1>
        {trimis ? (
          // același mesaj, oricare ar fi adresa: nu dezvăluim ce adrese au cont
          <p className="mesaj succes">
            Dacă adresa are un cont, veți primi în câteva minute un email cu o legătură pentru alegerea unei parole noi.
          </p>
        ) : (
          <>
            <p className="nota">Introduceți adresa de email a contului.</p>
            <label>
              Email
              <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <MesajEroare mesaje={erori} />
            <button type="submit">Trimite legătura</button>
          </>
        )}
        <Link to="/login">‹ Înapoi la autentificare</Link>
      </form>
    </div>
  )
}
