import { useEffect, useState } from 'react'

export function useKeyboardShortcuts(
  next: () => void,
  prev: () => void,
  goToSlide: (i: number) => void,
  totalSlides: number
) {
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          next()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prev()
          break
        case 'Home':
          e.preventDefault()
          goToSlide(0)
          break
        case 'End':
          e.preventDefault()
          goToSlide(totalSlides - 1)
          break
        case '?':
          setShowHelp(s => !s)
          break
        case 'Escape':
          setShowHelp(false)
          break
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev, goToSlide, totalSlides])

  return { showHelp, setShowHelp }
}
