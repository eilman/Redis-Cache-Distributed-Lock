import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { metricsApi } from '../../api/cacheApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import LogStream, { LogEntry } from '../shared/LogStream'
import MetricTicker from '../shared/MetricTicker'
import PerformanceGauge from '../visualizations/PerformanceGauge'
import HitMissChart from '../../components/metrics/HitMissChart'
import LatencyChart from '../../components/metrics/LatencyChart'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

interface SnapshotData {
  hitCount: number
  missCount: number
  hitRate: number
  avgLatencyMs: number
}

interface PrometheusData {
  p50: number
  p95: number
  p99: number
  max: number
  totalOperations: number
}

interface LatencyPoint {
  timestamp: number
  latencyMs: number
  type: string
}

export default function MonitoringSection() {
  const { addLog, markCompleted } = useLiveDemo()

  const [snapshot, setSnapshot] = useState<SnapshotData>({ hitCount: 0, missCount: 0, hitRate: 0, avgLatencyMs: 0 })
  const [prometheus, setPrometheus] = useState<PrometheusData | null>(null)
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [initialLoaded, setInitialLoaded] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const pushLog = useCallback(
    (action: string, result: string, type: LogEntry['type'], latencyMs?: number) => {
      setLogs((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          action,
          result,
          type,
          latencyMs,
        },
      ])
    },
    [],
  )

  /* ---- Fetch all data ---- */
  const fetchAllData = useCallback(async () => {
    setLoading(true)
    const start = performance.now()

    try {
      // Fetch snapshot
      const snapshotRes = await metricsApi.snapshot()
      const sd = snapshotRes.data
      const newSnapshot: SnapshotData = {
        hitCount: sd?.hitCount ?? sd?.hits ?? 0,
        missCount: sd?.missCount ?? sd?.misses ?? 0,
        hitRate: sd?.hitRate ?? sd?.hitRatio ?? 0,
        avgLatencyMs: sd?.avgLatencyMs ?? sd?.averageLatency ?? 0,
      }
      setSnapshot(newSnapshot)

      const ms = Math.round(performance.now() - start)
      pushLog('SNAPSHOT', `Hit: ${newSnapshot.hitCount}, Miss: ${newSnapshot.missCount}, Rate: ${newSnapshot.hitRate.toFixed(1)}%`, 'info', ms)
      addLog('monitoring', 'info', `Metrik snapshot alındı (${ms}ms)`, ms)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('SNAPSHOT', `HATA: ${msg}`, 'error')
    }

    try {
      // Fetch latency history
      const historyRes = await metricsApi.history(60)
      const historyData = historyRes.data
      const points: LatencyPoint[] = Array.isArray(historyData)
        ? historyData.map((d: Record<string, unknown>) => ({
            timestamp: (d.timestamp as number) ?? Date.now(),
            latencyMs: (d.latencyMs as number) ?? (d.avgLatencyMs as number) ?? (d.p50 as number) ?? 0,
            type: (d.type as string) ?? 'avg',
          }))
        : []
      setLatencyHistory(points)
    } catch {
      // Latency history may not be available
    }

    try {
      // Fetch prometheus summary
      const promRes = await metricsApi.prometheusSummary()
      const pd = promRes.data
      setPrometheus({
        p50: pd?.p50 ?? pd?.percentiles?.p50 ?? 0,
        p95: pd?.p95 ?? pd?.percentiles?.p95 ?? 0,
        p99: pd?.p99 ?? pd?.percentiles?.p99 ?? 0,
        max: pd?.max ?? pd?.percentiles?.max ?? 0,
        totalOperations: pd?.totalOperations ?? pd?.total ?? 0,
      })
    } catch {
      // Prometheus data may not be available
    }

    setLoading(false)

    if (!initialLoaded) {
      setInitialLoaded(true)
      markCompleted('monitoring')
    }
  }, [addLog, markCompleted, pushLog, initialLoaded])

  /* ---- Initial load ---- */
  useEffect(() => {
    fetchAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ---- Auto-refresh ---- */
  useEffect(() => {
    if (autoRefresh) {
      setCountdown(5)
      intervalRef.current = setInterval(() => {
        fetchAllData()
        setCountdown(5)
      }, 5000)
      countdownRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 5 : prev - 1))
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      setCountdown(5)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [autoRefresh, fetchAllData])

  /* ---- Hit rate color ---- */
  const hitRateColor = snapshot.hitRate > 90 ? 'text-green-400' : snapshot.hitRate > 70 ? 'text-amber-400' : 'text-red-400'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Scenario Card */}
      <motion.div
        variants={item}
        className="glass p-4 border border-blue-500/20 bg-blue-500/5 rounded-xl"
      >
        <h3 className="text-sm font-bold text-blue-400 mb-1">Senaryo: Black Friday İzleme</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Black Friday devam ediyor. <span className="text-blue-300 font-semibold">Ops ekibi</span> Redis
          performansini <span className="text-amber-400 font-semibold">canlı</span> izliyor. Hit rate
          düşüyor mu? Latency artiyor mu?
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricTicker
          value={snapshot.hitRate}
          label="Cache Hit Rate"
          suffix="%"
          color={hitRateColor}
          decimals={1}
        />
        <MetricTicker
          value={snapshot.hitCount}
          label="Toplam Hit"
          color="text-green-400"
        />
        <MetricTicker
          value={snapshot.missCount}
          label="Toplam Miss"
          color="text-amber-400"
        />
        <MetricTicker
          value={snapshot.avgLatencyMs}
          label="Ort. Latency"
          suffix="ms"
          color="text-cyan-400"
          decimals={1}
        />
      </motion.div>

      {/* Performance Gauges */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        <div className="glass p-4 rounded-xl">
          <PerformanceGauge
            value={snapshot.hitRate}
            max={100}
            label="Hit Rate"
            suffix="%"
          />
        </div>
        <div className="glass p-4 rounded-xl">
          <PerformanceGauge
            value={snapshot.avgLatencyMs}
            max={50}
            label="Latency"
            suffix="ms"
            thresholds={{ red: 80, yellow: 40 }}
          />
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Hit/Miss Pie Chart */}
        <div className="glass p-4 rounded-xl">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Hit / Miss Dağılımı</h4>
          <HitMissChart hits={snapshot.hitCount} misses={snapshot.missCount} />
        </div>

        {/* Latency Area Chart */}
        <div className="glass p-4 rounded-xl">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">Latency Geçmişi</h4>
          <LatencyChart data={latencyHistory} />
        </div>
      </motion.div>

      {/* Prometheus Panel */}
      {prometheus && (
        <motion.div variants={item} className="glass p-4 rounded-xl space-y-3">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Prometheus Özeti
          </h4>

          {/* Percentile Table */}
          <div className="overflow-hidden rounded-lg border border-gray-700/40">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-white/[0.03]">
                  <th className="px-3 py-1.5 text-left text-gray-500 font-semibold">Percentile</th>
                  <th className="px-3 py-1.5 text-right text-gray-500 font-semibold">Latency (ms)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-800">
                  <td className="px-3 py-1.5 text-gray-400">p50</td>
                  <td className="px-3 py-1.5 text-right font-mono text-green-400">{prometheus.p50.toFixed(1)}</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="px-3 py-1.5 text-gray-400">p95</td>
                  <td className="px-3 py-1.5 text-right font-mono text-amber-400">{prometheus.p95.toFixed(1)}</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="px-3 py-1.5 text-gray-400">p99</td>
                  <td className="px-3 py-1.5 text-right font-mono text-orange-400">{prometheus.p99.toFixed(1)}</td>
                </tr>
                <tr className="border-t border-gray-800">
                  <td className="px-3 py-1.5 text-gray-400">Max</td>
                  <td className="px-3 py-1.5 text-right font-mono text-red-400">{prometheus.max.toFixed(1)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Total Operations */}
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">Toplam İşlem</span>
            <span className="text-sm font-bold font-mono text-cyan-400">{prometheus.totalOperations.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <motion.div variants={item} className="flex items-center gap-3 flex-wrap">
        <ActionButton
          variant="primary"
          onClick={fetchAllData}
          loading={loading}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          }
        >
          Yenile
        </ActionButton>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
            autoRefresh
              ? 'border-green-500/40 text-green-400 bg-green-500/10'
              : 'border-gray-600/30 text-gray-400 bg-white/[0.02] hover:border-gray-500/50'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
          Auto-Refresh {autoRefresh ? 'AÇIK' : 'KAPALI'}
        </motion.button>

        {autoRefresh && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-400"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {countdown}s sonra yenilenecek
          </motion.span>
        )}
      </motion.div>

      {/* Log Stream */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}
