import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { resilienceApi } from '../../api/cacheApi'

interface LogItem {
  action: string
  result: string
  type: 'success' | 'error' | 'info'
}

export default function ResilienceDemoSlide() {
  const [cbState, setCbState] = useState<string>('UNKNOWN')
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogItem[]>([])

  const addLog = (action: string, result: string, type: LogItem['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-9), { action, result, type }])
  }

  const refreshStatus = async () => {
    try {
      const res = await resilienceApi.circuitBreakerStatus()
      const d = res.data?.data as Record<string, unknown>
      setCbState(String(d?.state || 'UNKNOWN'))
      return d
    } catch {
      setCbState('ERROR')
    }
  }

  const simulateFailures = async () => {
    setLoading(true)
    try {
      await resilienceApi.simulateFailure(5)
      addLog('SIMULATE', '5 Redis hatası simüle edildi', 'info')
      await refreshStatus()
    } finally {
      setLoading(false)
    }
  }

  const tryFailOpen = async () => {
    setLoading(true)
    try {
      const res = await resilienceApi.failOpen(1)
      const d = res.data?.data as Record<string, unknown>
      const source = String(d?.source || 'UNKNOWN')
      addLog('FAIL_OPEN', `Source: ${source} | CB: ${d?.circuitBreakerState}`, source === 'CACHE' || source === 'DB_FALLBACK' ? 'success' : 'error')
      await refreshStatus()
    } catch {
      addLog('FAIL_OPEN', 'Request failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const tryFailClose = async () => {
    setLoading(true)
    try {
      const res = await resilienceApi.failClose(1)
      if (res.data?.success) {
        const d = res.data.data as Record<string, unknown>
        addLog('FAIL_CLOSE', `Source: ${d?.source} | CB: ${d?.circuitBreakerState}`, 'success')
      } else {
        const d = res.data?.data as Record<string, unknown>
        addLog('FAIL_CLOSE', `REJECTED: ${d?.error} | CB: ${d?.circuitBreakerState}`, 'error')
      }
      await refreshStatus()
    } catch {
      addLog('FAIL_CLOSE', 'Request failed / rejected', 'error')
    } finally {
      setLoading(false)
    }
  }

  const reset = async () => {
    setLoading(true)
    try {
      await resilienceApi.reset()
      addLog('RESET', 'Circuit breaker sıfırlandı', 'info')
      await refreshStatus()
    } finally {
      setLoading(false)
    }
  }

  const cbColor = cbState === 'CLOSED' ? 'bg-green-500' : cbState === 'OPEN' ? 'bg-red-500' : cbState === 'HALF_OPEN' ? 'bg-yellow-500' : 'bg-gray-600'

  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient text-center">
        Canlı Demo: Circuit Breaker & Resilience
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20 text-center"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Simüle edilen Redis hataları</span> ile Circuit Breaker davranışını test edin.
          Fail-Open DB'ye düşer, Fail-Close isteği reddeder. CB 50% hata oranında açılır.
        </p>
      </motion.div>

      {/* Circuit Breaker State */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400">Circuit Breaker State</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { state: 'CLOSED', desc: 'Normal akış', color: 'bg-green-500/20 text-green-400', border: 'border-green-500/30' },
            { state: 'OPEN', desc: 'Redis devre dışı', color: 'bg-red-500/20 text-red-400', border: 'border-red-500/30' },
            { state: 'HALF_OPEN', desc: 'Test ediliyor', color: 'bg-yellow-500/20 text-yellow-400', border: 'border-yellow-500/30' },
          ].map(s => (
            <div key={s.state} className={`glass p-2 rounded-lg ${s.color} border ${cbState === s.state ? s.border : 'border-transparent'}`}>
              <p className="text-sm font-bold">{s.state}</p>
              <p className="text-xs opacity-60 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${cbColor} animate-pulse`} />
          <span className="text-sm text-gray-300">
            Circuit Breaker: <span className="font-mono font-bold">{cbState}</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={simulateFailures} variant="danger" loading={loading} size="sm">
            Simulate 5 Failures
          </Button>
          <Button onClick={tryFailOpen} loading={loading} size="sm">
            Try Fail-Open
          </Button>
          <Button onClick={tryFailClose} variant="secondary" loading={loading} size="sm">
            Try Fail-Close
          </Button>
          <Button onClick={() => refreshStatus()} variant="secondary" loading={loading} size="sm">
            Check Status
          </Button>
          <Button onClick={reset} variant="secondary" loading={loading} size="sm">
            Reset CB
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="space-y-1 mt-4">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-mono bg-black/20 px-3 py-1.5 rounded flex gap-3"
              >
                <span className={log.type === 'success' ? 'text-green-400' : log.type === 'error' ? 'text-red-400' : 'text-cyan-400'}>
                  {log.action}
                </span>
                <span className={log.type === 'success' ? 'text-green-300' : log.type === 'error' ? 'text-red-300' : 'text-gray-300'}>
                  {log.result}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
