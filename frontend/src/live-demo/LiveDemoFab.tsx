import { motion } from 'framer-motion'
import { useLiveDemo } from './context/LiveDemoContext'

export default function LiveDemoFab() {
  const { toggle, isOpen } = useLiveDemo()

  if (isOpen) return null

  return (
    <motion.button
      onClick={toggle}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-24 right-6 z-[60] group"
    >
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-2xl bg-cyan-500/20 blur-xl group-hover:bg-cyan-500/30 transition-all" />

      {/* Button body */}
      <div className="relative flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border border-cyan-500/30 bg-[#0a1628]/90 backdrop-blur-xl shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400/50 group-hover:shadow-cyan-500/20 transition-all">
        {/* Live indicator */}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
        </span>

        {/* Cart icon */}
        <svg className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>

        {/* Label */}
        <span className="text-[10px] font-bold tracking-wider text-cyan-400/80 group-hover:text-cyan-300 transition-colors">
          CANLI DEMO
        </span>
      </div>
    </motion.button>
  )
}
