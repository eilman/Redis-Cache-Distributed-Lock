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
  const angle = (percent / 100) * 180 - 90

  const getColor = () => {
    if (percent >= thresholds.yellow) return '#4ade80'
    if (percent >= thresholds.red) return '#fbbf24'
    return '#f87171'
  }

  const displayValue = typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 220 130" className="w-full max-w-[160px]">
        <defs>
          <filter id="pg-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b1" />
            <feGaussianBlur stdDeviation="2" result="b2" />
            <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pg-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background arc glow */}
        <path d="M 30 110 A 80 80 0 0 1 76 43" fill="none" stroke="#f87171" strokeWidth="14" strokeLinecap="round" opacity={0.06} filter="url(#pg-glow)" />
        <path d="M 76 43 A 80 80 0 0 1 144 43" fill="none" stroke="#fbbf24" strokeWidth="14" strokeLinecap="round" opacity={0.06} filter="url(#pg-glow)" />
        <path d="M 144 43 A 80 80 0 0 1 190 110" fill="none" stroke="#4ade80" strokeWidth="14" strokeLinecap="round" opacity={0.06} filter="url(#pg-glow)" />

        {/* Core arc segments */}
        <path d="M 30 110 A 80 80 0 0 1 76 43" fill="none" stroke="#f87171" strokeWidth="12" strokeLinecap="round" opacity={0.25} />
        <path d="M 76 43 A 80 80 0 0 1 144 43" fill="none" stroke="#fbbf24" strokeWidth="12" strokeLinecap="round" opacity={0.25} />
        <path d="M 144 43 A 80 80 0 0 1 190 110" fill="none" stroke="#4ade80" strokeWidth="12" strokeLinecap="round" opacity={0.25} />

        {/* Needle with neon glow */}
        <motion.line x1="110" y1="110" x2="110" y2="40"
          stroke={getColor()} strokeWidth="2.5" strokeLinecap="round"
          filter="url(#pg-glow)"
          style={{ transformOrigin: '110px 110px' }}
          animate={{ rotate: angle }}
          transition={{ type: 'spring', damping: 15 }}
        />
        {/* Pivot with neon */}
        <circle cx="110" cy="110" r="6" fill={getColor()} opacity={0.15} filter="url(#pg-neon)" />
        <circle cx="110" cy="110" r="4" fill={getColor()} />

        {/* Value */}
        <text x="110" y="100" fill="white" fontSize="18" fontWeight="700"
          textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
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
