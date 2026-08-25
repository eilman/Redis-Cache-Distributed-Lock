import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import HitMissChart from '../../components/metrics/HitMissChart'
import LatencyChart from '../../components/metrics/LatencyChart'
import { metricsApi } from '../../api/cacheApi'

export default function MetricsDemoSlide() {
  const [metrics, setMetrics] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [prometheusMetrics, setPrometheusMetrics] = useState<any>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchMetrics = async () => {
    try {
      const [snap, hist, prom] = await Promise.all([
        metricsApi.snapshot(),
        metricsApi.history(60),
        metricsApi.prometheusSummary(),
      ])
      setMetrics(snap.data?.data)
      setHistory(hist.data?.data || [])
      setPrometheusMetrics(prom.data?.data)
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(fetchMetrics, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh])

  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Canlı Demo: Redis Metrics
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
        <Button onClick={fetchMetrics} size="sm">Yenile</Button>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-3 py-1.5 rounded-lg text-sm ${autoRefresh ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-400'}`}
        >
          {autoRefresh ? 'Auto-Refresh: ON' : 'Auto-Refresh: OFF'}
        </button>
      </motion.div>

      {metrics && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-4 gap-3">
          {[
            { label: 'Hit Rate', value: `${metrics.hitRate || 0}%`, color: 'text-green-400' },
            { label: 'Total Hits', value: metrics.hits || 0, color: 'text-green-400' },
            { label: 'Total Misses', value: metrics.misses || 0, color: 'text-red-400' },
            { label: 'Avg Latency', value: `${metrics.avgLatencyMs || 0}ms`, color: 'text-indigo-400' },
          ].map((stat, i) => (
            <div key={stat.label} className="glass p-4 text-center">
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Hit / Miss Oranı</h3>
          <HitMissChart hits={metrics?.hits || 0} misses={metrics?.misses || 0} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-4">
          <h3 className="text-sm font-semibold text-gray-400 mb-2">Latency Geçmişi</h3>
          <LatencyChart data={history} />
        </motion.div>
      </div>

      {/* Prometheus Metrics Panel */}
      {prometheusMetrics && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-400">Prometheus / Micrometer Metrics</h3>
            <span className="text-[10px] text-gray-600 font-mono bg-black/30 px-2 py-1 rounded">{prometheusMetrics.prometheusEndpoint}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 font-mono">cache_evictions_total</p>
              <p className="text-lg font-bold text-orange-400">{prometheusMetrics.cacheEvictionsTotal || 0}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 font-mono">cache_hit_rate</p>
              <p className="text-lg font-bold text-green-400">{prometheusMetrics.hitRate || 0}%</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg">
              <p className="text-[10px] text-gray-500 font-mono">cache_latency_count</p>
              <p className="text-lg font-bold text-cyan-400">{prometheusMetrics.latencyMs?.count || 0}</p>
            </div>
          </div>
          {prometheusMetrics.latencyMs && (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'p50', value: prometheusMetrics.latencyMs.p50 },
                { label: 'p95', value: prometheusMetrics.latencyMs.p95 },
                { label: 'p99', value: prometheusMetrics.latencyMs.p99 },
                { label: 'max', value: prometheusMetrics.latencyMs.max },
              ].map((p) => (
                <div key={p.label} className="bg-black/20 p-2 rounded text-center">
                  <p className="text-[10px] text-gray-500 font-mono">{p.label}</p>
                  <p className="text-sm font-bold text-purple-400">{p.value || 0}ms</p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
