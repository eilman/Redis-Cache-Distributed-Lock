import { motion } from 'framer-motion'

interface Props {
  onClick: () => void
  loading?: boolean
  variant?: 'primary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md'
  icon?: JSX.Element
  children: React.ReactNode
  disabled?: boolean
}

const variants = {
  primary: 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/50 shadow-cyan-500/5',
  danger: 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-400/50 shadow-red-500/5',
  success: 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50 shadow-green-500/5',
  warning: 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-400/50 shadow-amber-500/5',
}

export default function ActionButton({ onClick, loading, variant = 'primary', size = 'md', icon, children, disabled }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading || disabled}
      className={`inline-flex items-center gap-2 rounded-lg border bg-white/[0.02] font-medium transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${
        size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      }`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
      ) : icon ? (
        <span className="w-4 h-4">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  )
}
