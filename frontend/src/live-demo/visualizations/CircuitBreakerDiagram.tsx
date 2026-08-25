import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

const states = [
  { id: 'CLOSED', label: 'CLOSED', desc: 'Normal calisma', color: '#4ade80', x: 100, y: 180 },
  { id: 'OPEN', label: 'OPEN', desc: 'Istekler reddedilir', color: '#f87171', x: 360, y: 180 },
  { id: 'HALF_OPEN', label: 'HALF_OPEN', desc: 'Test istegi gonderilir', color: '#fbbf24', x: 230, y: 55 },
]

const transitions = [
  { from: 'CLOSED', to: 'OPEN', label: 'Hatalar esigi asildi', labelX: 230, labelY: 150 },
  { from: 'OPEN', to: 'HALF_OPEN', label: 'Timeout doldu', labelX: 340, labelY: 95 },
  { from: 'HALF_OPEN', to: 'CLOSED', label: 'Test basarili', labelX: 120, labelY: 95 },
  { from: 'HALF_OPEN', to: 'OPEN', label: 'Test basarisiz', labelX: 340, labelY: 65 },
]

export default function CircuitBreakerDiagram({ state }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 800)
    return () => clearInterval(t)
  }, [])

  const getPos = (id: string) => states.find(s => s.id === id)!

  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Circuit Breaker State Machine</h4>
      <svg viewBox="0 0 460 260" className="w-full max-w-md mx-auto">
        <defs>
          <filter id="cb-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b1" />
            <feGaussianBlur stdDeviation="2" result="b2" />
            <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="cb-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="cb-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.4" fill="rgba(255,255,255,0.03)" />
          </pattern>
          <marker id="arrow-cb" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>

        <rect width="460" height="260" fill="url(#cb-dots)" />

        {/* Transition arrows — flowing dot streams */}
        {transitions.map((t, i) => {
          const from = getPos(t.from)
          const to = getPos(t.to)
          const dx = to.x - from.x
          const dy = to.y - from.y
          const len = Math.sqrt(dx * dx + dy * dy)
          const nx = dx / len
          const ny = dy / len
          const x1 = from.x + nx * 42
          const y1 = from.y + ny * 42
          const x2 = to.x - nx * 42
          const y2 = to.y - ny * 42
          const isFromActive = t.from === state

          return (
            <g key={i}>
              {/* Glow layer */}
              <line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isFromActive ? getPos(t.from).color : 'rgba(255,255,255,0.06)'}
                strokeWidth={isFromActive ? 5 : 3}
                opacity={isFromActive ? 0.12 : 0.03}
                filter="url(#cb-glow)" />
              {/* Flowing dot stream */}
              <motion.line x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={isFromActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isFromActive ? 1.5 : 0.8}
                strokeDasharray={isFromActive ? '3 6' : '1.5 7.5'}
                strokeLinecap="round"
                markerEnd="url(#arrow-cb)"
                animate={{ strokeDashoffset: [0, -18] }}
                transition={{ duration: isFromActive ? 0.6 : 2.5, repeat: Infinity, ease: 'linear' }}
              />
              {/* Flowing particle on active transitions */}
              {isFromActive && (
                <motion.circle
                  cx={x1} cy={y1} r={3.5}
                  fill="white" filter="url(#cb-neon)" opacity={0.85}
                  animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0.85, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut', delay: (tick * 0.1) % 0.5 }}
                />
              )}
              <text x={t.labelX} y={t.labelY}
                fill={isFromActive ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.3)'}
                fontSize="9" textAnchor="middle" fontWeight="500">
                {t.label}
              </text>
            </g>
          )
        })}

        {/* State circles */}
        {states.map((s) => {
          const isActive = state === s.id
          return (
            <g key={s.id}>
              {/* Neon pulse ring */}
              {isActive && (
                <motion.circle cx={s.x} cy={s.y} r={44}
                  fill="none" stroke={s.color} strokeWidth="1.5"
                  filter="url(#cb-glow)"
                  animate={{ r: [44, 52, 44], opacity: [0.4, 0.1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              {/* Outer glow */}
              {isActive && (
                <circle cx={s.x} cy={s.y} r={38}
                  fill="none" stroke={s.color} strokeWidth={2} opacity={0.15}
                  filter="url(#cb-neon)" />
              )}
              {/* Orbiting dot for active state */}
              {isActive && (
                <motion.circle r={2.5} fill={s.color} filter="url(#cb-glow)"
                  animate={{
                    cx: [s.x + 38, s.x, s.x - 38, s.x, s.x + 38],
                    cy: [s.y, s.y - 38, s.y, s.y + 38, s.y],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                />
              )}
              {/* Main circle */}
              <circle cx={s.x} cy={s.y} r={38}
                fill={isActive ? s.color + '18' : 'rgba(255,255,255,0.02)'}
                stroke={isActive ? s.color : 'rgba(255,255,255,0.08)'}
                strokeWidth={isActive ? 1.5 : 0.8}
              />
              {/* Neon top highlight */}
              {isActive && (
                <path d={`M ${s.x - 25} ${s.y - 30} A 38 38 0 0 1 ${s.x + 25} ${s.y - 30}`}
                  fill="none" stroke={s.color} strokeWidth={2} opacity={0.6}
                  strokeLinecap="round" filter="url(#cb-glow)" />
              )}
              <text x={s.x} y={s.y - 2} fill={isActive ? 'white' : 'rgba(255,255,255,0.35)'}
                fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
                {s.label}
              </text>
              <text x={s.x} y={s.y + 48} fill={isActive ? s.color : 'rgba(255,255,255,0.2)'}
                fontSize="8" textAnchor="middle">
                {s.desc}
              </text>
              {/* Status dot */}
              {isActive && (
                <motion.circle cx={s.x + 28} cy={s.y - 28} r={3}
                  fill={s.color} filter="url(#cb-glow)"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
