import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const entities = [
  { id: 'client', label: 'Müşteri', x: 65, color: '#3b82f6' },
  { id: 'api', label: 'API Server', x: 195, color: '#06b6d4' },
  { id: 'redis', label: 'Redis', x: 330, color: '#DC382D' },
  { id: 'db', label: 'PostgreSQL', x: 460, color: '#22c55e' },
]

const arrows = [
  { from: 'client', to: 'api', label: '1. GET /product', y: 76, color: '#3b82f6' },
  { from: 'api', to: 'redis', label: '2. GET cache:key', y: 114, color: '#DC382D' },
  { from: 'redis', to: 'api', label: '3. ERROR!', y: 150, color: '#ef4444' },
  { from: 'api', to: 'db', label: '4. Fallback query', y: 196, color: '#f59e0b' },
  { from: 'db', to: 'api', label: '5. Data', y: 232, color: '#22c55e' },
  { from: 'api', to: 'client', label: '6. 200 OK', y: 268, color: '#22c55e' },
]

export default function CircuitBreakerFlowDiagram() {
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const timer = setInterval(() => setActive(s => (s + 1) % (arrows.length + 2)), 1100)
    return () => clearInterval(timer)
  }, [])

  const getX = (id: string) => entities.find(e => e.id === id)!.x

  return (
    <svg viewBox="0 0 530 290" className="w-full max-w-lg mx-auto">
      <defs>
        <filter id="glow-cb">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="error-zone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#ef4444" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="fallback-zone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.04" />
          <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* Entity header boxes */}
      {entities.map(ent => (
        <g key={ent.id}>
          <rect x={ent.x - 50} y={10} width={100} height={32} rx={6}
            fill={ent.color + '15'} stroke={ent.color + '50'} strokeWidth={1.2} />
          <text x={ent.x} y={26} fill="white" fontSize="10" fontWeight="600"
            textAnchor="middle" dominantBaseline="middle">
            {ent.label}
          </text>
        </g>
      ))}

      {/* Lifelines */}
      {entities.map(ent => (
        <line key={`ll-${ent.id}`}
          x1={ent.x} y1={42} x2={ent.x} y2={285}
          stroke={ent.color + '15'} strokeWidth={1} strokeDasharray="4 3" />
      ))}

      {/* Redis error zone (step 2-3 area) */}
      <rect x={getX('redis') - 22} y={105} width={44} height={55} rx={4}
        fill="url(#error-zone)" />
      <text x={getX('redis')} y={160} fill="#ef4444" fontSize="6" fontWeight="700"
        textAnchor="middle" opacity={0.5} letterSpacing="1">
        DOWN
      </text>

      {/* Fallback zone (step 4-5 area on API lifeline) */}
      <rect x={getX('api') - 22} y={186} width={44} height={56} rx={4}
        fill="url(#fallback-zone)" />
      <text x={getX('api')} y={218} fill="#f59e0b" fontSize="5.5" fontWeight="700"
        textAnchor="middle" opacity={0.4} letterSpacing="1">
        FALLBACK
      </text>

      {/* Arrows */}
      {arrows.map((a, i) => {
        const fromX = getX(a.from)
        const toX = getX(a.to)
        const isActive = active === i
        const isPast = active > i
        const isRight = toX > fromX
        const tipX = isRight ? toX - 5 : toX + 5
        const lineColor = isActive ? a.color : isPast ? a.color + '35' : 'rgba(255,255,255,0.06)'
        const isError = i === 2

        return (
          <g key={i}>
            {/* Arrow line */}
            <line x1={fromX} y1={a.y} x2={toX} y2={a.y}
              stroke={lineColor}
              strokeWidth={isActive ? 2 : 0.8}
              strokeDasharray={isError && isActive ? '6 3' : undefined}
              filter={isActive ? 'url(#glow-cb)' : undefined}
            />
            {/* Arrowhead */}
            <polygon
              points={`${tipX},${a.y - 3.5} ${toX},${a.y} ${tipX},${a.y + 3.5}`}
              fill={lineColor}
            />
            {/* Animated particle */}
            {isActive && (
              <motion.circle cx={fromX} cy={a.y} r={3.5}
                fill={a.color} filter="url(#glow-cb)"
                animate={{ cx: toX }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
            {/* Label above arrow */}
            <text x={(fromX + toX) / 2} y={a.y - 7}
              fill={isActive ? 'white' : isPast ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)'}
              fontSize="8" textAnchor="middle"
              fontWeight={isActive ? '600' : '400'}
              fontFamily="monospace">
              {a.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
