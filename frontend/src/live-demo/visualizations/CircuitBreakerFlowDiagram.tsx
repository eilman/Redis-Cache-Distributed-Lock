import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const entities = [
  { id: 'client', label: 'Müşteri', x: 65, color: '#00d4ff' },
  { id: 'api', label: 'API Server', x: 195, color: '#22d3ee' },
  { id: 'redis', label: 'Redis', x: 330, color: '#f87171' },
  { id: 'db', label: 'PostgreSQL', x: 460, color: '#4ade80' },
]

const arrows = [
  { from: 'client', to: 'api', label: '1. GET /product', y: 76, color: '#00d4ff' },
  { from: 'api', to: 'redis', label: '2. GET cache:key', y: 114, color: '#f87171' },
  { from: 'redis', to: 'api', label: '3. ERROR!', y: 150, color: '#f87171', dashed: true },
  { from: 'api', to: 'db', label: '4. Fallback query', y: 196, color: '#fbbf24' },
  { from: 'db', to: 'api', label: '5. Data', y: 232, color: '#4ade80' },
  { from: 'api', to: 'client', label: '6. 200 OK', y: 268, color: '#4ade80' },
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
        <filter id="cbf-neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b1" />
          <feGaussianBlur stdDeviation="2" result="b2" />
          <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="cbf-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="cbf-dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.4" fill="rgba(255,255,255,0.03)" />
        </pattern>
        <linearGradient id="cbf-err" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.05" />
          <stop offset="50%" stopColor="#f87171" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#f87171" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="cbf-fb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.04" />
          <stop offset="50%" stopColor="#fbbf24" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      <rect width="530" height="290" fill="url(#cbf-dots)" />

      {/* Entity header boxes */}
      {entities.map(ent => (
        <g key={ent.id}>
          <rect x={ent.x - 50} y={10} width={100} height={32} rx={6}
            fill={ent.color + '10'} stroke={ent.color} strokeWidth={1.2} opacity={0.9} />
          <line x1={ent.x - 42} y1={10} x2={ent.x + 42} y2={10}
            stroke={ent.color} strokeWidth={2} opacity={0.5} strokeLinecap="round" filter="url(#cbf-glow)" />
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

      {/* Redis error zone */}
      <rect x={getX('redis') - 22} y={105} width={44} height={55} rx={4} fill="url(#cbf-err)" />
      <motion.rect x={getX('redis') - 22} y={105} width={44} height={55} rx={4}
        fill="none" stroke="#f87171" strokeWidth={0.8}
        strokeDasharray="4 4"
        animate={{ strokeDashoffset: [0, -16] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        opacity={0.25}
      />
      <text x={getX('redis')} y={160} fill="#f87171" fontSize="6" fontWeight="700"
        textAnchor="middle" opacity={0.6} letterSpacing="1">
        DOWN
      </text>

      {/* Fallback zone */}
      <rect x={getX('api') - 22} y={186} width={44} height={56} rx={4} fill="url(#cbf-fb)" />
      <motion.rect x={getX('api') - 22} y={186} width={44} height={56} rx={4}
        fill="none" stroke="#fbbf24" strokeWidth={0.8}
        strokeDasharray="4 4"
        animate={{ strokeDashoffset: [0, -16] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        opacity={0.2}
      />
      <text x={getX('api')} y={218} fill="#fbbf24" fontSize="5.5" fontWeight="700"
        textAnchor="middle" opacity={0.5} letterSpacing="1">
        FALLBACK
      </text>

      {/* Arrows — flowing dot streams */}
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
            {isActive && (
              <line x1={fromX} y1={a.y} x2={toX} y2={a.y}
                stroke={a.color} strokeWidth={8} opacity={0.12} filter="url(#cbf-glow)" />
            )}
            <motion.line x1={fromX} y1={a.y} x2={toX} y2={a.y}
              stroke={lineColor}
              strokeWidth={isActive ? 2 : isPast ? 1 : 0.5}
              strokeDasharray={isActive ? '3 6' : isPast ? '1.5 7.5' : '1 10'}
              strokeLinecap="round"
              animate={(isActive || isPast) ? { strokeDashoffset: [0, -18] } : {}}
              transition={{ duration: isActive ? 0.5 : 2, repeat: Infinity, ease: 'linear' }}
            />
            <polygon points={`${tipX},${a.y - 3.5} ${toX},${a.y} ${tipX},${a.y + 3.5}`}
              fill={lineColor} filter={isActive ? 'url(#cbf-glow)' : undefined} />
            {isActive && [0, 0.15, 0.3].map((delay, pi) => (
              <motion.circle key={pi}
                cx={fromX} cy={a.y} r={4 - pi * 1.2}
                fill="white" filter="url(#cbf-neon)"
                animate={{ cx: toX, opacity: [1 - pi * 0.3, 0] }}
                transition={{ duration: 0.7, delay, ease: 'easeOut' }}
              />
            ))}
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
