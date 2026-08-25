import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type FlowMode = 'cache-aside' | 'read-through' | 'write-through' | 'lock-acquire' | 'circuit-breaker'

interface Props {
  mode: FlowMode
  animate?: boolean
  isHit?: boolean
}

const boxes = [
  { id: 'customer', label: 'Musteri', x: 20, y: 110, w: 120, h: 44, color: '#3b82f6' },
  { id: 'app', label: 'TechMart API', x: 190, y: 110, w: 130, h: 44, color: '#06b6d4' },
  { id: 'redis', label: 'Redis', x: 370, y: 30, w: 120, h: 44, color: '#DC382D' },
  { id: 'db', label: 'PostgreSQL', x: 370, y: 190, w: 120, h: 44, color: '#22c55e' },
]

function getFlows(mode: FlowMode, isHit: boolean) {
  if (mode === 'cache-aside') {
    if (isHit) {
      return [
        { from: 'customer', to: 'app', label: '1. GET /product', step: 0, labelT: 0.5, labelDy: -14 },
        { from: 'app', to: 'redis', label: '2. GET key', step: 1, labelT: 0.35, labelDy: -14 },
        { from: 'redis', to: 'app', label: '3. HIT!', step: 2, color: '#22c55e', labelT: 0.65, labelDy: 14 },
        { from: 'app', to: 'customer', label: '4. Response', step: 3, color: '#22c55e', labelT: 0.5, labelDy: 14 },
      ]
    }
    return [
      { from: 'customer', to: 'app', label: '1. GET /product', step: 0, labelT: 0.5, labelDy: -14 },
      { from: 'app', to: 'redis', label: '2. GET key', step: 1, labelT: 0.3, labelDy: -14 },
      { from: 'redis', to: 'app', label: '3. MISS', step: 2, color: '#f59e0b', labelT: 0.5, labelDy: 14 },
      { from: 'app', to: 'db', label: '4. SELECT', step: 3, labelT: 0.35, labelDy: -14 },
      { from: 'db', to: 'app', label: '5. Data', step: 4, labelT: 0.65, labelDy: 14 },
      { from: 'app', to: 'redis', label: '6. SET key', step: 5, color: '#06b6d4', labelT: 0.7, labelDy: -14 },
    ]
  }
  if (mode === 'read-through') {
    return [
      { from: 'customer', to: 'app', label: '1. GET /product', step: 0, labelT: 0.5, labelDy: -14 },
      { from: 'app', to: 'redis', label: '2. READ', step: 1, labelT: 0.35, labelDy: -14 },
      { from: 'redis', to: 'db', label: '3. LOAD', step: 2, color: '#f59e0b', labelT: 0.35, labelDy: -14 },
      { from: 'db', to: 'redis', label: '4. Data', step: 3, labelT: 0.65, labelDy: 14 },
      { from: 'redis', to: 'app', label: '5. Cached Data', step: 4, color: '#22c55e', labelT: 0.65, labelDy: 14 },
    ]
  }
  if (mode === 'write-through') {
    return [
      { from: 'customer', to: 'app', label: '1. PUT /product', step: 0, labelT: 0.5, labelDy: -14 },
      { from: 'app', to: 'redis', label: '2. SET key', step: 1, labelT: 0.35, labelDy: -14 },
      { from: 'redis', to: 'db', label: '3. INSERT/UPDATE', step: 2, labelT: 0.35, labelDy: -14 },
      { from: 'db', to: 'redis', label: '4. ACK', step: 3, color: '#22c55e', labelT: 0.65, labelDy: 14 },
      { from: 'redis', to: 'app', label: '5. OK', step: 4, color: '#22c55e', labelT: 0.65, labelDy: 14 },
    ]
  }
  if (mode === 'lock-acquire') {
    return [
      { from: 'customer', to: 'app', label: '1. POST /order', step: 0, labelT: 0.5, labelDy: -14 },
      { from: 'app', to: 'redis', label: '2. SET NX PX', step: 1, color: '#a855f7', labelT: 0.3, labelDy: -14 },
      { from: 'redis', to: 'app', label: '3. OK (locked)', step: 2, color: '#a855f7', labelT: 0.5, labelDy: 14 },
      { from: 'app', to: 'db', label: '4. UPDATE stock', step: 3, labelT: 0.5, labelDy: -14 },
      { from: 'app', to: 'redis', label: '5. DEL key', step: 4, labelT: 0.7, labelDy: -14 },
    ]
  }
  // circuit-breaker
  return [
    { from: 'customer', to: 'app', label: '1. GET /product', step: 0, labelT: 0.5, labelDy: -14 },
    { from: 'app', to: 'redis', label: '2. GET key', step: 1, color: '#ef4444', labelT: 0.35, labelDy: -14 },
    { from: 'redis', to: 'app', label: '3. ERROR!', step: 2, color: '#ef4444', labelT: 0.65, labelDy: 14 },
    { from: 'app', to: 'db', label: '4. Fallback DB', step: 3, color: '#f59e0b', labelT: 0.35, labelDy: -14 },
    { from: 'db', to: 'app', label: '5. Data', step: 4, labelT: 0.65, labelDy: 14 },
  ]
}

export default function EcommerceFlowDiagram({ mode, animate = true, isHit = false }: Props) {
  const [step, setStep] = useState(0)
  const flows = getFlows(mode, isHit)

  useEffect(() => {
    if (!animate) return
    setStep(0)
    const timer = setInterval(() => setStep(s => (s + 1) % (flows.length + 1)), 1200)
    return () => clearInterval(timer)
  }, [animate, mode, isHit, flows.length])

  const getCenter = (id: string) => {
    const box = boxes.find(b => b.id === id)!
    return { x: box.x + box.w / 2, y: box.y + box.h / 2 }
  }

  return (
    <svg viewBox="0 0 520 270" className="w-full max-w-lg mx-auto">
      <defs>
        <filter id="glow-flow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Flow lines and particles */}
      {flows.map((flow, i) => {
        const from = getCenter(flow.from)
        const to = getCenter(flow.to)
        const isActive = step === flow.step
        const flowColor = flow.color || '#00d4ff'

        const t = flow.labelT ?? 0.5
        const midX = from.x + (to.x - from.x) * t
        const midY = from.y + (to.y - from.y) * t + (flow.labelDy ?? 0)

        return (
          <g key={i}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isActive ? flowColor + '80' : 'rgba(100,200,255,0.08)'}
              strokeWidth={isActive ? 2 : 0.8}
            />
            {isActive && (
              <motion.circle
                cx={from.x} cy={from.y} r={4}
                fill={flowColor}
                filter="url(#glow-flow)"
                animate={{ cx: to.x, cy: to.y }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
            {/* Label with background for readability */}
            <rect
              x={midX - 42} y={midY - 9}
              width={84} height={14}
              rx={3}
              fill="rgba(0,0,0,0.5)"
              opacity={isActive ? 0.8 : 0.3}
            />
            <text x={midX} y={midY + 2} fill={isActive ? 'white' : 'rgba(255,255,255,0.4)'} fontSize="8" textAnchor="middle" fontWeight={isActive ? '600' : '400'}>
              {flow.label}
            </text>
          </g>
        )
      })}

      {/* Boxes */}
      {boxes.map((box) => (
        <g key={box.id}>
          <rect
            x={box.x} y={box.y}
            width={box.w} height={box.h}
            rx={8}
            fill={box.color + '18'}
            stroke={box.color + '50'}
            strokeWidth={1.2}
          />
          <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 4} fill="white" fontSize="11" fontWeight="600" textAnchor="middle">
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
