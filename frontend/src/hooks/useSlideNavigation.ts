import { useState, useCallback } from 'react'

export function useSlideNavigation(totalSlides: number) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')

  const goToSlide = useCallback((index: number) => {
    if (index < 0 || index >= totalSlides) return
    setDirection(index > currentSlide ? 'forward' : 'backward')
    setCurrentSlide(index)
  }, [currentSlide, totalSlides])

  const next = useCallback(() => {
    if (currentSlide < totalSlides - 1) {
      setDirection('forward')
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide, totalSlides])

  const prev = useCallback(() => {
    if (currentSlide > 0) {
      setDirection('backward')
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  return { currentSlide, direction, goToSlide, next, prev, totalSlides }
}
