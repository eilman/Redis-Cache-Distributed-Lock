import { useState } from 'react'
import { motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { testApi } from '../../api/cacheApi'

export default function FailureTestSlide() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<Array<{ action: string; result: string; timestamp: string }>>([])

  const run = async (action: 'disconnect' | 'restore') => {
    setLoading(true)
    try {
      const res = action === 'disconnect' ? await testApi.simulateDisconnect() : await testApi.restore()
      const s = res.data?.data?.status || 'UNKNOWN'
      setStatus(s)
      setLogs(prev => [...prev, { action, result: s, timestamp: new Date().toLocaleTimeString() }])
    } catch (err: any) {
      setStatus('ERROR')
      setLogs(prev => [...prev, { action, result: 'ERROR: ' + err.message, timestamp: new Date().toLocaleTimeString() }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Canlı Demo: Redis Kesinti Testi
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full ${
            status === 'REDIS_CONNECTED' || status === 'RESTORED' ? 'bg-green-500' :
            status === 'REDIS_DISCONNECTED' ? 'bg-red-500 animate-pulse' : 'bg-gray-600'
          }`} />
          <span className="text-sm">Redis: <span className="font-mono font-bold">{status || 'Bilinmiyor'}</span></span>
        </div>

        <div className="flex gap-3">
          <Button onClick={() => run('disconnect')} variant="danger" loading={loading}>Simulate Disconnect</Button>
          <Button onClick={() => run('restore')} variant="secondary" loading={loading}>Restore</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass p-5 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400">Circuit Breaker Pattern</h3>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            { state: 'CLOSED', desc: 'Normal akış', color: 'bg-green-500/20 text-green-400' },
            { state: 'OPEN', desc: 'Redis devre disi, fallback', color: 'bg-red-500/20 text-red-400' },
            { state: 'HALF-OPEN', desc: 'Test ediliyor', color: 'bg-yellow-500/20 text-yellow-400' },
          ].map(s => (
            <div key={s.state} className={`glass p-3 rounded-lg ${s.color}`}>
              <p className="text-sm font-bold">{s.state}</p>
              <p className="text-xs opacity-60 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {logs.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="text-xs font-mono bg-black/20 px-3 py-1 rounded flex gap-3">
              <span className="text-gray-600">{log.timestamp}</span>
              <span className="text-indigo-400">{log.action}</span>
              <span className="text-gray-300">{log.result}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
