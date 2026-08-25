import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cacheApi, ttlDemoApi } from '../../api/cacheApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import StatusBadge from '../shared/StatusBadge'
import LogStream, { LogEntry } from '../shared/LogStream'
import MetricTicker from '../shared/MetricTicker'
import ScenarioCard from '../shared/ScenarioCard'
import ComparisonPanel from '../shared/ComparisonPanel'
import MiniCodeBlock from '../shared/MiniCodeBlock'
import { ttlScenarios } from '../data/mockData'

type Strategy = 'fixed' | 'dynamic' | 'jittered'

export default function TtlInvalidationSection() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()
  const hasInteracted = useRef(false)

  // --- Scenario selection ---
  const [activeScenario, setActiveScenario] = useState<number | null>(null)

  // --- Key/Value/TTL inputs ---
  const [key, setKey] = useState('product:42:price')
  const [value, setValue] = useState('59999')
  const [ttl, setTtl] = useState(60)

  // --- Timer state ---
  const [countdown, setCountdown] = useState<number | null>(null)
  const [totalTtl, setTotalTtl] = useState(60)
  const [expired, setExpired] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // --- Cache state ---
  const [cacheState, setCacheState] = useState<'HIT' | 'MISS' | 'EXPIRED' | 'OK' | 'ERROR'>('MISS')

  // --- Loading states ---
  const [writeLoading, setWriteLoading] = useState(false)
  const [readLoading, setReadLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // --- Strategy state ---
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null)
  const [strategyLoading, setStrategyLoading] = useState(false)
  const [strategyCode, setStrategyCode] = useState('')
  const [strategyComparison, setStrategyComparison] = useState<{
    left: { label: string; value: string | number }[]
    right: { label: string; value: string | number }[]
  } | null>(null)

  // --- Logs ---
  const [logs, setLogs] = useState<LogEntry[]>([])

  // --- Metrics ---
  const [writeCount, setWriteCount] = useState(0)
  const [readCount, setReadCount] = useState(0)

  const pushLog = useCallback((action: string, result: string, type: LogEntry['type'], latencyMs?: number) => {
    setLogs(prev => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, result, type, latencyMs },
      ...prev,
    ])
  }, [])

  const markFirstInteraction = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true
      markCompleted('ttl-invalidation')
    }
  }, [markCompleted])

  // --- Scenario click ---
  const handleScenarioClick = (index: number) => {
    setActiveScenario(index)
    setTtl(ttlScenarios[index].ttl)
    pushLog('SENARYO', `${ttlScenarios[index].label} seçildi (TTL: ${ttlScenarios[index].ttl}s)`, 'info')
  }

  // --- Countdown logic ---
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startCountdown = (seconds: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    setExpired(false)
    setTotalTtl(seconds)
    setCountdown(seconds)

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          timerRef.current = null
          setExpired(true)
          setCacheState('EXPIRED')
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // --- Circle timer calculations ---
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const progress = countdown !== null && totalTtl > 0 ? countdown / totalTtl : 0
  const strokeDashoffset = circumference * (1 - progress)

  const getTimerColor = () => {
    if (expired || countdown === 0) return '#ef4444'
    if (progress > 0.6) return '#22c55e'
    if (progress > 0.25) return '#f59e0b'
    return '#ef4444'
  }

  // --- Handlers ---
  const handleWrite = async () => {
    setWriteLoading(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      await cacheApi.setValue(key, value, ttl)
      const latency = Math.round(performance.now() - start)

      setCacheState('OK')
      setWriteCount(prev => prev + 1)
      incrementMetric('totalRequests')

      startCountdown(ttl)
      pushLog('SET', `${key} = ${value} (TTL: ${ttl}s)`, 'success', latency)
      addLog('ttl-invalidation', 'success', `SET ${key} = ${value} (TTL: ${ttl}s)`, latency)
    } catch (err) {
      setCacheState('ERROR')
      pushLog('SET', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('ttl-invalidation', 'error', `SET başarısız: ${key}`)
    } finally {
      setWriteLoading(false)
    }
  }

  const handleRead = async () => {
    setReadLoading(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      const res = await cacheApi.getValue(key)
      const latency = Math.round(performance.now() - start)
      const data = res.data

      setReadCount(prev => prev + 1)
      incrementMetric('totalRequests')

      if (data?.value !== undefined && data.value !== null) {
        setCacheState('HIT')
        incrementMetric('cacheHits')
        pushLog('GET', `${key} => ${data.value} (TTL: ${data.ttl ?? '?'}s)`, 'hit', latency)
        addLog('ttl-invalidation', 'hit', `GET ${key} => ${data.value}`, latency)
      } else {
        setCacheState('MISS')
        incrementMetric('cacheMisses')
        pushLog('GET', `${key} => MISS (key bulunamadı)`, 'miss', latency)
        addLog('ttl-invalidation', 'miss', `GET ${key} => MISS`, latency)
      }
    } catch (err) {
      setCacheState('ERROR')
      pushLog('GET', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('ttl-invalidation', 'error', `GET başarısız: ${key}`)
    } finally {
      setReadLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      await cacheApi.deleteKey(key)
      const latency = Math.round(performance.now() - start)

      setCacheState('MISS')
      if (timerRef.current) clearInterval(timerRef.current)
      setCountdown(null)
      setExpired(false)
      incrementMetric('totalRequests')

      pushLog('DEL', `${key} silindi`, 'info', latency)
      addLog('ttl-invalidation', 'info', `DEL ${key}`, latency)
    } catch (err) {
      pushLog('DEL', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('ttl-invalidation', 'error', `DEL başarısız: ${key}`)
    } finally {
      setDeleteLoading(false)
    }
  }

  // --- Strategy handlers ---
  const handleStrategy = async (strategy: Strategy) => {
    setActiveStrategy(strategy)
    setStrategyLoading(true)
    markFirstInteraction()

    try {
      const start = performance.now()
      let res
      if (strategy === 'fixed') {
        res = await ttlDemoApi.fixed(42, ttl)
        setStrategyCode(`SET product:42:price 59999 EX ${ttl}\n// Sabit TTL: Her key ayni sure sonra expire olur`)
      } else if (strategy === 'dynamic') {
        res = await ttlDemoApi.dynamic(42)
        setStrategyCode(`SET product:42:price 59999 EX <dynamic>\n// Populerlige gore TTL:\n// Cok popüler => kisa TTL (hep guncel)\n// Az popüler => uzun TTL (az DB yukü)`)
      } else {
        res = await ttlDemoApi.jittered(42, ttl, 15)
        setStrategyCode(`SET product:42:price 59999 EX ${ttl} +/- jitter\n// Jitter: TTL'e rastgele sapma ekler\n// Thundering Herd'u onler`)
      }
      const latency = Math.round(performance.now() - start)
      const data = res.data

      incrementMetric('totalRequests')
      pushLog('TTL', `${strategy.toUpperCase()} strateji uygulandi`, 'success', latency)
      addLog('ttl-invalidation', 'success', `TTL ${strategy} strateji: ${data?.ttl ?? ttl}s`, latency)

      setStrategyComparison({
        left: [
          { label: 'Strateji', value: 'Sabit TTL' },
          { label: 'TTL', value: `${ttl}s` },
          { label: 'Stampede Riski', value: 'Yüksek' },
          { label: 'Staleness', value: 'TTL kadar' },
        ],
        right: [
          { label: 'Strateji', value: strategy === 'dynamic' ? 'Dinamik TTL' : 'Jittered TTL' },
          { label: 'TTL', value: data?.ttl ? `${data.ttl}s` : `${ttl} +/- 15s` },
          { label: 'Stampede Riski', value: strategy === 'jittered' ? 'Düşük' : 'Orta' },
          { label: 'Staleness', value: strategy === 'dynamic' ? 'Adaptif' : 'Dağıtılmış' },
        ],
      })
    } catch (err) {
      pushLog('TTL', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('ttl-invalidation', 'error', `TTL ${strategy} başarısız`)
    } finally {
      setStrategyLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      {/* ---- 1. Scenario Description Card ---- */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚡</span>
          <div>
            <h3 className="text-sm font-bold text-amber-400">Flash Sale Senaryosu</h3>
            <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
              Flash Sale başladı! iPhone fiyatı <span className="text-red-400 line-through">74.999₺</span>'den{' '}
              <span className="text-green-400 font-bold">59.999₺</span>'ye düştü.
              Eski fiyat ne kadar cache'de kalmalı? Yanlis TTL = müşteri yanlis fiyat görür!
            </p>
          </div>
        </div>
      </div>

      {/* ---- 2. Scenario Cards ---- */}
      <div>
        <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">
          TTL Senaryoları
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {ttlScenarios.map((s, i) => (
            <ScenarioCard
              key={s.label}
              title={s.label}
              description={`${s.ttl}s - ${s.desc}`}
              icon={s.icon}
              color={s.color}
              isActive={activeScenario === i}
              onClick={() => handleScenarioClick(i)}
            />
          ))}
        </div>
      </div>

      {/* ---- 3. Interactive TTL Demo (2 columns) ---- */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Input Panel */}
        <div className="p-4 rounded-2xl border border-cyan-500/20 bg-white/[0.02] backdrop-blur-md space-y-3">
          <h4 className="text-xs text-gray-500 tracking-wide font-semibold">CACHE İŞLEMLERİ</h4>

          {/* Key */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Key</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* Value */}
          <div>
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Value</label>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm text-gray-200 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          {/* TTL Slider */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wide">TTL</label>
              <span className="text-xs font-mono text-cyan-400 font-bold">{ttl}s</span>
            </div>
            <input
              type="range"
              min={1}
              max={300}
              step={1}
              value={ttl}
              onChange={e => setTtl(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
              <span>1s</span>
              <span>150s</span>
              <span>300s</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <ActionButton onClick={handleWrite} loading={writeLoading} variant="success" size="sm">
              Yaz
            </ActionButton>
            <ActionButton onClick={handleRead} loading={readLoading} variant="primary" size="sm">
              Oku
            </ActionButton>
            <ActionButton onClick={handleDelete} loading={deleteLoading} variant="danger" size="sm">
              Sil
            </ActionButton>
          </div>
        </div>

        {/* Right: Circular Countdown Timer */}
        <div className="p-4 rounded-2xl border border-cyan-500/20 bg-white/[0.02] backdrop-blur-md flex flex-col items-center justify-center gap-3">
          <h4 className="text-xs text-gray-500 tracking-wide font-semibold">TTL GERİ SAYIM</h4>

          <div className="relative w-44 h-44">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <motion.circle
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={getTimerColor()}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                animate={{ strokeDashoffset, stroke: getTimerColor() }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </svg>

            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <AnimatePresence mode="wait">
                {expired ? (
                  <motion.div
                    key="expired"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <motion.span
                      className="text-lg font-black text-red-500"
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                    >
                      EXPIRED
                    </motion.span>
                  </motion.div>
                ) : countdown !== null ? (
                  <motion.span
                    key={countdown}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-4xl font-black font-mono"
                    style={{ color: getTimerColor() }}
                  >
                    {countdown}
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-gray-600"
                  >
                    Bekleniyor...
                  </motion.span>
                )}
              </AnimatePresence>
              {countdown !== null && !expired && (
                <span className="text-[10px] text-gray-500 mt-1">saniye kaldı</span>
              )}
            </div>
          </div>

          <StatusBadge type={cacheState} />
        </div>
      </div>

      {/* ---- Metrics ---- */}
      <div className="grid grid-cols-2 gap-3">
        <MetricTicker value={writeCount} label="Yazma İşlemi" color="text-green-400" size="sm" />
        <MetricTicker value={readCount} label="Okuma İşlemi" color="text-cyan-400" size="sm" />
      </div>

      {/* ---- 4. Strategy Comparison ---- */}
      <div className="p-4 rounded-2xl border border-purple-500/20 bg-white/[0.02] backdrop-blur-md space-y-3">
        <h4 className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
          TTL Stratejileri
        </h4>
        <p className="text-[11px] text-gray-500">
          Farklı TTL stratejilerini test edin ve sonuçlarıni karşılaştırın.
        </p>

        <div className="flex gap-2">
          <ActionButton
            onClick={() => handleStrategy('fixed')}
            loading={strategyLoading && activeStrategy === 'fixed'}
            variant={activeStrategy === 'fixed' ? 'warning' : 'primary'}
            size="sm"
          >
            Fixed TTL
          </ActionButton>
          <ActionButton
            onClick={() => handleStrategy('dynamic')}
            loading={strategyLoading && activeStrategy === 'dynamic'}
            variant={activeStrategy === 'dynamic' ? 'warning' : 'primary'}
            size="sm"
          >
            Dynamic TTL
          </ActionButton>
          <ActionButton
            onClick={() => handleStrategy('jittered')}
            loading={strategyLoading && activeStrategy === 'jittered'}
            variant={activeStrategy === 'jittered' ? 'warning' : 'primary'}
            size="sm"
          >
            Jittered TTL
          </ActionButton>
        </div>

        {strategyCode && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <MiniCodeBlock code={strategyCode} language="redis" />
          </motion.div>
        )}

        {strategyComparison && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <ComparisonPanel
              leftTitle="Sabit TTL"
              rightTitle={activeStrategy === 'dynamic' ? 'Dinamik TTL' : 'Jittered TTL'}
              leftMetrics={strategyComparison.left}
              rightMetrics={strategyComparison.right}
            />
          </motion.div>
        )}
      </div>

      {/* ---- 5. Log Stream ---- */}
      <LogStream
        logs={logs}
        maxHeight={180}
        onClear={() => setLogs([])}
      />
    </motion.div>
  )
}
