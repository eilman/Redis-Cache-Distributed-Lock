import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  value: number
  label: string
  prefix?: string
  suffix?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
  decimals?: number
}

export default function MetricTicker({ value, label, prefix = '', suffix = '', color = 'text-cyan-400', size = 'md', decimals = 0 }: Props) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (value === display) return
    const diff = value - display
    const steps = Math.min(Math.abs(diff), 20)
    const increment = diff / steps
    let current = display
    let step = 0

    const timer = setInterval(() => {
      step++
      current += increment
      if (step >= steps) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(current * (10 ** decimals)) / (10 ** decimals))
      }
    }, 30)

    return () => clearInterval(timer)
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black/20 rounded-xl p-3 text-center"
    >
      <p className="text-[9px] text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-bold font-mono ${sizeClasses[size]} ${color}`}>
        {prefix}{decimals > 0 ? display.toFixed(decimals) : display.toLocaleString()}{suffix}
      </p>
    </motion.div>
  )
}
