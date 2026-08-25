import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DemoSection } from '../context/LiveDemoContext'

interface Props {
  onNodeClick?: (section: DemoSection) => void
}

const nodes = [
  { id: 'browser', label: 'Browser / Mobile', x: 400, y: 34, w: 160, h: 44, color: '#00d4ff', section: null as DemoSection | null },
  { id: 'lb', label: 'Load Balancer', x: 400, y: 114, w: 150, h: 40, color: '#c084fc', section: null as DemoSection | null },
  { id: 'api1', label: 'API Pod 1', x: 220, y: 204, w: 110, h: 38, color: '#22d3ee', section: null as DemoSection | null },
  { id: 'api2', label: 'API Pod 2', x: 400, y: 204, w: 110, h: 38, color: '#22d3ee', section: null as DemoSection | null },
  { id: 'api3', label: 'API Pod 3', x: 580, y: 204, w: 110, h: 38, color: '#22d3ee', section: null as DemoSection | null },
  { id: 'redis-cache', label: 'Redis Cache', x: 190, y: 314, w: 130, h: 44, color: '#f87171', section: 'cache-patterns' as DemoSection | null },
  { id: 'redis-lock', label: 'Redis Lock', x: 400, y: 314, w: 130, h: 44, color: '#f87171', section: 'distributed-lock' as DemoSection | null },
  { id: 'redis-session', label: 'Redis Session', x: 610, y: 314, w: 130, h: 44, color: '#f87171', section: null as DemoSection | null },
  { id: 'db', label: 'PostgreSQL', x: 300, y: 424, w: 130, h: 44, color: '#4ade80', section: null as DemoSection | null },
  { id: 'prometheus', label: 'Prometheus', x: 550, y: 424, w: 130, h: 44, color: '#fbbf24', section: 'monitoring' as DemoSection | null },
]

const connections = [
  { from: 'browser', to: 'lb' },
  { from: 'lb', to: 'api1' },
  { from: 'lb', to: 'api2' },
  { from: 'lb', to: 'api3' },
  { from: 'api1', to: 'redis-cache' },
  { from: 'api2', to: 'redis-lock' },
  { from: 'api3', to: 'redis-session' },
  { from: 'redis-cache', to: 'db' },
  { from: 'api2', to: 'db' },
  { from: 'api2', to: 'prometheus' },
]

const getNode = (id: string) => nodes.find(n => n.id === id)!
const getCenter = (id: string) => {
  const n = getNode(id)
  return { x: n.x, y: n.y + n.h / 2 }
}

export default function EcommerceArchDiagram({ onNodeClick }: Props) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 550)
    return () => clearInterval(timer)
  }, [])

  // 3 concurrent particles flowing through architecture
  const activeSet = new Set([
    tick % connections.length,
    (tick + 4) % connections.length,
    (tick + 7) % connections.length,
  ])

  return (
    <svg viewBox="0 0 820 500" className="w-full max-w-3xl mx-auto">
      <defs>
        <filter id="neon" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="b1" />
          <feGaussianBlur stdDeviation="2" result="b2" />
          <feMerge>
            <feMergeNode in="b1" />
            <feMergeNode in="b2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="0.4" fill="rgba(255,255,255,0.03)" />
        </pattern>
        {/* Gradient for each connection: source color → target color */}
        {connections.map((c, i) => {
          const f = getCenter(c.from)
          const t = getCenter(c.to)
          return (
            <linearGradient key={i} id={`cg${i}`}
              x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={getNode(c.from).color} />
              <stop offset="100%" stopColor={getNode(c.to).color} />
            </linearGradient>
          )
        })}
      </defs>

      {/* Background */}
      <rect width="820" height="500" fill="url(#dots)" />

      {/* Tier separator lines */}
      {[90, 170, 280, 400].map(y => (
        <line key={y} x1="60" y1={y} x2="760" y2={y}
          stroke="rgba(255,255,255,0.025)" strokeWidth="0.5" strokeDasharray="6 8" />
      ))}

      {/* Connections — flowing neon dot streams */}
      {connections.map((c, i) => {
        const f = getCenter(c.from)
        const t = getCenter(c.to)
        const on = activeSet.has(i)
        const gradUrl = `url(#cg${i})`
        return (
          <g key={`${c.from}-${c.to}`}>
            {/* Outer glow layer */}
            <line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={gradUrl} strokeWidth={on ? 8 : 3}
              opacity={on ? 0.2 : 0.04} filter="url(#glow)" />
            {/* Flowing dot stream */}
            <motion.line x1={f.x} y1={f.y} x2={t.x} y2={t.y}
              stroke={gradUrl} strokeWidth={on ? 2 : 0.8}
              opacity={on ? 0.85 : 0.2}
              strokeDasharray={on ? '3 6' : '1.5 7.5'}
              strokeLinecap="round"
              animate={{ strokeDashoffset: [0, -18] }}
              transition={{ duration: on ? 0.5 : 2, repeat: Infinity, ease: 'linear' }}
            />
            {/* Multiple flowing particles when active */}
            {on && [0, 0.15, 0.3].map((delay, pi) => (
              <motion.circle key={pi}
                cx={f.x} cy={f.y} r={5 - pi * 1.5}
                fill="white" filter="url(#neon)"
                animate={{ cx: t.x, cy: t.y, opacity: [0.9 - pi * 0.25, 0] }}
                transition={{ duration: 0.8, delay, ease: 'easeOut' }}
              />
            ))}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <motion.g key={n.id}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => n.section && onNodeClick?.(n.section)}
          style={{ cursor: n.section ? 'pointer' : 'default' }}
        >
          {/* Pulsing halo for interactive nodes */}
          {n.section && (
            <motion.rect
              x={n.x - n.w / 2 - 5} y={n.y - 5}
              width={n.w + 10} height={n.h + 10}
              rx={12} fill="none" stroke={n.color} strokeWidth={1}
              filter="url(#glow)"
              animate={{ opacity: [0.06, 0.22, 0.06] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.3 }}
            />
          )}
          {/* Main box */}
          <rect x={n.x - n.w / 2} y={n.y} width={n.w} height={n.h}
            rx={8} fill={n.color + '10'} stroke={n.color} strokeWidth={1.3} opacity={0.9} />
          {/* Neon top edge highlight */}
          <line x1={n.x - n.w / 2 + 8} y1={n.y} x2={n.x + n.w / 2 - 8} y2={n.y}
            stroke={n.color} strokeWidth={2} opacity={0.5} strokeLinecap="round" filter="url(#glow)" />
          {/* Health dot with pulse */}
          <motion.circle cx={n.x + n.w / 2 - 14} cy={n.y + 10} r={3}
            fill="#00ff88" filter="url(#glow)"
            animate={{ opacity: [0.4, 1, 0.4], r: [2.5, 3.5, 2.5] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.12 }}
          />
          {/* Label */}
          <text x={n.x} y={n.y + n.h / 2 + 5}
            fill="white" fontSize="11" fontWeight="600" textAnchor="middle">
            {n.label}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}
