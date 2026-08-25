import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  currentSlide: number
  totalSlides: number
  next: () => void
  prev: () => void
  showHelp: boolean
  setShowHelp: (v: boolean) => void
}

export default function SlideNavigation({ currentSlide, totalSlides, next, prev, showHelp, setShowHelp }: Props) {
  return (
    <>
      {/* Navigation controls - bottom right */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <button
          onClick={prev}
          disabled={currentSlide === 0}
          className="w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <span className="text-sm text-gray-400 font-mono min-w-[60px] text-center">
          {currentSlide + 1} / {totalSlides}
        </span>

        <button
          onClick={next}
          disabled={currentSlide === totalSlides - 1}
          className="w-10 h-10 rounded-full glass flex items-center justify-center disabled:opacity-30 hover:bg-white/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-8 h-8 rounded-full text-gray-500 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors text-sm font-bold"
        >
          ?
        </button>
      </div>

      {/* Keyboard help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass p-8 max-w-md"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold mb-4">Klavye Kisayollari</h3>
              <div className="space-y-2 text-sm">
                {[
                  ['→ / Space', 'Sonraki slide'],
                  ['←', 'Onceki slide'],
                  ['Home', 'İlk slide'],
                  ['End', 'Son slide'],
                  ['?', 'Bu menüyü ac/kapat'],
                  ['Esc', 'Kapat'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex justify-between">
                    <kbd className="px-2 py-0.5 bg-white/10 rounded text-xs font-mono">{key}</kbd>
                    <span className="text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
