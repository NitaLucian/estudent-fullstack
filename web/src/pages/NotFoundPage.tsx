import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="card">
      <h1>Pagina nu există</h1>
      <p>Adresa cerută nu corespunde niciunei pagini a aplicației.</p>
      <Link to="/">Înapoi la pagina de start</Link>
    </section>
  )
}
