// Afișează una sau mai multe erori. Nu afișează nimic dacă lista e goală.
interface Props {
  mesaje: string[]
}

export default function MesajEroare({ mesaje }: Props) {
  if (mesaje.length === 0) return null
  // același mesaj poate veni de mai multe ori de la server: păstrăm doar valorile distincte
  const distincte = [...new Set(mesaje)]
  return (
    <div className="mesaj eroare">
      {distincte.length === 1 ? (
        distincte[0]
      ) : (
        <ul>
          {distincte.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
