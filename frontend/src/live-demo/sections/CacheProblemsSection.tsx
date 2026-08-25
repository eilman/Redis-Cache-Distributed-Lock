import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { problemApi } from '../../api/cacheApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import LogStream, { LogEntry } from '../shared/LogStream'
import ComparisonPanel from '../shared/ComparisonPanel'
import TrafficSimulator from '../visualizations/TrafficSimulator'
import RequestTimeline, { TimelineEntry } from '../visualizations/RequestTimeline'
import Tabs from '../../components/ui/Tabs'

export default function CacheProblemsSection() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()
  const hasInteracted = useRef(false)

  // --- Shared logs ---
  const [logs, setLogs] = useState<LogEntry[]>([])

  const pushLog = useCallback((action: string, result: string, type: LogEntry['type'], latencyMs?: number) => {
    setLogs(prev => [
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, result, type, latencyMs },
      ...prev,
    ])
  }, [])

  const markFirstInteraction = useCallback(() => {
    if (!hasInteracted.current) {
      hasInteracted.current = true
      markCompleted('cache-problems')
    }
  }, [markCompleted])

  // ================================================================
  // TAB 1: Thundering Herd / Cache Stampede
  // ================================================================

  const [stampedeConcurrent, setStampedeConcurrent] = useState(10)
  const [stampedeProductId, setStampedeProductId] = useState(42)
  const [stampedeUnprotectedLoading, setStampedeUnprotectedLoading] = useState(false)
  const [stampedeProtectedLoading, setStampedeProtectedLoading] = useState(false)
  const [stampedeCompareLoading, setStampedeCompareLoading] = useState(false)

  // Traffic simulator
  const [trafficMode, setTrafficMode] = useState<'unprotected' | 'protected'>('unprotected')
  const [trafficRunning, setTrafficRunning] = useState(false)

  // Timeline
  const [stampedeTimeline, setStampedeTimeline] = useState<TimelineEntry[]>([])

  // Comparison
  const [stampedeComparison, setStampedeComparison] = useState<{
    left: { label: string; value: string | number }[]
    right: { label: string; value: string | number }[]
  } | null>(null)

  const parseTimelineFromResponse = (data: unknown, prefix: string): TimelineEntry[] => {
    if (!data || !Array.isArray(data)) return []
    return data.slice(0, 15).map((item: Record<string, unknown>, i: number) => {
      const segments: TimelineEntry['segments'] = []
      const source = (item.source as string) || ''
      const latency = (item.latencyMs as number) || (item.totalMs as number) || 0

      if (source === 'cache' || item.cacheHit) {
        segments.push({ type: 'cache_check', widthPercent: 20, durationMs: Math.round(latency * 0.2) })
        segments.push({ type: 'cache_hit', widthPercent: 80, durationMs: Math.round(latency * 0.8) })
      } else {
        segments.push({ type: 'cache_check', widthPercent: 10, durationMs: Math.round(latency * 0.1) })
        if (item.waitedForLock || item.lockWait) {
          segments.push({ type: 'lock_wait', widthPercent: 30, durationMs: Math.round(latency * 0.3) })
          segments.push({ type: 'db_query', widthPercent: 40, durationMs: Math.round(latency * 0.4) })
          segments.push({ type: 'processing', widthPercent: 20, durationMs: Math.round(latency * 0.2) })
        } else {
          segments.push({ type: 'db_query', widthPercent: 60, durationMs: Math.round(latency * 0.6) })
          segments.push({ type: 'processing', widthPercent: 30, durationMs: Math.round(latency * 0.3) })
        }
      }

      return {
        label: `${prefix}-${i + 1}`,
        segments,
      }
    })
  }

  const handleStampedeUnprotected = async () => {
    setStampedeUnprotectedLoading(true)
    setTrafficMode('unprotected')
    setTrafficRunning(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      const res = await problemApi.stampede(stampedeProductId, stampedeConcurrent)
      const latency = Math.round(performance.now() - start)
      const data = res.data?.data || res.data

      incrementMetric('totalRequests', stampedeConcurrent)
      incrementMetric('cacheMisses', stampedeConcurrent)

      const timeline = parseTimelineFromResponse(
        Array.isArray(data) ? data : data?.results,
        'Req'
      )
      setStampedeTimeline(timeline)

      pushLog('STAMPEDE', `${stampedeConcurrent} istek => HEPSI DB'ye gitti!`, 'error', latency)
      addLog('cache-problems', 'error', `Stampede: ${stampedeConcurrent} concurrent DB sorgu`, latency)
    } catch (err) {
      pushLog('STAMPEDE', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('cache-problems', 'error', 'Stampede testi başarısız')
    } finally {
      setStampedeUnprotectedLoading(false)
      setTimeout(() => setTrafficRunning(false), 3000)
    }
  }

  const handleStampedeProtected = async () => {
    setStampedeProtectedLoading(true)
    setTrafficMode('protected')
    setTrafficRunning(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      const res = await problemApi.stampedeMitigated(stampedeProductId, stampedeConcurrent)
      const latency = Math.round(performance.now() - start)
      const data = res.data?.data || res.data

      incrementMetric('totalRequests', stampedeConcurrent)
      incrementMetric('cacheHits', stampedeConcurrent - 1)
      incrementMetric('cacheMisses', 1)

      const timeline = parseTimelineFromResponse(
        Array.isArray(data) ? data : data?.results,
        'Req'
      )
      setStampedeTimeline(timeline)

      pushLog('KORUMALI', `${stampedeConcurrent} istek => Sadece 1 DB sorgusu!`, 'success', latency)
      addLog('cache-problems', 'success', `Mitigated: 1 DB sorgu, ${stampedeConcurrent - 1} cache hit`, latency)
    } catch (err) {
      pushLog('KORUMALI', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('cache-problems', 'error', 'Korumali stampede testi başarısız')
    } finally {
      setStampedeProtectedLoading(false)
      setTimeout(() => setTrafficRunning(false), 3000)
    }
  }

  const handleStampedeCompare = async () => {
    setStampedeCompareLoading(true)
    markFirstInteraction()
    try {
      // Unprotected
      setTrafficMode('unprotected')
      setTrafficRunning(true)
      const startU = performance.now()
      const resU = await problemApi.stampede(stampedeProductId, stampedeConcurrent)
      const latencyU = Math.round(performance.now() - startU)

      // Protected
      setTrafficMode('protected')
      const startP = performance.now()
      const resP = await problemApi.stampedeMitigated(stampedeProductId, stampedeConcurrent)
      const latencyP = Math.round(performance.now() - startP)

      incrementMetric('totalRequests', stampedeConcurrent * 2)

      const dataU = resU.data?.data || resU.data
      const dataP = resP.data?.data || resP.data
      const dbQueriesU = dataU?.dbQueryCount ?? dataU?.dbQueries ?? stampedeConcurrent
      const dbQueriesP = dataP?.dbQueryCount ?? dataP?.dbQueries ?? 1

      setStampedeComparison({
        left: [
          { label: 'DB Sorgu', value: dbQueriesU },
          { label: 'Toplam Süre', value: `${latencyU}ms` },
          { label: 'Concurrent İstek', value: stampedeConcurrent },
          { label: 'DB Yuku', value: 'Kritik' },
        ],
        right: [
          { label: 'DB Sorgu', value: dbQueriesP },
          { label: 'Toplam Süre', value: `${latencyP}ms` },
          { label: 'Concurrent İstek', value: stampedeConcurrent },
          { label: 'DB Yuku', value: 'Minimal' },
        ],
      })

      pushLog('KARŞILAŞTIR', `Korumasız: ${latencyU}ms vs Korumali: ${latencyP}ms`, 'info')
      addLog('cache-problems', 'info', `Karşılaştırma: ${latencyU}ms vs ${latencyP}ms`)
    } catch (err) {
      pushLog('KARŞILAŞTIR', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('cache-problems', 'error', 'Karşılaştırma başarısız')
    } finally {
      setStampedeCompareLoading(false)
      setTimeout(() => setTrafficRunning(false), 3000)
    }
  }

  // ================================================================
  // TAB 2: Cache Penetration
  // ================================================================

  const [penKey, setPenKey] = useState('product:99999')
  const [penCount, setPenCount] = useState(5)
  const [penNullCache, setPenNullCache] = useState(false)
  const [penLoading, setPenLoading] = useState(false)
  const [penComparison, setPenComparison] = useState<{
    left: { label: string; value: string | number }[]
    right: { label: string; value: string | number }[]
  } | null>(null)

  const handlePenetration = async () => {
    setPenLoading(true)
    markFirstInteraction()
    try {
      const start = performance.now()
      const res = await problemApi.penetrationMulti(penKey, penCount, penNullCache)
      const latency = Math.round(performance.now() - start)
      const data = res.data?.data || res.data

      incrementMetric('totalRequests', penCount)
      incrementMetric('cacheMisses', penNullCache ? 1 : penCount)

      const dbQueries = data?.dbQueryCount ?? data?.dbQueries ?? (penNullCache ? 1 : penCount)
      const cacheHits = data?.cacheHitCount ?? data?.cacheHits ?? (penNullCache ? penCount - 1 : 0)

      setPenComparison({
        left: [
          { label: 'Strateji', value: 'Null Cache KAPALI' },
          { label: 'DB Sorgu', value: penNullCache ? '?' : dbQueries },
          { label: 'Cache Hit', value: penNullCache ? '?' : 0 },
          { label: 'Risk', value: 'Her istek DB\'ye gider' },
        ],
        right: [
          { label: 'Strateji', value: 'Null Cache AÇIK' },
          { label: 'DB Sorgu', value: penNullCache ? dbQueries : '?' },
          { label: 'Cache Hit', value: penNullCache ? cacheHits : '?' },
          { label: 'Risk', value: 'Sadece ilk istek DB\'ye' },
        ],
      })

      if (penNullCache) {
        pushLog('PENETRATION', `${penCount} istek, Null Cache AÇIK => DB: ${dbQueries}, Cache Hit: ${cacheHits}`, 'success', latency)
        addLog('cache-problems', 'success', `Penetration (null cache): DB=${dbQueries}, Hits=${cacheHits}`, latency)
      } else {
        pushLog('PENETRATION', `${penCount} istek, Null Cache KAPALI => Her istek DB'ye!`, 'error', latency)
        addLog('cache-problems', 'miss', `Penetration: ${dbQueries} DB sorgu, 0 cache hit`, latency)
      }
    } catch (err) {
      pushLog('PENETRATION', `HATA: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`, 'error')
      addLog('cache-problems', 'error', 'Penetration testi başarısız')
    } finally {
      setPenLoading(false)
    }
  }

  // ================================================================
  // RENDER
  // ================================================================

  const stampedeTab = (
    <div className="space-y-4">
      {/* Scenario Card */}
      <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <h3 className="text-sm font-bold text-red-400">Thundering Herd / Cache Stampede</h3>
            <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
              Black Friday saat 00:00. RTX 5090 için <span className="text-amber-400 font-bold">10.000 kisinin</span> beklediğini düşünün...
              Cache TTL doldu, tüm istekler ayni anda DB'ye gidiyor. Sonuc: DB çöküyor!
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-3">
        {/* Concurrent slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">Eşanlı İstek Sayısı</label>
            <span className="text-xs font-mono text-red-400 font-bold">{stampedeConcurrent}</span>
          </div>
          <input
            type="range"
            min={2}
            max={50}
            step={1}
            value={stampedeConcurrent}
            onChange={e => setStampedeConcurrent(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-red-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>2</span>
            <span>25</span>
            <span>50</span>
          </div>
        </div>

        {/* Product ID */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Ürün ID</label>
          <input
            type="number"
            value={stampedeProductId}
            onChange={e => setStampedeProductId(Number(e.target.value))}
            className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm text-gray-200 font-mono focus:outline-none focus:border-red-500/50"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-wrap">
          <ActionButton
            onClick={handleStampedeUnprotected}
            loading={stampedeUnprotectedLoading}
            variant="danger"
            size="sm"
          >
            KORUMASIZ
          </ActionButton>
          <ActionButton
            onClick={handleStampedeProtected}
            loading={stampedeProtectedLoading}
            variant="success"
            size="sm"
          >
            KORUMALI
          </ActionButton>
          <ActionButton
            onClick={handleStampedeCompare}
            loading={stampedeCompareLoading}
            variant="warning"
            size="sm"
          >
            KARŞILAŞTIR
          </ActionButton>
        </div>
      </div>

      {/* Traffic Simulator */}
      <TrafficSimulator
        requestCount={stampedeConcurrent}
        mode={trafficMode}
        running={trafficRunning}
      />

      {/* Request Timeline */}
      {stampedeTimeline.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <RequestTimeline
            entries={stampedeTimeline}
            title="İstek Zaman Çizelgesi"
          />
        </motion.div>
      )}

      {/* Comparison */}
      {stampedeComparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ComparisonPanel
            leftTitle="Korumasız"
            rightTitle="Korumali (Lock)"
            leftMetrics={stampedeComparison.left}
            rightMetrics={stampedeComparison.right}
          />
        </motion.div>
      )}
    </div>
  )

  const penetrationTab = (
    <div className="space-y-4">
      {/* Scenario Card */}
      <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <span className="text-2xl">👻</span>
          <div>
            <h3 className="text-sm font-bold text-amber-400">Cache Penetration</h3>
            <p className="text-[12px] text-gray-400 mt-1 leading-relaxed">
              Kullanıcılar var olmayan bir ürünu ariyor: <span className="font-mono text-amber-400">product:99999</span>.
              Cache'de yok, DB'de de yok. Her seferinde bos yere DB sorgusu yapılıyor!
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-3">
        {/* Key */}
        <div>
          <label className="text-[10px] text-gray-500 uppercase tracking-wide">Key</label>
          <input
            type="text"
            value={penKey}
            onChange={e => setPenKey(e.target.value)}
            className="w-full mt-1 px-3 py-1.5 rounded-lg bg-black/30 border border-white/10 text-sm text-gray-200 font-mono focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Request count slider */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wide">İstek Sayısı</label>
            <span className="text-xs font-mono text-amber-400 font-bold">{penCount}</span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            step={1}
            value={penCount}
            onChange={e => setPenCount(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none bg-gray-700 accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[9px] text-gray-600 mt-0.5">
            <span>1</span>
            <span>10</span>
            <span>20</span>
          </div>
        </div>

        {/* Null Cache Toggle */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-gray-400">Null Cache</span>
          <button
            onClick={() => setPenNullCache(prev => !prev)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              penNullCache ? 'bg-green-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                penNullCache ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-[10px] font-bold ${penNullCache ? 'text-green-400' : 'text-gray-500'}`}>
            {penNullCache ? 'AÇIK' : 'KAPALI'}
          </span>
        </div>

        {/* Run Button */}
        <ActionButton
          onClick={handlePenetration}
          loading={penLoading}
          variant={penNullCache ? 'success' : 'danger'}
        >
          Çalıştır
        </ActionButton>
      </div>

      {/* Comparison */}
      {penComparison && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <ComparisonPanel
            leftTitle="Null Cache KAPALI"
            rightTitle="Null Cache AÇIK"
            leftMetrics={penComparison.left}
            rightMetrics={penComparison.right}
          />
        </motion.div>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <Tabs
        tabs={[
          { label: 'Thundering Herd', content: stampedeTab },
          { label: 'Cache Penetration', content: penetrationTab },
        ]}
      />

      {/* Shared Log Stream */}
      <LogStream
        logs={logs}
        maxHeight={200}
        onClear={() => setLogs([])}
      />
    </motion.div>
  )
}
