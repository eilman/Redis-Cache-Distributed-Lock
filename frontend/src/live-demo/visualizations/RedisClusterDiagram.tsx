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

  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1">Redlock - Multi-Node</h4>
      <svg viewBox="0 0 400 290" className="w-full max-w-sm mx-auto">
        <defs>
          <filter id="glow-cluster">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Connection lines between all nodes */}
        {nodes.map((a, i) =>
          nodes.slice(i + 1).map((b) => (
            <line key={`${a.id}-${b.id}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          ))
        )}

        {/* Nodes */}
        {nodes.map((node) => {
          const isLocked = node.locked
          const color = isLocked ? '#22c55e' : '#DC382D'
          return (
            <g key={node.id}>
              {/* Pulse ring for locked nodes */}
              {isLocked && (
                <motion.circle
                  cx={node.x} cy={node.y} r={30}
                  fill="none" stroke="#22c55e" strokeWidth="1"
                  animate={{ r: [30, 38, 30], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: node.id * 0.2 }}
                />
              )}
              <circle cx={node.x} cy={node.y} r={28}
                fill={color + '15'}
                stroke={color + '60'}
                strokeWidth={isLocked ? 2 : 1}
              />
              {/* Lock icon inside circle */}
              {isLocked && (
                <motion.text
                  x={node.x} y={node.y - 1}
                  textAnchor="middle" dominantBaseline="middle" fontSize="14"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: node.id * 0.15 }}
                >
                  {'🔒'}
                </motion.text>
              )}
              {/* Label below circle */}
              <text x={node.x} y={node.y + 40} fill="white" fontSize="9" fontWeight="600" textAnchor="middle">
                {node.label}
              </text>
            </g>
          )
        })}

        {/* Center quorum display */}
        <circle cx={centerX} cy={centerY} r={28}
          fill={quorumReached === true ? '#22c55e15' : quorumReached === false ? '#ef444415' : 'rgba(255,255,255,0.03)'}
          stroke={quorumReached === true ? '#22c55e50' : quorumReached === false ? '#ef444450' : 'rgba(255,255,255,0.1)'}
          strokeWidth="1.5"
        />
        <text x={centerX} y={centerY - 4} fill="white" fontSize="18" fontWeight="700" textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">
          {lockedNodes.length}/{nodeCount}
        </text>
        <text x={centerX} y={centerY + 14} fill="rgba(255,255,255,0.4)" fontSize="8" textAnchor="middle">
          Quorum: {quorum}
        </text>

        {/* Status text */}
        {quorumReached !== null && (
          <motion.text
            x={centerX} y={265}
            textAnchor="middle"
            fontSize="12"
            fontWeight="700"
            fill={quorumReached ? '#22c55e' : '#ef4444'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {quorumReached ? 'LOCK ACQUIRED' : 'QUORUM FAILED'}
          </motion.text>
        )}

        {/* Animating indicator */}
        {animating && (
          <motion.circle
            cx={centerX} cy={centerY} r={28}
            fill="none" stroke="#f59e0b" strokeWidth="2"
            strokeDasharray="8 4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${centerX}px ${centerY}px` }}
          />
        )}
      </svg>
    </div>
  )
}
