import { useState, type FormEvent } from 'react'
import { client, date, mesajeDin } from '../api/client'
import { useAuth } from '../auth/context'
import MesajEroare from '../components/MesajEroare'

// Pagina „Contul meu”: datele contului și schimbarea parolei
export default function ContPage() {
  const { utilizator } = useAuth()
  const [veche, setVeche] = useState('')
  const [noua, setNoua] = useState('')
  const [confirmare, setConfirmare] = useState('')
  const [erori, setErori] = useState<string[]>([])
  const [succes, setSucces] = useState(false)

  async function laTrimitere(ev: FormEvent) {
    ev.preventDefault()
    setSucces(false)
    // „parolele coincid” se verifică doar în browser: serverul primește o singură parolă nouă
    if (noua !== confirmare) {
      setErori(['Parola nouă și confirmarea diferă'])
      return
    }
    try {
      await date(client.PATCH('/api/auth/parola', { body: { parolaVeche: veche, parolaNoua: noua } }))
      setErori([])
      setSucces(true)
      setVeche('')
      setNoua('')
      setConfirmare('')
    } catch (e) {
      setErori(mesajeDin(e))
    }
  }

  return (
    <>
      <h1>Contul meu</h1>
      <section className="card">
        <dl className="detalii">
          <dt>Nume</dt>
          <dd>{utilizator?.nume}</dd>
          <dt>Email</dt>
          <dd>{utilizator?.email}</dd>
        </dl>
      </section>
      <form className="card formular" onSubmit={laTrimitere}>
        <h2>Schimbarea parolei</h2>
        <label>
          Parola actuală
          <input type="password" autoComplete="current-password" value={veche} onChange={(e) => setVeche(e.target.value)} required />
        </label>
        <label>
          Parola nouă (cel puțin 10 caractere)
          <input type="password" autoComplete="new-password" value={noua} onChange={(e) => setNoua(e.target.value)} required />
        </label>
        <label>
          Confirmarea parolei noi
          <input type="password" autoComplete="new-password" value={confirmare} onChange={(e) => setConfirmare(e.target.value)} required />
        </label>
        <MesajEroare mesaje={erori} />
        {succes && <p className="mesaj succes">Parola a fost schimbată. Celelalte sesiuni au fost închise.</p>}
        <div className="butoane">
          <button type="submit">Schimbă parola</button>
        </div>
      </form>
    </>
  )
}
