import { motion } from 'framer-motion'

interface Props {
  value: number
  max: number
  label: string
  suffix?: string
  thresholds?: { red: number; yellow: number }
}

export default function PerformanceGauge({ value, max, label, suffix = '%', thresholds = { red: 60, yellow: 80 } }: Props) {
  const percent = Math.min((value / max) * 100, 100)
  const angle = (percent / 100) * 180 - 90 // -90 to 90 degrees

  const getColor = () => {
    if (percent >= thresholds.yellow) return '#22c55e'
    if (percent >= thresholds.red) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 120" className="w-full max-w-[160px]">
        {/* Background arc segments */}
        <path d="M 20 100 A 80 80 0 0 1 66 33" fill="none" stroke="#ef444430" strokeWidth="12" strokeLinecap="round" />
        <path d="M 66 33 A 80 80 0 0 1 134 33" fill="none" stroke="#f59e0b30" strokeWidth="12" strokeLinecap="round" />
        <path d="M 134 33 A 80 80 0 0 1 180 100" fill="none" stroke="#22c55e30" strokeWidth="12" strokeLinecap="round" />

        {/* Needle */}
        <motion.line
          x1="100" y1="100"
          x2="100" y2="30"
          stroke={getColor()}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: '100px 100px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', damping: 15 }}
        />
        <circle cx="100" cy="100" r="5" fill={getColor()} />

        {/* Value text */}
        <text x="100" y="92" fill="white" fontSize="20" fontWeight="700" textAnchor="middle" fontFamily="monospace">
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        </text>
        <text x="100" y="105" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">
          {suffix}
        </text>
      </svg>
      <p className="text-[10px] text-gray-500 -mt-1">{label}</p>
    </div>
  )
}
