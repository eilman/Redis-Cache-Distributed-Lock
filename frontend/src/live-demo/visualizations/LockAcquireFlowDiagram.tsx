import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const entities = [
  { id: 'client', label: 'Müşteri', x: 65, color: '#3b82f6' },
  { id: 'api', label: 'API Server', x: 195, color: '#06b6d4' },
  { id: 'redis', label: 'Redis', x: 330, color: '#DC382D' },
  { id: 'db', label: 'PostgreSQL', x: 460, color: '#22c55e' },
]

const arrows = [
  { from: 'client', to: 'api', label: '1. POST /order', y: 76, color: '#3b82f6' },
  { from: 'api', to: 'redis', label: '2. SET lock NX PX', y: 114, color: '#a855f7' },
  { from: 'redis', to: 'api', label: '3. OK (acquired)', y: 150, color: '#22c55e' },
  { from: 'api', to: 'db', label: '4. UPDATE stock', y: 190, color: '#06b6d4' },
  { from: 'api', to: 'redis', label: '5. DEL lock', y: 228, color: '#f59e0b' },
  { from: 'api', to: 'client', label: '6. 200 OK', y: 266, color: '#22c55e' },
]

export default function LockAcquireFlowDiagram() {
  const [active, setActive] = useState(-1)

  useEffect(() => {
    const timer = setInterval(() => setActive(s => (s + 1) % (arrows.length + 2)), 1100)
    return () => clearInterval(timer)
  }, [])

  const getX = (id: string) => entities.find(e => e.id === id)!.x

  return (
    <svg viewBox="0 0 530 290" className="w-full max-w-lg mx-auto">
      <defs>
        <filter id="glow-lf">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="lock-zone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0.05" />
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

      {/* Critical section: lock held zone (step 3 → step 5) */}
      <rect x={getX('api') - 22} y={150} width={44} height={78} rx={4}
        fill="url(#lock-zone)" />
      <text x={getX('api')} y={186} fill="#a855f7" fontSize="6.5" fontWeight="700"
        textAnchor="middle" opacity={0.4} letterSpacing="1.5">
        LOCK
      </text>
      <text x={getX('api')} y={196} fill="#a855f7" fontSize="6.5" fontWeight="700"
        textAnchor="middle" opacity={0.4} letterSpacing="1.5">
        HELD
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

        return (
          <g key={i}>
            {/* Arrow line */}
            <line x1={fromX} y1={a.y} x2={toX} y2={a.y}
              stroke={lineColor}
              strokeWidth={isActive ? 2 : 0.8}
              filter={isActive ? 'url(#glow-lf)' : undefined}
            />
            {/* Arrowhead */}
            <polygon
              points={`${tipX},${a.y - 3.5} ${toX},${a.y} ${tipX},${a.y + 3.5}`}
              fill={lineColor}
            />
            {/* Animated particle */}
            {isActive && (
              <motion.circle cx={fromX} cy={a.y} r={3.5}
                fill={a.color} filter="url(#glow-lf)"
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
