import { useState } from 'react'
import { motion } from 'framer-motion'
import DemoPanel from '../../components/demo/DemoPanel'
import { testApi } from '../../api/cacheApi'

export default function ConcurrencyTestSlide() {
  const [threadCount, setThreadCount] = useState(10)

  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Canlı Demo: Eş Zamanlılık Testi
      </motion.h2>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-3">
        <label className="text-sm text-gray-400">Thread Sayısı:</label>
        <input
          type="number"
          value={threadCount}
          onChange={e => setThreadCount(Number(e.target.value))}
          min={2}
          max={50}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm w-20"
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
        <DemoPanel
          title="Concurrent Cache Reads"
          description={`${threadCount} thread aynı anda aynı key'i okuyor`}
          onRun={() => testApi.concurrentReads(threadCount, 1)}
          renderResult={(data: any) => (
            <div className="text-sm space-y-1">
              <p>Thread: <span className="text-indigo-400 font-bold">{data?.threadCount}</span></p>
              <p>Avg Latency: <span className="text-cyan-400 font-bold">{data?.avgLatencyMs}ms</span></p>
              <p>All Hits: <span className={data?.allHits ? 'text-green-400' : 'text-red-400'}>{data?.allHits ? 'Yes' : 'No'}</span></p>
            </div>
          )}
        />

        <DemoPanel
          title="Concurrent Lock Acquisition"
          description={`${threadCount} thread aynı anda aynı lock'u almaya çalışıyor`}
          onRun={() => testApi.concurrentLocks(threadCount, 'concurrency-test-lock')}
          renderResult={(data: any) => (
            <div className="text-sm space-y-1">
              <p>Thread: <span className="text-indigo-400 font-bold">{data?.threadCount}</span></p>
              <p>Acquired: <span className="text-green-400 font-bold">{data?.acquiredCount}</span></p>
              <p>Mutual Exclusion: <span className={data?.mutualExclusion ? 'text-green-400' : 'text-red-400'}>{data?.mutualExclusion ? 'Verified' : 'Failed'}</span></p>
            </div>
          )}
        />
      </motion.div>
    </div>
  )
}
