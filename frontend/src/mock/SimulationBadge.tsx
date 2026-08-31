import { motion, AnimatePresence } from 'framer-motion'
import { isMockMode } from './mockInterceptor'
import { useState, useEffect } from 'react'

export default function SimulationBadge() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(isMockMode()), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 backdrop-blur-md shadow-lg"
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-amber-400 tracking-wide">
            SIMULATION MODE
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
