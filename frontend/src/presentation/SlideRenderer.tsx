import { motion, AnimatePresence } from 'framer-motion'
import { slideTransitions } from '../theme/animations'

interface Props {
  currentSlide: number
  direction: 'forward' | 'backward'
  slides: React.ComponentType[]
}

export default function SlideRenderer({ currentSlide, direction, slides }: Props) {
  const SlideComponent = slides[currentSlide]
  const transition = direction === 'forward' ? slideTransitions.forward : slideTransitions.backward

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide}
          initial={transition.initial}
          animate={transition.animate}
          exit={transition.exit}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0 overflow-y-auto px-8 md:px-16 lg:px-24 pt-12 pb-8"
        >
          <div className="w-full max-w-6xl mx-auto flex items-center justify-center min-h-full">
            <div className="w-full">
              <SlideComponent />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
