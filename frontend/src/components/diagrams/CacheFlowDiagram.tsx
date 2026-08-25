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
    { id: 'app', label: 'Application', x: 40, y: 120, w: 130, h: 44, color: '#3b82f6' },
    { id: 'cache', label: 'Redis Cache', x: 270, y: 40, w: 130, h: 44, color: '#DC382D' },
    { id: 'db', label: 'Database', x: 270, y: 200, w: 130, h: 44, color: '#00e68a' },
  ]

  const getFlows = () => {
    if (pattern === 'cache-aside') {
      return [
        { from: 'app', to: 'cache', label: '1. Check', active: step === 0, t: 0.3, dy: -14 },
        { from: 'cache', to: 'app', label: '2. Miss', active: step === 1, dashed: true, t: 0.3, dy: 10 },
        { from: 'app', to: 'db', label: '3. Query', active: step === 2, t: 0.3, dy: -14 },
        { from: 'db', to: 'app', label: '4. Data', active: step === 3, t: 0.3, dy: 10 },
        { from: 'app', to: 'cache', label: '5. Set', active: step === 4, t: 0.65, dy: 10 },
      ]
    }
    if (pattern === 'read-through') {
      return [
        { from: 'app', to: 'cache', label: '1. Read', active: step === 0, t: 0.35, dy: -14 },
        { from: 'cache', to: 'db', label: '2. Load', active: step === 1, t: 0.35, dy: -14 },
        { from: 'db', to: 'cache', label: '3. Return', active: step === 2, t: 0.35, dy: 14 },
        { from: 'cache', to: 'app', label: '4. Data', active: step === 3, t: 0.35, dy: 14 },
      ]
    }
    // write-through
    return [
      { from: 'app', to: 'cache', label: '1. Write', active: step === 0, t: 0.35, dy: -14 },
      { from: 'cache', to: 'db', label: '2. Sync', active: step === 1, t: 0.35, dy: -14 },
      { from: 'db', to: 'cache', label: '3. ACK', active: step === 2, t: 0.35, dy: 14 },
      { from: 'cache', to: 'app', label: '4. OK', active: step === 3, t: 0.35, dy: 14 },
    ]
  }

  return (
    <svg viewBox="0 0 450 290" className="w-full max-w-md">
      {/* Connection lines */}
      {getFlows().map((flow, i) => {
        const from = boxes.find(b => b.id === flow.from)!
        const to = boxes.find(b => b.id === flow.to)!
        const fromX = from.x + from.w / 2
        const fromY = from.y + from.h / 2
        const toX = to.x + to.w / 2
        const toY = to.y + to.h / 2
        const t = flow.t ?? 0.3
        const mx = fromX + (toX - fromX) * t
        const my = fromY + (toY - fromY) * t + (flow.dy ?? 0)
        return (
          <g key={i}>
            <motion.line
              x1={fromX} y1={fromY}
              x2={toX} y2={toY}
              stroke={flow.active ? '#00d4ff' : 'rgba(100,200,255,0.12)'}
              strokeWidth={flow.active ? 2.5 : 1}
              strokeDasharray={flow.dashed ? '4 4' : undefined}
              animate={{ opacity: flow.active ? 1 : 0.4 }}
            />
            {flow.active && (
              <motion.circle
                cx={fromX} cy={fromY}
                r={4}
                fill="#00d4ff"
                animate={{ cx: toX, cy: toY }}
                transition={{ duration: 1, ease: 'easeInOut' }}
              />
            )}
            {/* Label with background */}
            <rect
              x={mx - 30} y={my - 8}
              width={60} height={14}
              rx={3}
              fill="rgba(0,0,0,0.5)"
              opacity={flow.active ? 0.7 : 0.3}
            />
            <text x={mx} y={my + 3} fill={flow.active ? 'white' : 'rgba(255,255,255,0.5)'} fontSize="9" textAnchor="middle">
              {flow.label}
            </text>
          </g>
        )
      })}

      {/* Boxes */}
      {boxes.map(box => (
        <g key={box.id}>
          <rect
            x={box.x} y={box.y}
            width={box.w} height={box.h}
            rx={8}
            fill={box.color + '20'}
            stroke={box.color}
            strokeWidth={1.5}
          />
          <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 5} fill="white" fontSize="12" fontWeight="600" textAnchor="middle">
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
