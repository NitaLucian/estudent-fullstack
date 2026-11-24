import { useRef } from 'react'
import { mesajeDin } from '../api/client'
import { useFotografie, useIncarcaFotografie } from '../api/hooks'
import MesajEroare from './MesajEroare'

// Fotografia studentului. Imaginea vine DIRECT din stocarea S3, printr-o adresă presemnată:
// serverul nostru doar o semnează, nu transferă octeții imaginii.
export default function FotografieStudent({ studentId, poateModifica }: { studentId: number; poateModifica: boolean }) {
  const { data: fotografie } = useFotografie(studentId)
  const incarcare = useIncarcaFotografie(studentId)
  const alegere = useRef<HTMLInputElement>(null) // referință spre elementul <input type="file">

  return (
    <div className="fotografie">
      {fotografie ? <img src={fotografie.url} alt="Fotografia studentului" /> : <div className="fara-fotografie">fără fotografie</div>}
      {poateModifica && (
        <>
          <input
            ref={alegere}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={(e) => {
              const fisier = e.target.files?.[0]
              if (fisier) incarcare.mutate(fisier)
              e.target.value = '' // același fișier poate fi ales din nou
            }}
          />
          <button className="mic secundar" disabled={incarcare.isPending} onClick={() => alegere.current?.click()}>
            {incarcare.isPending ? 'Se încarcă…' : 'Schimbă fotografia'}
          </button>
          <MesajEroare mesaje={incarcare.error ? mesajeDin(incarcare.error) : []} />
        </>
      )}
    </div>
  )
}
