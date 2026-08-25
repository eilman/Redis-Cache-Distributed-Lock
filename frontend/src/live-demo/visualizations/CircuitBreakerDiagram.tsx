import { motion } from 'framer-motion'

interface Props {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

const states = [
  { id: 'CLOSED', label: 'CLOSED', desc: 'Normal calisma', color: '#22c55e', x: 100, y: 180 },
  { id: 'OPEN', label: 'OPEN', desc: 'Istekler reddedilir', color: '#ef4444', x: 360, y: 180 },
  { id: 'HALF_OPEN', label: 'HALF_OPEN', desc: 'Test istegi gonderilir', color: '#f59e0b', x: 230, y: 55 },
]

const transitions = [
  { from: 'CLOSED', to: 'OPEN', label: 'Hatalar esigi asildi', labelX: 230, labelY: 150 },
  { from: 'OPEN', to: 'HALF_OPEN', label: 'Timeout doldu', labelX: 340, labelY: 95 },
  { from: 'HALF_OPEN', to: 'CLOSED', label: 'Test basarili', labelX: 120, labelY: 95 },
  { from: 'HALF_OPEN', to: 'OPEN', label: 'Test basarisiz', labelX: 340, labelY: 65 },
]

export default function CircuitBreakerDiagram({ state }: Props) {
  const getPos = (id: string) => states.find(s => s.id === id)!

  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Circuit Breaker State Machine</h4>
      <svg viewBox="0 0 460 260" className="w-full max-w-md mx-auto">
        <defs>
          <marker id="arrow-cb" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>

        {/* Transition arrows */}
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

          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth="1"
                markerEnd="url(#arrow-cb)"
              />
              <text
                x={t.labelX} y={t.labelY}
                fill="rgba(255,255,255,0.4)"
                fontSize="9"
                textAnchor="middle"
                fontWeight="500"
              >
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
              {isActive && (
                <motion.circle
                  cx={s.x} cy={s.y} r={44}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1"
                  opacity={0.3}
                  animate={{ r: [44, 50, 44], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <circle
                cx={s.x} cy={s.y} r={38}
                fill={isActive ? s.color + '25' : 'rgba(255,255,255,0.03)'}
                stroke={isActive ? s.color : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={s.x} y={s.y - 2} fill={isActive ? 'white' : 'rgba(255,255,255,0.4)'} fontSize="11" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
                {s.label}
              </text>
              {/* Description below circle */}
              <text x={s.x} y={s.y + 48} fill={isActive ? s.color : 'rgba(255,255,255,0.2)'} fontSize="8" textAnchor="middle">
                {s.desc}
              </text>
              {isActive && (
                <motion.circle
                  cx={s.x + 28} cy={s.y - 28} r={3}
                  fill={s.color}
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
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
