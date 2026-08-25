import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface Props {
  pattern: 'cache-aside' | 'read-through' | 'write-through'
  animate?: boolean
}

export default function CacheFlowDiagram({ pattern, animate = true }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (!animate) return
    const timer = setInterval(() => setStep(s => (s + 1) % 5), 1500)
    return () => clearInterval(timer)
  }, [animate])

  const boxes = [
    { id: 'app', label: 'Application', x: 50, y: 120, color: '#3b82f6' },
    { id: 'cache', label: 'Redis Cache', x: 250, y: 40, color: '#DC382D' },
    { id: 'db', label: 'Database', x: 250, y: 200, color: '#00e68a' },
  ]

  const getFlows = () => {
    if (pattern === 'cache-aside') {
      return [
        { from: 'app', to: 'cache', label: '1. Check', active: step === 0, t: 0.25, dy: -10 },
        { from: 'cache', to: 'app', label: '2. Miss', active: step === 1, dashed: true, t: 0.25, dy: -10 },
        { from: 'app', to: 'db', label: '3. Query', active: step === 2, t: 0.25, dy: 15 },
        { from: 'db', to: 'app', label: '4. Data', active: step === 3, t: 0.25, dy: 15 },
        { from: 'app', to: 'cache', label: '5. Set', active: step === 4, t: 0.6, dy: 12 },
      ]
    }
    if (pattern === 'read-through') {
      return [
        { from: 'app', to: 'cache', label: '1. Read', active: step === 0, t: 0.3, dy: -10 },
        { from: 'cache', to: 'db', label: '2. Load', active: step === 1, t: 0.3, dy: -12 },
        { from: 'db', to: 'cache', label: '3. Return', active: step === 2, t: 0.3, dy: 15 },
        { from: 'cache', to: 'app', label: '4. Data', active: step === 3, t: 0.3, dy: 12 },
      ]
    }
    // write-through
    return [
      { from: 'app', to: 'cache', label: '1. Write', active: step === 0, t: 0.3, dy: -10 },
      { from: 'cache', to: 'db', label: '2. Sync', active: step === 1, t: 0.3, dy: -12 },
      { from: 'db', to: 'cache', label: '3. ACK', active: step === 2, t: 0.3, dy: 15 },
      { from: 'cache', to: 'app', label: '4. OK', active: step === 3, t: 0.3, dy: 12 },
    ]
  }

  const getCoords = (id: string) => boxes.find(b => b.id === id)!

  return (
    <svg viewBox="0 0 420 280" className="w-full max-w-md">
      {/* Connection lines */}
      {getFlows().map((flow, i) => {
        const from = getCoords(flow.from)
        const to = getCoords(flow.to)
        const fromX = from.x + 60
        const fromY = from.y + 20
        const toX = to.x + 60
        const toY = to.y + 20
        const t = flow.t ?? 0.3
        const mx = fromX + (toX - fromX) * t
        const my = fromY + (toY - fromY) * t + (flow.dy ?? 0)
        return (
          <g key={i}>
            <motion.line
              x1={from.x + 60}
              y1={from.y + 20}
              x2={to.x + 60}
              y2={to.y + 20}
              stroke={flow.active ? '#00d4ff' : 'rgba(100,200,255,0.12)'}
              strokeWidth={flow.active ? 2.5 : 1}
              strokeDasharray={flow.dashed ? '4 4' : undefined}
              animate={{ opacity: flow.active ? 1 : 0.4 }}
            />
            {flow.active && (
              <motion.circle
                cx={from.x + 60}
                cy={from.y + 20}
                r={4}
                fill="#00d4ff"
                animate={{
                  cx: to.x + 60,
                  cy: to.y + 20,
                }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            )}
            <text x={mx} y={my} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">
              {flow.label}
            </text>
          </g>
        )
      })}

      {/* Boxes */}
      {boxes.map(box => (
        <g key={box.id}>
          <rect
            x={box.x}
            y={box.y}
            width={120}
            height={40}
            rx={8}
            fill={box.color + '20'}
            stroke={box.color}
            strokeWidth={1.5}
          />
          <text x={box.x + 60} y={box.y + 24} fill="white" fontSize="12" fontWeight="600" textAnchor="middle">
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
