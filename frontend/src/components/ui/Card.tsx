import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  glow?: 'red' | 'indigo' | 'cyan' | 'purple' | 'none'
  onClick?: () => void
}

export default function Card({ children, className = '', glow = 'none', onClick }: Props) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02 } : undefined}
      className={`glass p-6 ${glow === 'red' ? 'glow-red' : glow === 'indigo' ? 'glow-indigo' : glow === 'cyan' ? 'glow-cyan' : glow === 'purple' ? 'glow-purple' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
