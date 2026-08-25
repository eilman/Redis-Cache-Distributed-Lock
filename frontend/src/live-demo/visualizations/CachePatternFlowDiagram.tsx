import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type CacheMode = 'cache-aside' | 'read-through' | 'write-through'

interface Props {
  mode: CacheMode
  isHit?: boolean
}

const entities = [
  { id: 'client', label: 'Müşteri', x: 65, color: '#00d4ff' },
  { id: 'api', label: 'API Server', x: 195, color: '#22d3ee' },
  { id: 'redis', label: 'Redis', x: 330, color: '#f87171' },
  { id: 'db', label: 'PostgreSQL', x: 460, color: '#4ade80' },
]

interface Arrow { from: string; to: string; label: string; color: string; dashed?: boolean }

function getArrows(mode: CacheMode, isHit: boolean): Arrow[] {
  if (mode === 'cache-aside') {
    if (isHit) {
      return [
        { from: 'client', to: 'api', label: '1. GET /product', color: '#00d4ff' },
        { from: 'api', to: 'redis', label: '2. GET key', color: '#f87171' },
        { from: 'redis', to: 'api', label: '3. Cache HIT', color: '#4ade80' },
        { from: 'api', to: 'client', label: '4. Response', color: '#4ade80' },
      ]
    }
    return [
      { from: 'client', to: 'api', label: '1. GET /product', color: '#00d4ff' },
      { from: 'api', to: 'redis', label: '2. GET key', color: '#f87171' },
      { from: 'redis', to: 'api', label: '3. MISS', color: '#fbbf24', dashed: true },
      { from: 'api', to: 'db', label: '4. SELECT *', color: '#22d3ee' },
      { from: 'db', to: 'api', label: '5. Result', color: '#4ade80' },
      { from: 'api', to: 'redis', label: '6. SET key', color: '#f87171' },
    ]
  }
  if (mode === 'read-through') {
    return [
      { from: 'client', to: 'api', label: '1. GET /product', color: '#00d4ff' },
      { from: 'api', to: 'redis', label: '2. READ key', color: '#f87171' },
      { from: 'redis', to: 'db', label: '3. Auto LOAD', color: '#fbbf24' },
      { from: 'db', to: 'redis', label: '4. Data', color: '#4ade80' },
      { from: 'redis', to: 'api', label: '5. Cached Data', color: '#4ade80' },
    ]
  }
  return [
    { from: 'client', to: 'api', label: '1. PUT /product', color: '#00d4ff' },
    { from: 'api', to: 'redis', label: '2. SET key', color: '#f87171' },
    { from: 'redis', to: 'db', label: '3. Sync WRITE', color: '#fbbf24' },
    { from: 'db', to: 'redis', label: '4. ACK', color: '#4ade80' },
    { from: 'redis', to: 'api', label: '5. OK', color: '#4ade80' },
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

  const zone = (() => {
    if (mode === 'cache-aside' && isHit)
      return { x: getX('redis'), i1: 1, i2: 2, color: '#4ade80', text: 'HIT' }
    if (mode === 'cache-aside')
      return { x: getX('redis'), i1: 1, i2: 2, color: '#fbbf24', text: 'MISS' }
    if (mode === 'read-through')
      return { x: (getX('redis') + getX('db')) / 2, i1: 2, i2: 3, color: '#fbbf24', text: 'AUTO' }
    return { x: (getX('redis') + getX('db')) / 2, i1: 2, i2: 3, color: '#fbbf24', text: 'SYNC' }
  })()

  const zoneY = Y0 + zone.i1 * gap - 8
  const zoneH = (zone.i2 - zone.i1) * gap + 16
  const zoneMid = zoneY + zoneH / 2

  return (
    <svg viewBox="0 0 530 290" className="w-full max-w-lg mx-auto">
      <defs>
        <filter id="cp-neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b1" />
          <feGaussianBlur stdDeviation="2" result="b2" />
          <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cp-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="cp-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.4" fill="rgba(255,255,255,0.03)" />
        </pattern>
      </defs>

      <rect width="530" height="290" fill="url(#cp-dots)" />

      {/* Entity header boxes */}
      {entities.map(ent => (
        <g key={ent.id}>
          <rect x={ent.x - 50} y={10} width={100} height={32} rx={6}
            fill={ent.color + '10'} stroke={ent.color} strokeWidth={1.2} opacity={0.9} />
          <line x1={ent.x - 42} y1={10} x2={ent.x + 42} y2={10}
            stroke={ent.color} strokeWidth={2} opacity={0.5} strokeLinecap="round" filter="url(#cp-glow)" />
          <text x={ent.x} y={26} fill="white" fontSize="10" fontWeight="600"
            textAnchor="middle" dominantBaseline="middle">
            {ent.label}
          </text>
        </g>
      ))}

      {/* Flowing lifelines */}
      {entities.map(ent => (
        <motion.line key={`ll-${ent.id}`}
          x1={ent.x} y1={42} x2={ent.x} y2={285}
          stroke={ent.color} strokeWidth={1} opacity={0.1}
          strokeDasharray="3 5"
          animate={{ strokeDashoffset: [0, -16] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Zone indicator */}
      <rect x={zone.x - 22} y={zoneY} width={44} height={zoneH} rx={4}
        fill={zone.color + '0a'} stroke={zone.color + '25'} strokeWidth={0.5} />
      <text x={zone.x} y={zoneMid} fill={zone.color} fontSize="6.5"
        fontWeight="700" textAnchor="middle" dominantBaseline="middle"
        opacity={0.5} letterSpacing="1.5">
        {zone.text}
      </text>

      {/* Step arrows — flowing dot streams */}
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
            {/* Outer glow */}
            {isActive && (
              <line x1={fromX} y1={y} x2={toX} y2={y}
                stroke={a.color} strokeWidth={8} opacity={0.12} filter="url(#cp-glow)" />
            )}
            {/* Flowing dot stream line */}
            <motion.line x1={fromX} y1={y} x2={toX} y2={y}
              stroke={lineColor}
              strokeWidth={isActive ? 2 : isPast ? 1 : 0.5}
              strokeDasharray={isActive ? '3 6' : isPast ? '1.5 7.5' : '1 10'}
              strokeLinecap="round"
              animate={(isActive || isPast) ? { strokeDashoffset: [0, -18] } : {}}
              transition={{ duration: isActive ? 0.5 : 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Arrow tip */}
            <polygon points={`${tipX},${y - 3.5} ${toX},${y} ${tipX},${y + 3.5}`}
              fill={lineColor} filter={isActive ? 'url(#cp-glow)' : undefined} />
            {/* Multiple flowing particles */}
            {isActive && [0, 0.15, 0.3].map((delay, pi) => (
              <motion.circle key={pi}
                cx={fromX} cy={y} r={4 - pi * 1.2}
                fill="white" filter="url(#cp-neon)"
                animate={{ cx: toX, opacity: [1 - pi * 0.3, 0] }}
                transition={{ duration: 0.7, delay, ease: 'easeOut' }}
              />
            ))}
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
