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
      color: mode === 'unprotected' ? '#ef4444' : i === 0 ? '#f59e0b' : '#22c55e',
    }))
    setParticles(initial)

    // Phase 2: move to DB or return from cache
    const t1 = setTimeout(() => {
      setParticles(prev =>
        prev.map((p, i) => ({
          ...p,
          phase: mode === 'unprotected' ? 'db' : i === 0 ? 'db' : 'done',
        }))
      )
    }, 1200)

    // Phase 3: done
    const t2 = setTimeout(() => {
      setParticles(prev => prev.map(p => ({ ...p, phase: 'done' })))
    }, 2400)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [running, requestCount, mode])

  return (
    <div className="relative w-full max-w-2xl mx-auto h-44 rounded-xl bg-black/20 border border-white/5 overflow-hidden">
      {/* Labels */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 font-semibold">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          Clients
        </div>
      </div>

      {/* Redis node */}
      <div className="absolute left-[40%] top-1/2 -translate-y-1/2 -translate-x-1/2">
        <div className="w-14 h-14 rounded-xl border border-red-500/30 bg-red-500/10 flex flex-col items-center justify-center">
          <span className="text-red-400 text-[9px] font-bold">Redis</span>
        </div>
      </div>

      {/* DB node */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2">
        <div className={`w-14 h-14 rounded-xl border flex flex-col items-center justify-center transition-all ${
          mode === 'unprotected' && running ? 'border-red-500/50 bg-red-500/20' : 'border-green-500/30 bg-green-500/10'
        }`}>
          <span className={`text-[9px] font-bold ${mode === 'unprotected' && running ? 'text-red-400' : 'text-green-400'}`}>
            DB
          </span>
        </div>
      </div>

      {/* Particles */}
      {particles.map((p) => {
        const targetX = p.phase === 'cache' ? '35%' : p.phase === 'db' ? '78%' : p.color === '#22c55e' ? '35%' : '78%'
        return (
          <motion.div
            key={p.id}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color, top: p.y }}
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
          <span className="w-2 h-2 rounded-full bg-green-500" /> Cache HIT
        </span>
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> DB Query
        </span>
        <span className="flex items-center gap-1 text-[9px] text-gray-500">
          <span className="w-2 h-2 rounded-full bg-red-500" /> DB Overload
        </span>
      </div>
    </div>
  )
}
