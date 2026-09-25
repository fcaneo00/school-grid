import type { Row } from '@tanstack/vue-table'

// UTable smonta la riga espansa con un v-if interno che non aspetta nessuna
// animazione di chiusura nostra (un <Transition> annidato lì dentro non riesce
// mai a intercettare la rimozione, parte e finisce nello stesso istante).
// Rimandiamo noi stessi la chiamata reale a toggleExpanded() finché l'animazione
// di chiusura non è finita - l'apertura invece usa @starting-style in CSS,
// che anima correttamente un elemento appena inserito senza bisogno di questo.
const CLOSE_ANIMATION_MS = 300

export function useExpandRowAnimation<TData>() {
  const closingRowIds = reactive(new Set<string>())

  function toggleRow(row: Row<TData>) {
    if (!row.getIsExpanded()) {
      row.toggleExpanded()
      return
    }
    if (closingRowIds.has(row.id)) return
    closingRowIds.add(row.id)
    setTimeout(() => {
      row.toggleExpanded()
      closingRowIds.delete(row.id)
    }, CLOSE_ANIMATION_MS)
  }

  function isClosing(row: Row<TData>) {
    return closingRowIds.has(row.id)
  }

  // getIsExpanded() da solo non basta per cose che devono reagire subito al
  // click (es. la rotazione della freccia): resta true per tutta la finestra
  // di chiusura ritardata sopra, quindi va combinato con isClosing().
  function isOpen(row: Row<TData>) {
    return row.getIsExpanded() && !isClosing(row)
  }

  return { toggleRow, isClosing, isOpen }
}
