import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import { redlockApi } from '../../api/lockApi'

const steps = [
  { id: 1, label: 'Şimdiki zamanı al (T1)', description: 'İstemci lock süresini hesaplamak için mevcut zamanı kaydeder' },
  { id: 2, label: 'N Redis instance\'a lock iste', description: 'Sırayla 3 Redis node\'una SET NX PX komutu gönderilir' },
  { id: 3, label: 'Çoğunluk kontrolü (N/2+1)', description: 'En az 2/3 node\'dan OK + süre < validity time' },
  { id: 4, label: 'Başarısızsa tüm lock\'ları bırak', description: 'Çoğunluk sağlanamazsa alınan tüm lock\'lar silinir' },
]

type NodeState = 'idle' | 'acquiring' | 'acquired' | 'failed' | 'released'

/* Animated particle flowing along a connection line */
function FlowingParticle({ fromX, fromY, toX, toY, color, delay, active }: {
  fromX: number; fromY: number; toX: number; toY: number
  color: string; delay: number; active: boolean
}) {
  if (!active) return null
  return (
    <>
      <motion.circle
        r={4}
        fill={color}
        filter="url(#particleGlow)"
        initial={{ cx: fromX, cy: fromY, opacity: 0 }}
        animate={{
          cx: [fromX, toX],
          cy: [fromY, toY],
          opacity: [0, 1, 1, 0],
        }}
        transition={{
          duration: 0.9,
          delay,
          repeat: Infinity,
          repeatDelay: 0.6,
          ease: 'easeInOut',
        }}
      />
      {/* Trail particle */}
      <motion.circle
        r={2}
        fill={color}
        opacity={0.4}
        initial={{ cx: fromX, cy: fromY }}
        animate={{
          cx: [fromX, toX],
          cy: [fromY, toY],
          opacity: [0, 0.5, 0.3, 0],
        }}
        transition={{
          duration: 0.9,
          delay: delay + 0.12,
          repeat: Infinity,
          repeatDelay: 0.6,
          ease: 'easeInOut',
        }}
      />
    </>
  )
}

