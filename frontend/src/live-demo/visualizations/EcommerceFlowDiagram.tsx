import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

type FlowMode = 'cache-aside' | 'read-through' | 'write-through' | 'lock-acquire' | 'circuit-breaker'

interface Props {
  mode: FlowMode
  animate?: boolean
  isHit?: boolean
}

const boxes = [
  { id: 'customer', label: 'Musteri', x: 30, y: 100, color: '#3b82f6', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0' },
  { id: 'app', label: 'TechMart API', x: 170, y: 100, color: '#06b6d4', icon: 'M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z' },
  { id: 'redis', label: 'Redis', x: 310, y: 30, color: '#DC382D', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375' },
  { id: 'db', label: 'PostgreSQL', x: 310, y: 170, color: '#22c55e', icon: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375' },
]

function getFlows(mode: FlowMode, isHit: boolean) {
  if (mode === 'cache-aside') {
    if (isHit) {
      return [
        { from: 'customer', to: 'app', label: '1. GET /product', step: 0 },
        { from: 'app', to: 'redis', label: '2. GET key', step: 1 },
        { from: 'redis', to: 'app', label: '3. HIT!', step: 2, color: '#22c55e' },
        { from: 'app', to: 'customer', label: '4. Response', step: 3, color: '#22c55e' },
      ]
    }
    return [
      { from: 'customer', to: 'app', label: '1. GET /product', step: 0 },
      { from: 'app', to: 'redis', label: '2. GET key', step: 1 },
      { from: 'redis', to: 'app', label: '3. MISS', step: 2, color: '#f59e0b' },
      { from: 'app', to: 'db', label: '4. SELECT', step: 3 },
      { from: 'db', to: 'app', label: '5. Data', step: 4 },
      { from: 'app', to: 'redis', label: '6. SET key', step: 5, color: '#06b6d4' },
    ]
  }
  if (mode === 'read-through') {
    return [
      { from: 'customer', to: 'app', label: '1. GET /product', step: 0 },
      { from: 'app', to: 'redis', label: '2. READ', step: 1 },
      { from: 'redis', to: 'db', label: '3. LOAD', step: 2, color: '#f59e0b' },
      { from: 'db', to: 'redis', label: '4. Data', step: 3 },
      { from: 'redis', to: 'app', label: '5. Cached Data', step: 4, color: '#22c55e' },
    ]
  }
  if (mode === 'write-through') {
    return [
      { from: 'customer', to: 'app', label: '1. PUT /product', step: 0 },
      { from: 'app', to: 'redis', label: '2. SET key', step: 1 },
      { from: 'redis', to: 'db', label: '3. INSERT/UPDATE', step: 2 },
      { from: 'db', to: 'redis', label: '4. ACK', step: 3, color: '#22c55e' },
      { from: 'redis', to: 'app', label: '5. OK', step: 4, color: '#22c55e' },
    ]
  }
  if (mode === 'lock-acquire') {
    return [
      { from: 'customer', to: 'app', label: '1. POST /order', step: 0 },
      { from: 'app', to: 'redis', label: '2. SET NX PX', step: 1, color: '#a855f7' },
      { from: 'redis', to: 'app', label: '3. OK (locked)', step: 2, color: '#a855f7' },
      { from: 'app', to: 'db', label: '4. UPDATE stock', step: 3 },
      { from: 'app', to: 'redis', label: '5. DEL key', step: 4 },
    ]
  }
  // circuit-breaker
  return [
    { from: 'customer', to: 'app', label: '1. GET /product', step: 0 },
    { from: 'app', to: 'redis', label: '2. GET key', step: 1, color: '#ef4444' },
    { from: 'redis', to: 'app', label: '3. ERROR!', step: 2, color: '#ef4444' },
    { from: 'app', to: 'db', label: '4. Fallback DB', step: 3, color: '#f59e0b' },
    { from: 'db', to: 'app', label: '5. Data', step: 4 },
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
    return { x: box.x + 55, y: box.y + 20 }
  }

  return (
    <svg viewBox="0 0 460 240" className="w-full max-w-lg mx-auto">
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
        const midX = (from.x + to.x) / 2
        const midY = (from.y + to.y) / 2 - 8

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
            <text x={midX} y={midY} fill={isActive ? 'white' : 'rgba(255,255,255,0.3)'} fontSize="9" textAnchor="middle" fontWeight={isActive ? '600' : '400'}>
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
            width={110} height={40}
            rx={8}
            fill={box.color + '18'}
            stroke={box.color + '50'}
            strokeWidth={1.2}
          />
          <text x={box.x + 55} y={box.y + 25} fill="white" fontSize="11" fontWeight="600" textAnchor="middle">
            {box.label}
          </text>
        </g>
      ))}
    </svg>
  )
}
