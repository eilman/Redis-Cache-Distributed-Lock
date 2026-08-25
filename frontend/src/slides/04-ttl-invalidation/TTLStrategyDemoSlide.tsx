import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import DemoPanel from '../../components/demo/DemoPanel'
import { ttlDemoApi } from '../../api/cacheApi'

type Strategy = 'FIXED' | 'DYNAMIC' | 'JITTERED'

// Sabit random değerler (her renderda değişmesin)
const JITTER_OFFSETS = [3, 7, 1, 9, 5, 2, 8, 4, 6, 10]
const DYNAMIC_CATEGORIES = [
  'electronics', 'books', 'clothing', 'electronics', 'books',
  'clothing', 'electronics', 'books', 'clothing', 'electronics',
]
const DYNAMIC_TTLS: Record<string, number> = { electronics: 6, books: 18, clothing: 12 }
const CATEGORY_COLORS: Record<string, string> = {
  electronics: 'bg-red-500', books: 'bg-green-500', clothing: 'bg-yellow-500',
}
const CATEGORY_LABELS: Record<string, string> = {
  electronics: 'Elektronik', books: 'Kitap', clothing: 'Giyim',
}

const TIMELINE_BASE = 12 // base TTL for animation (seconds)
const KEY_COUNT = 8

export default function TTLStrategyDemoSlide() {
  const [strategy, setStrategy] = useState<Strategy>('FIXED')
  const [baseTTL, setBaseTTL] = useState(60)
  const [jitterRange, setJitterRange] = useState(15)
  const [tick, setTick] = useState(0)

  // Timeline animation — auto increment tick
  useEffect(() => {
    const maxTick = TIMELINE_BASE + 12 // enough to show all expire
    const timer = setInterval(() => {
      setTick((prev) => (prev >= maxTick ? 0 : prev + 1))
    }, 500)
    return () => clearInterval(timer)
  }, [])

  // Generate TTL values for each strategy column
  const timelineTTLs = useMemo(() => ({
    FIXED: Array.from({ length: KEY_COUNT }, () => TIMELINE_BASE),
    DYNAMIC: Array.from({ length: KEY_COUNT }, (_, i) => DYNAMIC_TTLS[DYNAMIC_CATEGORIES[i]]),
    JITTERED: Array.from({ length: KEY_COUNT }, (_, i) => TIMELINE_BASE + JITTER_OFFSETS[i]),
  }), [])

  const strategyMeta: Record<Strategy, {
    color: string; accent: string; label: string; desc: string
    useCase: string; risk: string; cmd: string
  }> = {
    FIXED: {
      color: 'cyan', accent: 'bg-cyan-500', label: 'Fixed TTL',
      desc: 'Tüm key\'lere aynı sabit TTL atanır.',
      useCase: 'Basit uygulamalar, tek tip veri',
      risk: 'Tüm key\'ler aynı anda expire → Cache Stampede riski!',
      cmd: `SET key val EX ${baseTTL}`,
    },
    DYNAMIC: {
      color: 'green', accent: 'bg-green-500', label: 'Dynamic TTL',
      desc: 'Verinin kategorisine göre farklı TTL atanır.',
      useCase: 'E-commerce: elektronik (30s), kitap (300s), giyim (120s)',
      risk: 'Aynı kategorideki key\'ler yine aynı anda expire olabilir',
      cmd: 'EX calculateTTL(category)',
    },
    JITTERED: {
      color: 'purple', accent: 'bg-purple-500', label: 'Jittered TTL',
      desc: 'Base TTL + rastgele sapma ile expire zamanları dağıtılır.',
      useCase: 'Yüksek trafikli sistemler, stampede koruması',
      risk: 'Düşük risk — expire zamanları doğal olarak yayılır',
      cmd: `EX ${baseTTL} + rand(0,${jitterRange})`,
    },
  }

  // Count expired keys per strategy at current tick
  const expiredCounts = useMemo(() => ({
    FIXED: timelineTTLs.FIXED.filter((t) => tick >= t).length,
    DYNAMIC: timelineTTLs.DYNAMIC.filter((t) => tick >= t).length,
    JITTERED: timelineTTLs.JITTERED.filter((t) => tick >= t).length,
  }), [tick, timelineTTLs])

  return (
    <div className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        TTL Strategy Comparison
      </motion.h2>

      {/* Canlı Timeline Animasyonu — 3 strateji yan yana */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-4 border border-white/5"
      >
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-gray-500">Canlı Karşılaştırma — her çubuk bir cache key</p>
          <span className="text-xs font-mono text-gray-600">t = {tick}s</span>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {(['FIXED', 'DYNAMIC', 'JITTERED'] as Strategy[]).map((strat) => {
            const meta = strategyMeta[strat]
            const ttls = timelineTTLs[strat]
            const maxT = Math.max(...ttls)
            const expired = expiredCounts[strat]

            return (
              <div key={strat} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold text-${meta.color}-400`}>{meta.label}</span>
                  <span className={`text-[10px] font-mono ${expired > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                    {expired > 0 ? `${expired}/${KEY_COUNT} expired` : 'active'}
                  </span>
                </div>

                {ttls.map((t, i) => {
                  const isExpired = tick >= t
                  const remaining = Math.max(0, t - tick)
                  const pct = Math.max(0, (remaining / maxT) * 100)

                  return (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-[11px] text-gray-600 font-mono w-3">{i + 1}</span>
                      <div className="flex-1 h-4 bg-black/30 rounded overflow-hidden relative">
                        <motion.div
                          className={`h-full rounded ${isExpired ? 'bg-red-500/70' : `${meta.accent}/50`}`}
                          animate={{ width: isExpired ? '100%' : `${pct}%` }}
                          transition={{ duration: 0.4 }}
                        />
                        <span className={`absolute inset-0 flex items-center justify-center text-[11px] font-mono ${isExpired ? 'text-red-200' : 'text-white/70'}`}>
                          {isExpired ? 'EXPIRED' : `${remaining}s`}
                        </span>
                      </div>
                      {strat === 'DYNAMIC' && (
                        <span className={`text-[10px] w-3 h-3 rounded-full ${CATEGORY_COLORS[DYNAMIC_CATEGORIES[i]]}/40`} />
                      )}
                    </div>
                  )
                })}

                {/* Stampede indicator */}
                {strat === 'FIXED' && expired === KEY_COUNT && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, scale: [1, 1.05, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-[10px] text-red-400 font-bold text-center"
                  >
                    STAMPEDE RISKI!
                  </motion.p>
                )}
                {strat === 'JITTERED' && expired > 0 && expired < KEY_COUNT && (
                  <p className="text-[10px] text-green-400 text-center">
                    Kademeli expire — güvenli
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Strategy Selection + Cards */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Strategy buttons */}
          <div className="glass p-3 space-y-2">
            <div className="flex gap-2">
              {(['FIXED', 'DYNAMIC', 'JITTERED'] as Strategy[]).map((s) => {
                const meta = strategyMeta[s]
                return (
                  <button
                    key={s}
                    onClick={() => setStrategy(s)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      strategy === s
                        ? `bg-${meta.color}-600 text-white`
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {s}
                  </button>
                )
              })}
            </div>

            {/* Sliders */}
            <div>
              <label className="text-[11px] text-gray-500 block mb-1">Base TTL: {baseTTL}s</label>
              <input
                type="range" min={10} max={300} value={baseTTL}
                onChange={(e) => setBaseTTL(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>
            {strategy === 'JITTERED' && (
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Jitter Range: {jitterRange}s</label>
                <input
                  type="range" min={1} max={60} value={jitterRange}
                  onChange={(e) => setJitterRange(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>
            )}
          </div>

          {/* Detailed strategy card */}
          <motion.div
            key={strategy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`glass p-4 space-y-2 border border-${strategyMeta[strategy].color}-500/30`}
          >
            <h4 className={`text-sm font-bold text-${strategyMeta[strategy].color}-400`}>
              {strategyMeta[strategy].label}
            </h4>
            <p className="text-[11px] text-gray-300">{strategyMeta[strategy].desc}</p>
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <span className="text-[10px] text-gray-500 shrink-0">Kullanım:</span>
                <span className="text-[10px] text-gray-400">{strategyMeta[strategy].useCase}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-[10px] text-gray-500 shrink-0">Risk:</span>
                <span className={`text-[10px] ${strategy === 'JITTERED' ? 'text-green-400' : 'text-red-400'}`}>
                  {strategyMeta[strategy].risk}
                </span>
              </div>
            </div>
            <code className="block text-[10px] font-mono text-gray-400 bg-black/30 px-2 py-1.5 rounded">
              {strategyMeta[strategy].cmd}
            </code>
          </motion.div>

          {/* Dynamic TTL legend */}
          {strategy === 'DYNAMIC' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2"
            >
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <div key={cat} className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded">
                  <span className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[cat]}/60`} />
                  <span className="text-[10px] text-gray-400">{label}</span>
                  <span className="text-[10px] text-gray-600 font-mono">{DYNAMIC_TTLS[cat]}s</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Right: Batch Demo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DemoPanel
            title="Batch TTL Demo"
            description={`10 key'e ${strategy} strategy ile TTL ata`}
            onRun={() => ttlDemoApi.batchDemo(strategy, baseTTL, jitterRange, 10)}
            renderResult={(data) => {
              const d = data as { keys?: Array<{ key: string; ttlSeconds: number; category: string }> }
              if (!d?.keys) return null
              const ttls = d.keys.map((k) => k.ttlSeconds)
              const maxTTL = Math.max(...ttls)
              const minTTL = Math.min(...ttls)
              const avgTTL = Math.round(ttls.reduce((a, b) => a + b, 0) / ttls.length)
              const allSame = minTTL === maxTTL

              return (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-black/20 rounded p-2 text-center">
                      <p className="text-[11px] text-gray-500">Min</p>
                      <p className="text-sm font-bold font-mono text-white">{minTTL}s</p>
                    </div>
                    <div className="flex-1 bg-black/20 rounded p-2 text-center">
                      <p className="text-[11px] text-gray-500">Avg</p>
                      <p className="text-sm font-bold font-mono text-amber-400">{avgTTL}s</p>
                    </div>
                    <div className="flex-1 bg-black/20 rounded p-2 text-center">
                      <p className="text-[11px] text-gray-500">Max</p>
                      <p className="text-sm font-bold font-mono text-white">{maxTTL}s</p>
                    </div>
                    <div className="flex-1 bg-black/20 rounded p-2 text-center">
                      <p className="text-[11px] text-gray-500">Stampede</p>
                      <p className={`text-sm font-bold ${allSame ? 'text-red-400' : 'text-green-400'}`}>
                        {allSame ? 'Riskli' : 'Güvenli'}
                      </p>
                    </div>
                  </div>

                  {/* Bar chart */}
                  <div className="space-y-1">
                    {d.keys.map((k, i) => (
                      <div key={i} className="flex items-center gap-2 group">
                        <span className="text-[11px] text-gray-600 font-mono w-5">#{i + 1}</span>
                        <div className="flex-1 h-5 bg-black/30 rounded overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(k.ttlSeconds / maxTTL) * 100}%` }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                            className={`h-full rounded ${
                              strategy === 'FIXED' ? 'bg-cyan-500/60' :
                              strategy === 'DYNAMIC' ? `${CATEGORY_COLORS[k.category] || 'bg-gray-500'}/60` :
                              'bg-purple-500/60'
                            }`}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[11px] text-white/80 font-mono">
                            {k.ttlSeconds}s
                          </span>
                        </div>
                        {strategy === 'DYNAMIC' && (
                          <span className="text-[11px] text-gray-500 w-14 truncate">{k.category}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            }}
          />
        </motion.div>
      </div>
    </div>
  )
}
