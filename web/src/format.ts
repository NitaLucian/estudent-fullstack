// Formatări folosite în mai multe pagini.

// „2006-03-15T00:00:00.000Z” -> „15.03.2006”
// Data nașterii este o dată calendaristică, fără oră: o afișăm în UTC,
// altfel fusul orar al browserului ar putea muta ziua.
export function formatData(iso: string | null | undefined): string {
  if (!iso) return '–'
  return new Date(iso).toLocaleDateString('ro-RO', { timeZone: 'UTC' })
}

// „2006-03-15T00:00:00.000Z” -> „2006-03-15” (valoarea unui <input type="date">)
export function pentruInputData(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : ''
}
