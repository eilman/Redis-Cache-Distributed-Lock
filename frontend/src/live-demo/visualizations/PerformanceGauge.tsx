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

  const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-full max-w-[160px]">
        {/* Background arc segments */}
        <path d="M 30 110 A 80 80 0 0 1 76 43" fill="none" stroke="#ef444430" strokeWidth="12" strokeLinecap="round" />
        <path d="M 76 43 A 80 80 0 0 1 144 43" fill="none" stroke="#f59e0b30" strokeWidth="12" strokeLinecap="round" />
        <path d="M 144 43 A 80 80 0 0 1 190 110" fill="none" stroke="#22c55e30" strokeWidth="12" strokeLinecap="round" />

        {/* Needle */}
        <motion.line
          x1="110" y1="110"
          x2="110" y2="40"
          stroke={getColor()}
          strokeWidth="2.5"
          strokeLinecap="round"
          style={{ transformOrigin: '110px 110px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', damping: 15 }}
        />
        <circle cx="110" cy="110" r="5" fill={getColor()} />

        {/* Value text - below needle pivot */}
        <text x="110" y="100" fill="white" fontSize="18" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
          {displayValue}
        </text>
        <text x="110" y="118" fill="rgba(255,255,255,0.4)" fontSize="10" textAnchor="middle">
          {suffix}
        </text>
      </svg>
      <p className="text-[10px] text-gray-500 -mt-1">{label}</p>
    </div>
  )
}
