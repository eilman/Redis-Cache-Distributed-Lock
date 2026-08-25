import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLiveDemo } from './context/LiveDemoContext'
import LiveDemoHeader from './LiveDemoHeader'
import LiveDemoSidebar from './LiveDemoSidebar'
import LiveDemoContent from './LiveDemoContent'

export default function LiveDemoOverlay() {
  const { isOpen, close } = useLiveDemo()

  // ESC to close + block slide navigation
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        e.stopPropagation()
      }
      // Block arrow keys from reaching slide navigation
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.stopPropagation()
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [isOpen, close])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 200 }}
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ background: '#050a18' }}
        >
          {/* Ambient gradient blobs */}
          <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            <div
              className="absolute animate-pulse-slow"
              style={{
                top: '-10%', left: '-5%',
                width: '50%', height: '50%',
                background: 'radial-gradient(circle, rgba(0,240,255,0.04) 0%, transparent 70%)',
                filter: 'blur(80px)',
              }}
            />
            <div
              className="absolute animate-pulse-slow"
              style={{
                bottom: '-15%', right: '-10%',
                width: '55%', height: '55%',
                background: 'radial-gradient(circle, rgba(176,64,255,0.03) 0%, transparent 70%)',
                filter: 'blur(80px)',
                animationDelay: '1.5s',
              }}
            />
            {/* Grid overlay */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,240,255,0.015) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,240,255,0.015) 1px, transparent 1px)
                `,
                backgroundSize: '80px 80px',
              }}
            />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col h-full">
            <LiveDemoHeader />
            <div className="flex flex-1 min-h-0">
              <LiveDemoSidebar />
              <LiveDemoContent />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
