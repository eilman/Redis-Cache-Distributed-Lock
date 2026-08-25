import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Props {
  requestCount: number
  mode: 'unprotected' | 'protected'
  running: boolean
}

export default function TrafficSimulator({ requestCount, mode, running }: Props) {
  const [particles, setParticles] = useState<{ id: number; y: number; phase: 'cache' | 'db' | 'done'; color: string }[]>([])

  useEffect(() => {
    if (!running) {
      setParticles([])
      return
    }

    const count = Math.min(requestCount, 20)
    const initial = Array.from({ length: count }, (_, i) => ({
      id: i,
      y: 20 + (i * 160) / count,
      phase: 'cache' as const,
      color: mode === 'unprotected' ? '#f87171' : i === 0 ? '#fbbf24' : '#4ade80',
    }))
    setParticles(initial)

    const t1 = setTimeout(() => {
      setParticles(prev =>
        prev.map((p, i) => ({
          ...p,
          phase: mode === 'unprotected' ? 'db' : i === 0 ? 'db' : 'done',
        }))
      )
    }, 1200)

    const t2 = setTimeout(() => {
      setParticles(prev => prev.map(p => ({ ...p, phase: 'done' })))
    }, 2400)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [running, requestCount, mode])

  return (
    <div className="relative w-full max-w-2xl mx-auto h-44 rounded-xl bg-black/30 border border-white/[0.06] overflow-hidden"
      style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)' }}>

      {/* Dot grid background */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }} />

      {/* Labels */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4" style={{ color: '#00d4ff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          <span style={{ color: '#00d4ff' }}>Clients</span>
        </div>
      </div>

      {/* Redis node */}
      <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2">
        <div className="w-14 h-14 rounded-xl border bg-black/40 flex flex-col items-center justify-center"
          style={{
            borderColor: '#f8717130',
            boxShadow: '0 0 12px #f8717115, inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <span className="text-[9px] font-bold" style={{ color: '#f87171' }}>Redis</span>
        </div>
      </div>

      {/* DB node */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <div className={`w-14 h-14 rounded-xl border bg-black/40 flex flex-col items-center justify-center transition-all`}
          style={{
            borderColor: mode === 'unprotected' && running ? '#f8717150' : '#4ade8030',
            boxShadow: mode === 'unprotected' && running
              ? '0 0 16px #f8717130, 0 0 4px #f8717120'
              : '0 0 12px #4ade8015, inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <span className="text-[9px] font-bold"
            style={{ color: mode === 'unprotected' && running ? '#f87171' : '#4ade80' }}>
            DB
          </span>
        </div>
      </div>

      {/* Particles */}
      {particles.map((p) => {
        const targetX = p.phase === 'cache' ? '35%' : p.phase === 'db' ? '78%' : p.color === '#4ade80' ? '35%' : '78%'
        return (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full"
            style={{
              backgroundColor: p.color,
              top: p.y,
              boxShadow: `0 0 6px ${p.color}80, 0 0 12px ${p.color}40`,
            }}
            initial={{ left: '12%', opacity: 0 }}
            animate={{
              left: targetX,
              opacity: p.phase === 'done' ? 0.3 : 1,
              scale: p.phase === 'done' ? 0.6 : 1,
            }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />
        )
      })}

      {/* Legend */}
      <div className="absolute bottom-2 left-3 flex gap-3">
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#4ade80', boxShadow: '0 0 4px #4ade8060' }} /> Cache HIT
        </span>
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fbbf24', boxShadow: '0 0 4px #fbbf2460' }} /> DB Query
        </span>
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f87171', boxShadow: '0 0 4px #f8717160' }} /> DB Overload
        </span>
      </div>
    </div>
  )
}
