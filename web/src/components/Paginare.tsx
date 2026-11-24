interface Props {
  pagina: number
  perPagina: number
  total: number
  onPagina: (pagina: number) => void
}

// Navigarea între pagini: « Prima, ‹ Anterioara, „pagina 2 din 12”, Următoarea ›, Ultima »
export default function Paginare({ pagina, perPagina, total, onPagina }: Props) {
  const nrPagini = Math.max(1, Math.ceil(total / perPagina))
  const primul = total === 0 ? 0 : (pagina - 1) * perPagina + 1
  const ultimul = Math.min(pagina * perPagina, total)

  return (
    <div className="paginare">
      <span className="nota">
        {primul}–{ultimul} din {total}
      </span>
      <div className="butoane">
        <button className="mic secundar" disabled={pagina <= 1} onClick={() => onPagina(1)}>«</button>
        <button className="mic secundar" disabled={pagina <= 1} onClick={() => onPagina(pagina - 1)}>‹ Anterioara</button>
        <span>pagina {pagina} din {nrPagini}</span>
        <button className="mic secundar" disabled={pagina >= nrPagini} onClick={() => onPagina(pagina + 1)}>Următoarea ›</button>
        <button className="mic secundar" disabled={pagina >= nrPagini} onClick={() => onPagina(nrPagini)}>»</button>
      </div>
    </div>
  )
}
