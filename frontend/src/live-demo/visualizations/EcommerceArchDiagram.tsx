import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DemoSection } from '../context/LiveDemoContext'

interface Props {
  onNodeClick?: (section: DemoSection) => void
}

const nodes = [
  { id: 'browser', label: 'Browser / Mobile', x: 400, y: 30, w: 140, h: 40, color: '#3b82f6', section: null },
  { id: 'lb', label: 'Load Balancer', x: 400, y: 110, w: 130, h: 36, color: '#8b5cf6', section: null },
  { id: 'api1', label: 'API Pod 1', x: 230, y: 190, w: 100, h: 34, color: '#06b6d4', section: null },
  { id: 'api2', label: 'API Pod 2', x: 400, y: 190, w: 100, h: 34, color: '#06b6d4', section: null },
  { id: 'api3', label: 'API Pod 3', x: 570, y: 190, w: 100, h: 34, color: '#06b6d4', section: null },
  { id: 'redis-cache', label: 'Redis Cache', x: 200, y: 300, w: 120, h: 40, color: '#DC382D', section: 'cache-patterns' as DemoSection },
  { id: 'redis-lock', label: 'Redis Lock', x: 400, y: 300, w: 120, h: 40, color: '#DC382D', section: 'distributed-lock' as DemoSection },
  { id: 'redis-session', label: 'Redis Session', x: 600, y: 300, w: 120, h: 40, color: '#DC382D', section: null },
  { id: 'db', label: 'PostgreSQL', x: 300, y: 410, w: 120, h: 40, color: '#22c55e', section: null },
  { id: 'prometheus', label: 'Prometheus', x: 550, y: 410, w: 120, h: 40, color: '#eab308', section: 'monitoring' as DemoSection },
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

export default function EcommerceArchDiagram({ onNodeClick }: Props) {
  const [activeParticle, setActiveParticle] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setActiveParticle(p => (p + 1) % connections.length), 800)
    return () => clearInterval(timer)
  }, [])

  const getNodeCenter = (id: string) => {
    const node = nodes.find(n => n.id === id)!
    return { x: node.x, y: node.y + node.h / 2 }
  }

  return (
    <svg viewBox="0 0 800 480" className="w-full max-w-3xl mx-auto">
      <defs>
        <filter id="glow-arch">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connections */}
      {connections.map((conn, i) => {
        const from = getNodeCenter(conn.from)
        const to = getNodeCenter(conn.to)
        const isActive = activeParticle === i
        return (
          <g key={`${conn.from}-${conn.to}`}>
            <line
              x1={from.x} y1={from.y}
              x2={to.x} y2={to.y}
              stroke={isActive ? 'rgba(0,212,255,0.4)' : 'rgba(100,200,255,0.08)'}
              strokeWidth={isActive ? 1.5 : 0.5}
            />
            {isActive && (
              <motion.circle
                cx={from.x} cy={from.y} r={3}
                fill="#00d4ff"
                filter="url(#glow-arch)"
                animate={{ cx: to.x, cy: to.y }}
                transition={{ duration: 0.7, ease: 'easeInOut' }}
              />
            )}
          </g>
        )
      })}

      {/* Nodes */}
      {nodes.map((node, i) => (
        <motion.g
          key={node.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => node.section && onNodeClick?.(node.section)}
          style={{ cursor: node.section ? 'pointer' : 'default' }}
        >
          <rect
            x={node.x - node.w / 2}
            y={node.y}
            width={node.w}
            height={node.h}
            rx={8}
            fill={node.color + '15'}
            stroke={node.color + '60'}
            strokeWidth={1.2}
          />
          {/* Health dot */}
          <circle cx={node.x + node.w / 2 - 10} cy={node.y + 8} r={3} fill="#22c55e" />
          <text
            x={node.x}
            y={node.y + node.h / 2 + 4}
            fill="white"
            fontSize="11"
            fontWeight="600"
            textAnchor="middle"
          >
            {node.label}
          </text>
        </motion.g>
      ))}
    </svg>
  )
}