/* Quorum result badge */
function QuorumBadge({ acquired, total }: { acquired: number; total: number }) {
  const success = acquired >= 2
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        success
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : 'bg-red-500/10 border-red-500/30 text-red-400'
      }`}
    >
      <span className="text-sm">{success ? '\u2713' : '\u2717'}</span>
      {acquired}/{total} = {success ? 'Quorum OK' : 'Quorum FAIL'}
    </motion.div>
  )
}

export default function RedlockAlgorithmSlide() {
  const [activeStep, setActiveStep] = useState(0)
  const [nodeStates, setNodeStates] = useState<Record<number, NodeState>>(
    { 1: 'idle', 2: 'idle', 3: 'idle' }
  )
  const [running, setRunning] = useState(false)
  const [mode, setMode] = useState<'live' | 'animated'>('live')
  const [showQuorum, setShowQuorum] = useState(false)

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const acquiredCount = Object.values(nodeStates).filter(s => s === 'acquired').length

  const runLiveDemo = async () => {
    setRunning(true)
    setActiveStep(0)
    setShowQuorum(false)
    setNodeStates({ 1: 'idle', 2: 'idle', 3: 'idle' })

    setActiveStep(1)
    await sleep(500)
    setActiveStep(2)
    setNodeStates({ 1: 'acquiring', 2: 'acquiring', 3: 'acquiring' })

    try {
      const res = await redlockApi.acquire('demo-resource')
      const data = res.data?.data as { nodeDetails?: Array<{ node: number; acquired: boolean }>, success?: boolean }
      const nodeDetails = data?.nodeDetails || []

      for (const node of nodeDetails) {
        setNodeStates(prev => ({
          ...prev,
          [node.node]: node.acquired ? 'acquired' : 'failed'
        }))
        await sleep(400)
      }

      await sleep(500)
      setShowQuorum(true)
      setActiveStep(data?.success ? 3 : 4)

      await sleep(1500)
      await redlockApi.release('demo-resource')
      setNodeStates({ 1: 'released', 2: 'released', 3: 'released' })
    } catch {
      setNodeStates({ 1: 'failed', 2: 'failed', 3: 'failed' })
      setActiveStep(4)
      setShowQuorum(true)
    }

    setRunning(false)
  }

  const runAnimation = async (success: boolean) => {
    setRunning(true)
    setActiveStep(0)
    setShowQuorum(false)
    setNodeStates({ 1: 'idle', 2: 'idle', 3: 'idle' })

    await sleep(800)
    setActiveStep(1)

    await sleep(1000)
    setActiveStep(2)
    const results = success ? [true, true, false] : [true, false, false]
    for (let i = 0; i < 3; i++) {
      setNodeStates(prev => ({ ...prev, [i + 1]: 'acquiring' }))
      await sleep(500)
      setNodeStates(prev => ({
        ...prev,
        [i + 1]: results[i] ? 'acquired' : 'failed',
      }))
      await sleep(300)
    }

    await sleep(800)
    setShowQuorum(true)
    if (success) {
      setActiveStep(3)
      await sleep(1500)
      setActiveStep(4)
    } else {
      setActiveStep(4)
      await sleep(600)
      setNodeStates({ 1: 'released', 2: 'released', 3: 'released' })
    }
    setRunning(false)
  }

  // Node positions in SVG viewBox coordinates (0-320 x 0-340)
  const nodePositions = [
    { id: 1, label: 'Redis 1', cx: 160, cy: 50 },
    { id: 2, label: 'Redis 2', cx: 45,  cy: 275 },
    { id: 3, label: 'Redis 3', cx: 275, cy: 275 },
  ]
  const clientPos = { cx: 160, cy: 165 }

  const getNodeColors = (state: NodeState) => {
    switch (state) {
      case 'idle':      return { fill: '#1e293b', stroke: '#475569', text: '#94a3b8', glow: 'transparent' }
      case 'acquiring': return { fill: '#422006', stroke: '#eab308', text: '#fde047', glow: '#eab308' }
      case 'acquired':  return { fill: '#052e16', stroke: '#22c55e', text: '#4ade80', glow: '#22c55e' }
      case 'failed':    return { fill: '#450a0a', stroke: '#ef4444', text: '#f87171', glow: '#ef4444' }
      case 'released':  return { fill: '#1a1a2e', stroke: '#6366f1', text: '#818cf8', glow: 'transparent' }
    }
  }

  // Ambient floating dots
  const [dots] = useState(() =>
    Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 30 + Math.random() * 260,
      y: 20 + Math.random() * 300,
      size: 1 + Math.random() * 1.5,
      dur: 4 + Math.random() * 3,
    }))
  )

  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Redlock: Quorum-Based Distributed Lock
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-2.5 border border-amber-500/20 text-center"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Tek Redis node'u çökerse lock kaybolur.</span>{' '}
          Redlock bunu çözer: 3 bağımsız node'a aynı anda lock isteği gönderilir. En az 2/3'ünden onay alınırsa lock geçerli.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* ===== LEFT: Algorithm Steps ===== */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Mode toggle + buttons */}
          <div className="flex gap-2 mb-2 flex-wrap items-center">
            <div className="flex gap-1 bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setMode('live')}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${mode === 'live' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Live
              </button>
              <button
                onClick={() => setMode('animated')}
                className={`px-2 py-1 rounded text-xs font-mono transition-colors ${mode === 'animated' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
              >
                Animated
              </button>
            </div>
            {mode === 'live' ? (
              <Button onClick={runLiveDemo} disabled={running} size="sm">
                Run Live Demo
              </Button>
            ) : (
              <>
                <Button onClick={() => runAnimation(true)} disabled={running} size="sm">
                  Başarılı
                </Button>
                <Button onClick={() => runAnimation(false)} disabled={running} variant="danger" size="sm">
                  Başarısız
                </Button>
              </>
            )}
          </div>

          {/* Steps */}
          {steps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: 0,
                scale: activeStep === step.id ? 1.02 : 1,
              }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className={`glass p-3 rounded-xl border-l-4 transition-all duration-500 ${
                activeStep === step.id
                  ? 'border-l-indigo-500 bg-indigo-500/10 shadow-lg shadow-indigo-500/5'
                  : activeStep > step.id
                    ? 'border-l-green-500/50 opacity-60'
                    : 'border-l-gray-700 opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={activeStep === step.id ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors duration-500 ${
                    activeStep === step.id
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                      : activeStep > step.id
                        ? 'bg-green-500/30 text-green-400'
                        : 'bg-gray-700 text-gray-400'
                  }`}
                >
                  {activeStep > step.id ? '\u2713' : step.id}
                </motion.div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm leading-tight">{step.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5 leading-tight">{step.description}</p>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Quorum badge */}
          <AnimatePresence>
            {showQuorum && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex justify-center pt-1"
              >
                <QuorumBadge acquired={acquiredCount} total={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ===== RIGHT: Redis Cluster Visualization (SVG) ===== */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl overflow-hidden flex flex-col"
        >
          {/* Title bar with status LEDs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Redis Cluster (N=3, Quorum=2)
            </h3>
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3].map(n => {
                const s = nodeStates[n]
                return (
                  <motion.div
                    key={n}
                    className={`w-2 h-2 rounded-full ${
                      s === 'acquired' ? 'bg-green-400' :
                      s === 'failed' ? 'bg-red-400' :
                      s === 'acquiring' ? 'bg-yellow-400' :
                      'bg-gray-600'
                    }`}
                    animate={s === 'acquiring' ? { opacity: [1, 0.3, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  />
                )
              })}
            </div>
          </div>

          {/* SVG Diagram */}
          <div className="flex-1 p-3">
            <svg viewBox="0 0 320 340" className="w-full h-auto" style={{ maxHeight: 340 }}>
              <defs>
                {/* Glow for particles */}
                <filter id="particleGlow" x="-100%" y="-100%" width="300%" height="300%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Glow for nodes */}
                <filter id="nodeGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* Radial gradient for client */}
                <radialGradient id="clientGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </radialGradient>
                {/* Animated dash offset for acquiring lines */}
                <style>{`
                  @keyframes dashFlow {
                    to { stroke-dashoffset: -20; }
                  }
                  .dash-animate {
                    animation: dashFlow 0.8s linear infinite;
                  }
                `}</style>
              </defs>

              {/* Ambient floating dots */}
              {dots.map(d => (
                <motion.circle
                  key={d.id}
                  cx={d.x}
                  cy={d.y}
                  r={d.size}
                  fill="#6366f1"
                  opacity={0.06}
                  animate={{
                    cy: [d.y - 8, d.y + 8, d.y - 8],
                    opacity: [0.03, 0.1, 0.03],
                  }}
                  transition={{ duration: d.dur, repeat: Infinity, ease: 'easeInOut' }}
                />
              ))}

              {/* ---- Connection lines (behind nodes) ---- */}
              {nodePositions.map(node => {
                const state = nodeStates[node.id]
                const colors = getNodeColors(state)
                const isActive = state !== 'idle' && state !== 'released'

                return (
                  <g key={`conn-${node.id}`}>
                    {/* Base connection line */}
                    <line
                      x1={clientPos.cx} y1={clientPos.cy}
                      x2={node.cx} y2={node.cy}
                      stroke={isActive ? colors.stroke : '#334155'}
                      strokeWidth={isActive ? 2.5 : 1}
                      strokeDasharray={state === 'acquiring' ? '6 4' : state === 'idle' ? '3 6' : 'none'}
                      opacity={isActive ? 0.5 : 0.12}
                      strokeLinecap="round"
                      className={state === 'acquiring' ? 'dash-animate' : ''}
                    />
                    {/* Glow overlay for active lines */}
                    {isActive && (
                      <line
                        x1={clientPos.cx} y1={clientPos.cy}
                        x2={node.cx} y2={node.cy}
                        stroke={colors.stroke}
                        strokeWidth={6}
                        opacity={0.08}
                        strokeLinecap="round"
                        filter="url(#particleGlow)"
                      />
                    )}
                  </g>
                )
              })}

              {/* ---- Flowing particles ---- */}
              {nodePositions.map((node, i) => {
                const state = nodeStates[node.id]
                const colors = getNodeColors(state)
                return (
                  <g key={`particles-${node.id}`}>
                    {/* Request particle: client -> node */}
                    <FlowingParticle
                      fromX={clientPos.cx} fromY={clientPos.cy}
                      toX={node.cx} toY={node.cy}
                      color={colors.stroke}
                      delay={i * 0.25}
                      active={state === 'acquiring'}
                    />
                    {/* Response particle: node -> client */}
                    <FlowingParticle
                      fromX={node.cx} fromY={node.cy}
                      toX={clientPos.cx} toY={clientPos.cy}
                      color={colors.stroke}
                      delay={i * 0.25 + 0.4}
                      active={state === 'acquired'}
                    />
                  </g>
                )
              })}

              {/* ---- Client node (center) ---- */}
              <motion.g
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 180 }}
                style={{ transformOrigin: `${clientPos.cx}px ${clientPos.cy}px` }}
              >
                {/* Pulse ring when running */}
                {running && (
                  <motion.circle
                    cx={clientPos.cx} cy={clientPos.cy} r={28}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    animate={{ r: [28, 44], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                {/* Background glow */}
                <circle cx={clientPos.cx} cy={clientPos.cy} r={36} fill="url(#clientGrad)" />
                {/* Main circle */}
                <circle cx={clientPos.cx} cy={clientPos.cy} r={26} fill="#1e1b4b" stroke="#6366f1" strokeWidth={2} />
                {/* Icon */}
                <text x={clientPos.cx} y={clientPos.cy - 2} textAnchor="middle" fill="#a5b4fc" fontSize="15" fontWeight="bold" dominantBaseline="central">
                  {'{ }'}
                </text>
                <text x={clientPos.cx} y={clientPos.cy + 18} textAnchor="middle" fill="#818cf8" fontSize="9" fontFamily="monospace">
                  Client
                </text>
              </motion.g>

              {/* ---- Redis nodes ---- */}
              {nodePositions.map((node, i) => {
                const state = nodeStates[node.id]
                const colors = getNodeColors(state)
                const isActive = state !== 'idle'

                return (
                  <motion.g
                    key={node.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.12, type: 'spring', stiffness: 180 }}
                    style={{ transformOrigin: `${node.cx}px ${node.cy}px` }}
                  >
                    {/* Pulse ring for acquiring/acquired */}
                    {(state === 'acquiring' || state === 'acquired') && (
                      <motion.rect
                        x={node.cx - 34}
                        y={node.cy - 28}
                        width={68}
                        height={56}
                        rx={14}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={1}
                        animate={{
                          x: [node.cx - 34, node.cx - 40],
                          y: [node.cy - 28, node.cy - 34],
                          width: [68, 80],
                          height: [56, 68],
                          opacity: [0.4, 0],
                        }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}

                    {/* Node card */}
                    <rect
                      x={node.cx - 32}
                      y={node.cy - 26}
                      width={64}
                      height={52}
                      rx={12}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={2}
                      filter={isActive ? 'url(#nodeGlow)' : 'none'}
                    />

                    {/* Redis diamond logo */}
                    <g transform={`translate(${node.cx}, ${node.cy - 8})`}>
                      <polygon
                        points="0,-9 11,0 0,9 -11,0"
                        fill="none"
                        stroke={colors.text}
                        strokeWidth={1.5}
                        opacity={0.5}
                      />
                      <line x1="-11" y1="0" x2="11" y2="0" stroke={colors.text} strokeWidth={1} opacity={0.3} />
                    </g>

                    {/* Node label */}
                    <text
                      x={node.cx}
                      y={node.cy + 16}
                      textAnchor="middle"
                      fill={colors.text}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.label}
                    </text>

                    {/* Status badge (top-right corner) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.g
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                        >
                          <circle
                            cx={node.cx + 24}
                            cy={node.cy - 20}
                            r={9}
                            fill={
                              state === 'acquired' ? '#14532d' :
                              state === 'failed' ? '#7f1d1d' :
                              state === 'acquiring' ? '#713f12' : '#312e81'
                            }
                            stroke={colors.stroke}
                            strokeWidth={1.5}
                          />
                          <text
                            x={node.cx + 24}
                            y={node.cy - 16}
                            textAnchor="middle"
                            fill={colors.text}
                            fontSize="9"
                            fontWeight="bold"
                          >
                            {state === 'acquiring' ? '...' :
                             state === 'acquired' ? '\u2713' :
                             state === 'failed' ? '\u2717' : '\u21bb'}
                          </text>
                        </motion.g>
                      )}
                    </AnimatePresence>
                  </motion.g>
                )
              })}

              {/* SET NX labels on lines when acquiring */}
              {nodePositions.map((node) => {
                const state = nodeStates[node.id]
                if (state !== 'acquiring' && state !== 'acquired') return null
                const midX = (clientPos.cx + node.cx) / 2
                const midY = (clientPos.cy + node.cy) / 2
                // Offset label perpendicular to line to avoid overlap
                const dx = node.cx - clientPos.cx
                const dy = node.cy - clientPos.cy
                const len = Math.sqrt(dx * dx + dy * dy)
                const offX = (-dy / len) * 14
                const offY = (dx / len) * 14
                return (
                  <motion.text
                    key={`label-${node.id}`}
                    x={midX + offX}
                    y={midY + offY}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={state === 'acquired' ? '#4ade80' : '#fde047'}
                    fontSize="7"
                    fontFamily="monospace"
                    fontWeight="bold"
                    opacity={0.7}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                  >
                    {state === 'acquired' ? 'OK' : 'SET NX'}
                  </motion.text>
                )
              })}

              {/* Legend */}
              <g transform="translate(8, 318)">
                {[
                  { color: '#22c55e', bg: '#052e16', label: 'OK' },
                  { color: '#ef4444', bg: '#450a0a', label: 'FAIL' },
                  { color: '#eab308', bg: '#422006', label: 'WAIT' },
                ].map((item, i) => (
                  <g key={item.label} transform={`translate(${i * 48}, 0)`}>
                    <rect x={0} y={0} width={10} height={10} rx={3} fill={item.bg} stroke={item.color} strokeWidth={1} />
                    <text x={14} y={8} fill="#94a3b8" fontSize="8" fontFamily="monospace">{item.label}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="glass p-3 text-center text-xs text-gray-400 border border-white/5"
      >
        Redlock, Redis'in resmi olarak önerdiği dağıtık lock algoritmasıdır. Martin Kleppmann'ın eleştirilerine rağmen
        yaygın kullanılır. Çoğunluk (quorum) tabanlı çalışır: N node'un en az N/2+1 tanesinden onay gerektirir.
      </motion.div>
    </div>
  )
}
