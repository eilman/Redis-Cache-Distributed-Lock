import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type CacheMode = 'cache-aside' | 'read-through' | 'write-through'

interface Props {
  mode: CacheMode
  isHit?: boolean
}

const entities = [
  { id: 'client', label: 'Müşteri', x: 65, color: '#3b82f6' },
  { id: 'api', label: 'API Server', x: 195, color: '#06b6d4' },
  { id: 'redis', label: 'Redis', x: 330, color: '#DC382D' },
  { id: 'db', label: 'PostgreSQL', x: 460, color: '#22c55e' },
]

interface Arrow { from: string; to: string; label: string; color: string; dashed?: boolean }

function getArrows(mode: CacheMode, isHit: boolean): Arrow[] {
  if (mode === 'cache-aside') {
    if (isHit) {
      return [
        { from: 'client', to: 'api', label: '1. GET /product', color: '#3b82f6' },
        { from: 'api', to: 'redis', label: '2. GET key', color: '#DC382D' },
        { from: 'redis', to: 'api', label: '3. Cache HIT', color: '#22c55e' },
        { from: 'api', to: 'client', label: '4. Response', color: '#22c55e' },
      ]
    }
    return [
      { from: 'client', to: 'api', label: '1. GET /product', color: '#3b82f6' },
      { from: 'api', to: 'redis', label: '2. GET key', color: '#DC382D' },
      { from: 'redis', to: 'api', label: '3. MISS', color: '#f59e0b', dashed: true },
      { from: 'api', to: 'db', label: '4. SELECT *', color: '#06b6d4' },
      { from: 'db', to: 'api', label: '5. Result', color: '#22c55e' },
      { from: 'api', to: 'redis', label: '6. SET key', color: '#DC382D' },
    ]
  }
  if (mode === 'read-through') {
    return [
      { from: 'client', to: 'api', label: '1. GET /product', color: '#3b82f6' },
      { from: 'api', to: 'redis', label: '2. READ key', color: '#DC382D' },
      { from: 'redis', to: 'db', label: '3. Auto LOAD', color: '#f59e0b' },
      { from: 'db', to: 'redis', label: '4. Data', color: '#22c55e' },
      { from: 'redis', to: 'api', label: '5. Cached Data', color: '#22c55e' },
    ]
  }
  // write-through
  return [
    { from: 'client', to: 'api', label: '1. PUT /product', color: '#3b82f6' },
    { from: 'api', to: 'redis', label: '2. SET key', color: '#DC382D' },
    { from: 'redis', to: 'db', label: '3. Sync WRITE', color: '#f59e0b' },
    { from: 'db', to: 'redis', label: '4. ACK', color: '#22c55e' },
    { from: 'redis', to: 'api', label: '5. OK', color: '#22c55e' },
  ]
}

export default function CachePatternFlowDiagram({ mode, isHit = false }: Props) {
  const [active, setActive] = useState(-1)
  const arrows = getArrows(mode, isHit)

  useEffect(() => {
    setActive(-1)
    const timer = setInterval(() => setActive(s => (s + 1) % (arrows.length + 2)), 1100)
    return () => clearInterval(timer)
  }, [mode, isHit, arrows.length])

  const getX = (id: string) => entities.find(e => e.id === id)!.x

  const Y0 = 74
  const Y1 = 268
  const gap = arrows.length > 1 ? (Y1 - Y0) / (arrows.length - 1) : 0

  // Zone indicator config per mode
  const zone = (() => {
    if (mode === 'cache-aside' && isHit)
      return { x: getX('redis'), i1: 1, i2: 2, color: '#22c55e', text: 'HIT' }
    if (mode === 'cache-aside')
      return { x: getX('redis'), i1: 1, i2: 2, color: '#f59e0b', text: 'MISS' }
    if (mode === 'read-through')
      return { x: (getX('redis') + getX('db')) / 2, i1: 2, i2: 3, color: '#f59e0b', text: 'AUTO' }
    return { x: (getX('redis') + getX('db')) / 2, i1: 2, i2: 3, color: '#f59e0b', text: 'SYNC' }
  })()

  const zoneY = Y0 + zone.i1 * gap - 8
  const zoneH = (zone.i2 - zone.i1) * gap + 16
  const zoneMid = zoneY + zoneH / 2

  return (
    <svg viewBox="0 0 530 290" className="w-full max-w-lg mx-auto">
      <defs>
        <filter id="glow-cp">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
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

      {/* Zone indicator */}
      <rect x={zone.x - 22} y={zoneY} width={44} height={zoneH} rx={4}
        fill={zone.color + '0a'} stroke={zone.color + '18'} strokeWidth={0.5} />
      <text x={zone.x} y={zoneMid} fill={zone.color} fontSize="6.5"
        fontWeight="700" textAnchor="middle" dominantBaseline="middle"
        opacity={0.4} letterSpacing="1.5">
        {zone.text}
      </text>

      {/* Step arrows */}
      {arrows.map((a, i) => {
        const y = Y0 + i * gap
        const fromX = getX(a.from)
        const toX = getX(a.to)
        const isActive = active === i
        const isPast = active > i
        const isRight = toX > fromX
        const tipX = isRight ? toX - 5 : toX + 5
        const lineColor = isActive ? a.color : isPast ? a.color + '35' : 'rgba(255,255,255,0.06)'

        return (
          <g key={i}>
            {/* Arrow shaft */}
            <line x1={fromX} y1={y} x2={toX} y2={y}
              stroke={lineColor}
              strokeWidth={isActive ? 2 : 0.8}
              strokeDasharray={a.dashed && isActive ? '6 3' : undefined}
              filter={isActive ? 'url(#glow-cp)' : undefined}
            />
            {/* Arrowhead */}
            <polygon
              points={`${tipX},${y - 3.5} ${toX},${y} ${tipX},${y + 3.5}`}
              fill={lineColor}
            />
            {/* Animated particle */}
            {isActive && (
              <motion.circle cx={fromX} cy={y} r={3.5}
                fill={a.color} filter="url(#glow-cp)"
                animate={{ cx: toX }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
            {/* Label above arrow */}
            <text x={(fromX + toX) / 2} y={y - 7}
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
