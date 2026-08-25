import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const REQUEST_COUNT = 6

const timelineSteps = [
  {
    label: 'Cache TTL Doldu',
    desc: 'Popüler ürün sayfasının cache süresi biter. Key artık Redis\'te yok.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500',
    iconBg: 'bg-yellow-500/20',
  },
  {
    label: 'N Request Gelir',
    desc: '10K concurrent kullanıcı aynı anda aynı key\'i ister. Hepsi cache MISS alır.',
    color: 'text-orange-400',
    bg: 'bg-orange-500',
    iconBg: 'bg-orange-500/20',
  },
  {
    label: 'Hepsi DB\'ye Gider',
    desc: 'Her MISS için ayrı ayrı DB sorgusu atılır. Connection pool hızla dolar.',
    color: 'text-red-400',
    bg: 'bg-red-500',
    iconBg: 'bg-red-500/20',
  },
  {
    label: 'DB Overload!',
    desc: 'CPU %100, connection pool tükenir, timeout\'lar başlar. Cascading failure.',
    color: 'text-red-500',
    bg: 'bg-red-600',
    iconBg: 'bg-red-600/20',
  },
]

export default function StampedeSlide() {
  const [dbHits, setDbHits] = useState(0)
  const [cpuLoad, setCpuLoad] = useState(0)
  const [phase, setPhase] = useState(0) // 0: idle, 1: miss, 2: db hit, 3: overload

  // Animate phases
  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 1500),
      setTimeout(() => setPhase(2), 2500),
      setTimeout(() => setPhase(3), 4000),
      setTimeout(() => setPhase(4), 5500),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  // Animate DB hit counter
  useEffect(() => {
    if (phase < 2) return
    const timer = setInterval(() => {
      setDbHits((prev) => {
        if (prev >= 10000) {
          clearInterval(timer)
          return 10000
        }
        return prev + Math.floor(Math.random() * 800) + 200
      })
    }, 100)
    return () => clearInterval(timer)
  }, [phase])

  // Animate CPU load
  useEffect(() => {
    if (phase < 2) return
    const timer = setInterval(() => {
      setCpuLoad((prev) => {
        if (prev >= 100) return 100
        return Math.min(100, prev + Math.floor(Math.random() * 12) + 3)
      })
    }, 120)
    return () => clearInterval(timer)
  }, [phase])

  return (
    <div className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Cache Stampede: Thundering Herd
      </motion.h2>

      {/* Detailed intro */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-amber-400 font-semibold">Black Friday, saat 00:00.</span> Popüler bir ürünün
          cache TTL'i doldu. 10.000 concurrent request aynı anda cache MISS alıyor ve{' '}
          <span className="text-red-400 font-semibold">hepsi birden DB'ye saldırıyor</span>. DB connection pool
          tükeniyor, response time 50ms'den 8 saniyeye fırlıyor. Cascading failure başlıyor —{' '}
          <span className="text-white font-semibold">tüm sistem çöküntüye giriyor</span>.
        </p>
        <div className="flex gap-4 mt-2">
          <span className="text-[11px] text-gray-500">
            <span className="text-amber-400 font-bold">Amazon</span> — 2012 Prime Day cache stampede sonucunda 15dk downtime
          </span>
          <span className="text-gray-700">|</span>
          <span className="text-[11px] text-gray-500">
            <span className="text-amber-400 font-bold">Shopify</span> — Flash sale sırasında DB connection pool tükenmesi
          </span>
          <span className="text-gray-700">|</span>
          <span className="text-[11px] text-gray-500">
            <span className="text-amber-400 font-bold">Twitter</span> — Trending topic cache expire sonucunda DB spike
          </span>
        </div>
      </motion.div>

      <div className="grid grid-cols-5 gap-3">
        {/* Left: Animated Diagram (3 cols) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-3 glass p-4 relative overflow-hidden"
          style={{ minHeight: 280 }}
        >
          {/* Phase indicator */}
          <div className="absolute top-2 left-3 flex items-center gap-2">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              phase >= 3 ? 'bg-red-500/20 text-red-400' :
              phase >= 2 ? 'bg-orange-500/20 text-orange-400' :
              phase >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-gray-500/20 text-gray-400'
            }`}>
              {phase >= 3 ? 'CRITICAL' : phase >= 2 ? 'WARNING' : phase >= 1 ? 'MISS DETECTED' : 'NORMAL'}
            </span>
          </div>

          {/* Clients on left */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 space-y-1.5">
            <p className="text-[10px] text-gray-500 font-semibold mb-1">Clients</p>
            {Array.from({ length: REQUEST_COUNT }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-1.5"
              >
                <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                </svg>
                <span className="text-[10px] text-gray-500 font-mono">req-{i + 1}</span>
              </motion.div>
            ))}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 1 ? 1 : 0 }}
              className="text-[10px] text-blue-400 font-mono mt-1"
            >
              + 9,994 more...
            </motion.p>
          </div>

          {/* Cache in center */}
          <div className="absolute left-[35%] top-1/2 -translate-y-1/2 -translate-x-1/2" style={{ zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="relative"
            >
              <div className={`w-20 h-20 rounded-xl border flex flex-col items-center justify-center transition-all duration-500 ${
                phase >= 1 ? 'bg-red-900/20 border-red-500/30' : 'bg-gray-800/80 border-gray-600/50'
              }`}>
                <svg className={`w-7 h-7 transition-colors duration-500 ${phase >= 1 ? 'text-red-500/60' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
                <span className={`text-[10px] mt-0.5 transition-colors duration-500 ${phase >= 1 ? 'text-red-400' : 'text-gray-500'}`}>Redis</span>
              </div>
              {/* X mark for expired */}
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: phase >= 1 ? 1 : 0, rotate: 0 }}
                transition={{ delay: 1.0, type: 'spring' }}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"
              >
                <span className="text-white text-[10px] font-bold">X</span>
              </motion.div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: phase >= 1 ? 1 : 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-red-400 font-bold whitespace-nowrap"
              >
                TTL EXPIRED
              </motion.span>
            </motion.div>
          </div>

          {/* SVG Arrow Overlay */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              <linearGradient id="missGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(59,130,246)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="0.5" />
              </linearGradient>
              <linearGradient id="dbGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgb(239,68,68)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="rgb(239,68,68)" stopOpacity="1" />
              </linearGradient>
            </defs>

            {/* Client → Cache (MISS) — yatay çizgiler */}
            {phase >= 1 && Array.from({ length: REQUEST_COUNT }).map((_, i) => {
              const y = 33 + i * 7
              return (
                <motion.line
                  key={`miss-${i}`}
                  x1="16%" y1={`${y}%`}
                  x2="27%" y2={`${y}%`}
                  stroke="url(#missGrad)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 1.3 + i * 0.05 }}
                />
              )
            })}

            {/* Cache → DB (converging) — Redis sağ kenarından PostgreSQL'e */}
            {phase >= 2 && Array.from({ length: REQUEST_COUNT }).map((_, i) => {
              const startY = 38 + i * 5
              return (
                <motion.line
                  key={`db-${i}`}
                  x1="44%" y1={`${startY}%`}
                  x2="80%" y2="50%"
                  stroke="url(#dbGrad)"
                  strokeWidth="1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ delay: 0.1 + i * 0.06, duration: 0.4 }}
                />
              )
            })}
          </svg>

          {/* Flowing dots: Client → Cache */}
          {phase >= 1 && Array.from({ length: REQUEST_COUNT }).map((_, i) => {
            const y = 33 + i * 7
            return (
              <motion.div
                key={`dot-miss-${i}`}
                className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
                style={{ top: `${y}%`, zIndex: 1 }}
                animate={{ left: ['16%', '27%'] }}
                transition={{ duration: 0.8, delay: 1.4 + i * 0.15, repeat: Infinity, repeatDelay: 0.5, ease: 'linear' }}
              />
            )
          })}

          {/* Flowing dots: Cache → DB (converging to center) */}
          {phase >= 2 && Array.from({ length: REQUEST_COUNT }).map((_, i) => {
            const startY = 38 + i * 5
            return (
              <motion.div
                key={`dot-db-${i}`}
                className="absolute w-2 h-2 rounded-full bg-red-500"
                style={{ zIndex: 1 }}
                animate={{
                  left: ['44%', '80%'],
                  top: [`${startY}%`, '50%'],
                  opacity: [0.8, 1, 0.6],
                  scale: [1, 1.3, 0.8],
                }}
                transition={{ duration: 1.2, delay: 0.2 + i * 0.2, repeat: Infinity, repeatDelay: 0.3, ease: 'easeIn' }}
              />
            )
          })}

          {/* DB on right */}
          <div className="absolute right-6 top-1/2 -translate-y-1/2" style={{ zIndex: 2 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              className="relative"
            >
              <motion.div
                animate={phase >= 3 ? {
                  boxShadow: [
                    '0 0 0px rgba(239,68,68,0)',
                    '0 0 25px rgba(239,68,68,0.6)',
                    '0 0 0px rgba(239,68,68,0)',
                  ],
                } : undefined}
                transition={phase >= 3 ? { duration: 1, repeat: Infinity } : undefined}
                className={`w-20 h-20 rounded-xl border flex flex-col items-center justify-center transition-all duration-700 ${
                  phase >= 3 ? 'bg-red-900/50 border-red-500/60' :
                  phase >= 2 ? 'bg-orange-900/30 border-orange-500/40' :
                  'bg-green-900/20 border-green-500/30'
                }`}
              >
                <svg className={`w-7 h-7 transition-colors duration-500 ${
                  phase >= 3 ? 'text-red-400' : phase >= 2 ? 'text-orange-400' : 'text-green-400'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
                </svg>
                <span className={`text-[10px] mt-0.5 font-semibold transition-colors duration-500 ${
                  phase >= 3 ? 'text-red-400' : phase >= 2 ? 'text-orange-400' : 'text-green-400'
                }`}>PostgreSQL</span>
              </motion.div>

              {/* Connection Pool Bar */}
              <div className="mt-2 w-20">
                <div className="flex justify-between text-[8px] text-gray-500 mb-0.5">
                  <span>Conn Pool</span>
                  <span className={phase >= 3 ? 'text-red-400 font-bold' : ''}>{Math.min(cpuLoad, 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-300 ${
                      cpuLoad >= 90 ? 'bg-red-500' : cpuLoad >= 60 ? 'bg-orange-500' : 'bg-green-500'
                    }`}
                    animate={{ width: `${cpuLoad}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
              </div>

              <motion.span
                animate={phase >= 3 ? { opacity: [0, 1, 0] } : { opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
                className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] text-red-500 font-bold whitespace-nowrap"
              >
                OVERLOADED!
              </motion.span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right: Live Metrics + Timeline (2 cols) */}
        <div className="col-span-2 space-y-3">
          {/* Live Metrics */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-3 space-y-2"
          >
            <h3 className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Canlı Metrikler</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-500">DB Sorgu</p>
                <motion.p
                  className="text-lg font-bold font-mono text-red-400"
                  key={dbHits}
                >
                  {dbHits.toLocaleString()}
                </motion.p>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-500">CPU Load</p>
                <p className={`text-lg font-bold font-mono ${
                  cpuLoad >= 90 ? 'text-red-500' : cpuLoad >= 60 ? 'text-orange-400' : 'text-green-400'
                }`}>
                  %{cpuLoad}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-500">Response Time</p>
                <p className={`text-lg font-bold font-mono ${phase >= 3 ? 'text-red-400' : phase >= 2 ? 'text-orange-400' : 'text-green-400'}`}>
                  {phase >= 3 ? '8.2s' : phase >= 2 ? '1.4s' : '50ms'}
                </p>
              </div>
              <div className="bg-black/20 rounded-lg p-2 text-center">
                <p className="text-[9px] text-gray-500">Conn Pool</p>
                <p className={`text-lg font-bold font-mono ${phase >= 3 ? 'text-red-500' : 'text-green-400'}`}>
                  {phase >= 3 ? 'FULL' : phase >= 2 ? '87%' : '12%'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="glass p-3 space-y-2"
          >
            <h3 className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">Timeline</h3>
            <div className="space-y-1.5">
              {timelineSteps.map((step, i) => {
                const isActive = phase >= i + 1
                const isCurrent = phase === i + 1
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.15 }}
                    className={`flex items-start gap-2 p-1.5 rounded-lg transition-all duration-300 ${
                      isCurrent ? `${step.iconBg} border border-white/5` : ''
                    }`}
                  >
                    <motion.div
                      animate={isCurrent && i === 3 ? {
                        scale: [1, 1.2, 1],
                      } : undefined}
                      transition={isCurrent && i === 3 ? { duration: 0.8, repeat: Infinity } : undefined}
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300 ${
                        isActive ? step.bg : 'bg-gray-700'
                      }`}
                    >
                      <span className="text-white text-[9px] font-bold">{i + 1}</span>
                    </motion.div>
                    <div>
                      <p className={`text-[11px] font-semibold transition-colors duration-300 ${
                        isActive ? step.color : 'text-gray-600'
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-[10px] leading-snug transition-colors duration-300 ${
                        isActive ? 'text-gray-400' : 'text-gray-700'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Solution hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.0 }}
        className="glass p-3 border-l-4 border-green-500/50 flex items-start gap-3"
      >
        <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <p className="text-green-400 font-semibold text-sm">Çözüm: Distributed Lock ile Stampede Önleme</p>
          <p className="text-gray-400 text-[11px] mt-0.5 leading-relaxed">
            Cache MISS olduğunda <span className="text-green-300 font-medium">sadece bir thread</span> Redis lock alır ve DB'den veriyi çeker.
            Diğer thread'ler lock bekler — cache dolduğu anda hepsi Redis'ten okur.
            <span className="text-gray-500"> 10.000 DB sorgusu → 1 DB sorgusu.</span>
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <div className="bg-red-500/10 border border-red-500/20 rounded px-2 py-1 text-center">
            <p className="text-[9px] text-gray-500">Öncesi</p>
            <p className="text-sm font-bold text-red-400 font-mono">10K</p>
          </div>
          <div className="bg-green-500/10 border border-green-500/20 rounded px-2 py-1 text-center">
            <p className="text-[9px] text-gray-500">Sonrası</p>
            <p className="text-sm font-bold text-green-400 font-mono">1</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
