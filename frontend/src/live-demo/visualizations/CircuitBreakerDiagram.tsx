import { motion } from 'framer-motion'

interface Props {
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN'
}

const states = [
  { id: 'CLOSED', label: 'CLOSED', desc: 'Normal calisma', color: '#22c55e', x: 80, y: 100 },
  { id: 'OPEN', label: 'OPEN', desc: 'Istekler reddedilir', color: '#ef4444', x: 280, y: 100 },
  { id: 'HALF_OPEN', label: 'HALF_OPEN', desc: 'Test istegi gonderilir', color: '#f59e0b', x: 180, y: 30 },
]

const transitions = [
  { from: 'CLOSED', to: 'OPEN', label: 'Hatalar esigi asildi', path: 'M 120 85 Q 180 50 240 85' },
  { from: 'OPEN', to: 'HALF_OPEN', label: 'Timeout doldu', path: 'M 270 85 Q 260 40 220 38' },
  { from: 'HALF_OPEN', to: 'CLOSED', label: 'Test basarili', path: 'M 140 38 Q 100 40 90 85' },
  { from: 'HALF_OPEN', to: 'OPEN', label: 'Test basarisiz', path: 'M 220 45 Q 260 55 270 85' },
]

export default function CircuitBreakerDiagram({ state }: Props) {
  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Circuit Breaker State Machine</h4>
      <svg viewBox="0 0 360 160" className="w-full max-w-md mx-auto">
        <defs>
          <marker id="arrow-cb" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(255,255,255,0.3)" />
          </marker>
        </defs>

        {/* Transition arrows */}
        {transitions.map((t, i) => (
          <g key={i}>
            <path
              d={t.path}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1"
              markerEnd="url(#arrow-cb)"
            />
            <text fontSize="7" fill="rgba(255,255,255,0.25)" textAnchor="middle">
              <textPath href={`#path-${i}`} startOffset="50%">{t.label}</textPath>
            </text>
            <path id={`path-${i}`} d={t.path} fill="none" stroke="none" />
          </g>
        ))}

        {/* State circles */}
        {states.map((s) => {
          const isActive = state === s.id
          return (
            <g key={s.id}>
              {isActive && (
                <motion.circle
                  cx={s.x} cy={s.y} r={32}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="1"
                  opacity={0.3}
                  animate={{ r: [32, 38, 32], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              <circle
                cx={s.x} cy={s.y} r={28}
                fill={isActive ? s.color + '25' : 'rgba(255,255,255,0.03)'}
                stroke={isActive ? s.color : 'rgba(255,255,255,0.1)'}
                strokeWidth={isActive ? 2 : 1}
              />
              <text x={s.x} y={s.y - 2} fill={isActive ? 'white' : 'rgba(255,255,255,0.4)'} fontSize="9" fontWeight="700" textAnchor="middle">
                {s.label}
              </text>
              <text x={s.x} y={s.y + 10} fill={isActive ? s.color : 'rgba(255,255,255,0.2)'} fontSize="6.5" textAnchor="middle">
                {s.desc}
              </text>
              {isActive && (
                <motion.circle
                  cx={s.x + 20} cy={s.y - 20} r={3}
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
