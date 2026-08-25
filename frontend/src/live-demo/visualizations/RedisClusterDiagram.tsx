import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  nodeCount?: number
  lockedNodes: number[]
  quorumReached: boolean | null
  animating?: boolean
}

export default function RedisClusterDiagram({ nodeCount = 5, lockedNodes, quorumReached, animating }: Props) {
  const centerX = 200
  const centerY = 130
  const radius = 95

  const [tick, setTick] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 700)
    return () => clearInterval(t)
  }, [])

  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const angle = (i / nodeCount) * 2 * Math.PI - Math.PI / 2
    return {
      id: i,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
      label: `Redis-${i + 1}`,
      locked: lockedNodes.includes(i),
    }
  })

  const quorum = Math.ceil(nodeCount / 2)

  // Build list of locked-to-locked edges for particle animation
  const lockedEdges: { a: typeof nodes[0]; b: typeof nodes[0]; idx: number }[] = []
  let edgeIdx = 0
  nodes.forEach((a, i) => {
    nodes.slice(i + 1).forEach((b) => {
      if (a.locked && b.locked) {
        lockedEdges.push({ a, b, idx: edgeIdx })
      }
      edgeIdx++
    })
  })

  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Redlock - Multi-Node</h4>
      <svg viewBox="0 0 400 290" className="w-full max-w-sm mx-auto">
        <defs>
          <filter id="rc-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b1" />
            <feGaussianBlur stdDeviation="2" result="b2" />
            <feMerge><feMergeNode in="b1" /><feMergeNode in="b2" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="rc-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <pattern id="rc-dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.4" fill="rgba(255,255,255,0.03)" />
          </pattern>
        </defs>

        <rect width="400" height="290" fill="url(#rc-dots)" />

        {/* Connection lines between all nodes — flowing mesh */}
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => {
            const bothLocked = a.locked && b.locked
            return (
              <g key={`${a.id}-${b.id}`}>
                {bothLocked && (
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="#4ade80" strokeWidth={3} opacity={0.08} filter="url(#rc-glow)" />
                )}
                <motion.line x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                  stroke={bothLocked ? '#4ade80' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={bothLocked ? 1 : 0.5}
                  opacity={bothLocked ? 0.4 : 1}
                  strokeDasharray={bothLocked ? '3 6' : '1 10'}
                  strokeLinecap="round"
                  animate={bothLocked ? { strokeDashoffset: [0, -18] } : {}}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </g>
            )
          })
        )}

        {/* Flowing particles along locked edges */}
        {lockedEdges.length > 0 && lockedEdges.map((edge, i) => {
          const isParticleActive = (tick + i * 2) % (lockedEdges.length + 2) === 0
          if (!isParticleActive) return null
          return (
            <motion.circle key={`p-${edge.a.id}-${edge.b.id}-${tick}`}
              cx={edge.a.x} cy={edge.a.y} r={3}
              fill="white" filter="url(#rc-neon)" opacity={0.8}
              animate={{ cx: edge.b.x, cy: edge.b.y, opacity: [0.8, 0] }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          )
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isLocked = node.locked
          const color = isLocked ? '#4ade80' : '#f87171'
          return (
            <g key={node.id}>
              {/* Neon pulse ring for locked */}
              {isLocked && (
                <motion.circle cx={node.x} cy={node.y} r={30}
                  fill="none" stroke="#4ade80" strokeWidth="1.5"
                  filter="url(#rc-glow)"
                  animate={{ r: [30, 40, 30], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: node.id * 0.2 }}
                />
              )}
              {/* Outer glow */}
              {isLocked && (
                <circle cx={node.x} cy={node.y} r={28}
                  fill="none" stroke={color} strokeWidth={2} opacity={0.12}
                  filter="url(#rc-neon)" />
              )}
              {/* Orbiting dot for locked nodes */}
              {isLocked && (
                <motion.circle r={2} fill="#4ade80" filter="url(#rc-glow)"
                  animate={{
                    cx: [node.x + 28, node.x, node.x - 28, node.x, node.x + 28],
                    cy: [node.y, node.y - 28, node.y, node.y + 28, node.y],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', delay: node.id * 0.3 }}
                />
              )}
              {/* Main circle */}
              <circle cx={node.x} cy={node.y} r={28}
                fill={color + '12'}
                stroke={color}
                strokeWidth={isLocked ? 1.5 : 0.8}
                opacity={0.9}
              />
              {/* Lock icon */}
              {isLocked && (
                <motion.text x={node.x} y={node.y - 1}
                  textAnchor="middle" dominantBaseline="middle" fontSize="14"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: node.id * 0.15 }}>
                  {'🔒'}
                </motion.text>
              )}
              {/* Label below */}
              <text x={node.x} y={node.y + 40} fill="white" fontSize="9" fontWeight="600" textAnchor="middle">
                {node.label}
              </text>
            </g>
          )
        })}

        {/* Center quorum display */}
        <circle cx={centerX} cy={centerY} r={28}
          fill={quorumReached === true ? '#4ade8012' : quorumReached === false ? '#f8717112' : 'rgba(255,255,255,0.02)'}
          stroke={quorumReached === true ? '#4ade80' : quorumReached === false ? '#f87171' : 'rgba(255,255,255,0.08)'}
          strokeWidth="1.2" opacity={0.9}
        />
        {quorumReached !== null && (
          <circle cx={centerX} cy={centerY} r={28}
            fill="none"
            stroke={quorumReached ? '#4ade80' : '#f87171'}
            strokeWidth={2} opacity={0.1}
            filter="url(#rc-neon)" />
        )}
        <text x={centerX} y={centerY - 4} fill="white" fontSize="18" fontWeight="700"
          textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
          {lockedNodes.length}/{nodeCount}
        </text>
        <text x={centerX} y={centerY + 14} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">
          Quorum: {quorum}
        </text>

        {/* Status text with neon glow */}
        {quorumReached !== null && (
          <motion.text x={centerX} y={265}
            textAnchor="middle" fontSize="12" fontWeight="700"
            fill={quorumReached ? '#4ade80' : '#f87171'}
            filter="url(#rc-glow)"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {quorumReached ? 'LOCK ACQUIRED' : 'QUORUM FAILED'}
          </motion.text>
        )}

        {/* Animating spinner */}
        {animating && (
          <motion.circle cx={centerX} cy={centerY} r={28}
            fill="none" stroke="#fbbf24" strokeWidth="2"
            strokeDasharray="8 4" filter="url(#rc-glow)"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />
        )}
      </svg>
    </div>
  )
}
