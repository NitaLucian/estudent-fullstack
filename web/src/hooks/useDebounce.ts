import { useEffect, useState } from 'react'

// Întoarce valoarea primită, dar abia după ce aceasta a rămas neschimbată
// „intarziere” milisecunde. Folosită la căutare: cererea pleacă după ce
// utilizatorul s-a oprit din tastat, nu la fiecare literă.
export function useDebounce<T>(valoare: T, intarziere = 400): T {
  const [valoareStabila, setValoareStabila] = useState(valoare)

  useEffect(() => {
    const ceas = setTimeout(() => setValoareStabila(valoare), intarziere)
    // funcția întoarsă de efect rulează înainte de efectul următor:
    // dacă valoarea se schimbă din nou, anulăm ceasul pornit anterior
    return () => clearTimeout(ceas)
  }, [valoare, intarziere])

  return valoareStabila
}
