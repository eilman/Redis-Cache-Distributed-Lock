import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import DemoPanel from '../../components/demo/DemoPanel'
import { cacheApi } from '../../api/cacheApi'

const scenarios = [
  { key: 'product:42:price', value: '999 TL', ttl: 15, label: 'Ürün Fiyatı (kısa TTL)' },
  { key: 'session:user:1001', value: '{"role":"admin"}', ttl: 60, label: 'Kullanıcı Session' },
  { key: 'exchange:usd-try', value: '32.50', ttl: 10, label: 'Döviz Kuru (çok kısa TTL)' },
]

export default function TTLDemoSlide() {
  const [key, setKey] = useState('product:42:price')
  const [value, setValue] = useState('999 TL')
  const [ttl, setTtl] = useState(15)

  // TTL countdown state
  const [countdown, setCountdown] = useState<number | null>(null)
  const [totalTtl, setTotalTtl] = useState(0)
  const [timerStatus, setTimerStatus] = useState<'idle' | 'running' | 'expired' | 'deleted'>('idle')

  useEffect(() => {
    if (timerStatus !== 'running' || countdown === null) return
    if (countdown <= 0) {
      setTimerStatus('expired')
      return
    }
    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null ? prev - 1 : null))
    }, 1000)
    return () => clearInterval(timer)
  }, [timerStatus, countdown])

  const startTimer = useCallback(() => {
    setTotalTtl(ttl)
    setCountdown(ttl)
    setTimerStatus('running')
  }, [ttl])

  const stopTimer = useCallback(() => {
    setCountdown(null)
    setTimerStatus('deleted')
  }, [])

  const applyScenario = (s: typeof scenarios[0]) => {
    setKey(s.key)
    setValue(s.value)
    setTtl(s.ttl)
    setTimerStatus('idle')
    setCountdown(null)
  }

  const timerPercentage = totalTtl > 0 && countdown !== null ? (countdown / totalTtl) * 100 : 0
  const timerColor = countdown !== null && countdown > totalTtl * 0.5
    ? '#22c55e'
    : countdown !== null && countdown > totalTtl * 0.2
      ? '#f59e0b'
      : '#ef4444'

  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Canlı Demo: TTL & Invalidation
      </motion.h2>

      {/* Senaryo açıklaması */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Deneyin:</span> Bir key yazın (SET), TTL dolmadan okuyun (GET → veri gelir),
          TTL dolduktan sonra tekrar okuyun (GET → nil). Veya TTL dolmadan <span className="text-red-400">DEL</span> ile manuel invalidation <span className="text-gray-500">(cache'teki veriyi geçersiz kılma/silme)</span> yapın.
        </p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        {/* Hazır senaryolar */}
        <div className="flex gap-2 mb-3">
          {scenarios.map((s) => (
            <button
              key={s.key}
              onClick={() => applyScenario(s)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                key === s.key
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Input alanları */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Key</label>
            <input
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">Value</label>
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 mb-1 block">TTL (saniye)</label>
            <input
              type="number"
              value={ttl}
              onChange={e => setTtl(Number(e.target.value))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono"
            />
          </div>
        </div>

        {/* Demo panelleri + TTL Timer */}
        <div className="grid grid-cols-4 gap-3">
          {/* TTL Countdown Timer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass p-4 flex flex-col items-center justify-center space-y-2"
          >
            <p className="text-[11px] text-gray-500 uppercase tracking-wide font-semibold">TTL Countdown</p>

            {/* Circular progress */}
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                {timerStatus === 'running' && countdown !== null && (
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={timerColor}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 42 * (1 - timerPercentage / 100),
                      stroke: timerColor,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {timerStatus === 'idle' && (
                  <span className="text-xs text-gray-600">Bekliyor</span>
                )}
                {timerStatus === 'running' && (
                  <>
                    <span className="text-2xl font-bold font-mono" style={{ color: timerColor }}>{countdown}</span>
                    <span className="text-[10px] text-gray-500">saniye</span>
                  </>
                )}
                {timerStatus === 'expired' && (
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-[10px] font-bold text-red-400"
                  >
                    EXPIRED
                  </motion.span>
                )}
                {timerStatus === 'deleted' && (
                  <span className="text-[10px] font-bold text-amber-400">DEL</span>
                )}
              </div>
            </div>

            {/* Status bar */}
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <motion.div
                className="h-1.5 rounded-full"
                style={{ backgroundColor: timerStatus === 'running' ? timerColor : timerStatus === 'expired' ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                animate={{ width: timerStatus === 'running' ? `${timerPercentage}%` : timerStatus === 'expired' ? '0%' : '100%' }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <p className="text-[10px] text-gray-600 text-center">
              {timerStatus === 'idle' && 'SET yapınca başlar'}
              {timerStatus === 'running' && `${key.split(':').pop()} aktif`}
              {timerStatus === 'expired' && 'Key otomatik silindi'}
              {timerStatus === 'deleted' && 'Manuel invalidation'}
            </p>
          </motion.div>

          {/* SET / GET / DEL */}
          <DemoPanel
            title="SET — Yaz"
            description={`SET ${key} EX ${ttl}`}
            onRun={async () => {
              const res = await cacheApi.setValue(key, value, ttl)
              startTimer()
              return res
            }}
          />

          <DemoPanel
            title="GET — Oku"
            description={`GET ${key}`}
            onRun={() => cacheApi.getValue(key)}
            renderResult={(data) => (
              <div className="text-sm">
                <span className={data ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
                  {data ? String(data) : '(nil)'}
                </span>
              </div>
            )}
          />

          <DemoPanel
            title="DEL — Sil"
            description={`DEL ${key}`}
            onRun={async () => {
              const res = await cacheApi.deleteKey(key)
              stopTimer()
              return res
            }}
          />
        </div>

        {/* Adım rehberi */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 grid grid-cols-3 gap-3 text-center"
        >
          <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-2">
            <p className="text-[11px] text-green-400 font-semibold">1. SET ile yazın</p>
            <p className="text-[10px] text-gray-500">Timer başlar, TTL geri sayar</p>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2">
            <p className="text-[11px] text-amber-400 font-semibold">2. GET ile okuyun</p>
            <p className="text-[10px] text-gray-500">TTL içinde → veri, sonra → nil</p>
          </div>
          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-2">
            <p className="text-[11px] text-red-400 font-semibold">3. DEL ile silin</p>
            <p className="text-[10px] text-gray-500">TTL beklemeden invalidation</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
