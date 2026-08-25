import { useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { redlockApi } from '../../api/lockApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import LogStream, { LogEntry } from '../shared/LogStream'
import ComparisonPanel from '../shared/ComparisonPanel'
import MiniCodeBlock from '../shared/MiniCodeBlock'
import RedisClusterDiagram from '../visualizations/RedisClusterDiagram'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const RESOURCE = 'payment:order:1001'
const NODE_COUNT = 5

export default function RedlockSection() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()

  const [lockedNodes, setLockedNodes] = useState<number[]>([])
  const [quorumReached, setQuorumReached] = useState<boolean | null>(null)
  const [animating, setAnimating] = useState(false)
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)
  const [scheduledResult, setScheduledResult] = useState<string | null>(null)

  const animTimerRef = useRef<ReturnType<typeof setTimeout>[]>([])

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

  const clearAnimTimers = () => {
    animTimerRef.current.forEach(clearTimeout)
    animTimerRef.current = []
  }

  /* ---- Acquire with animated node locking ---- */
  const handleAcquire = async () => {
    setLoadingBtn('acquire')
    setLockedNodes([])
    setQuorumReached(null)
    setAnimating(true)
    clearAnimTimers()

    try {
      const start = performance.now()
      const res = await redlockApi.acquire(RESOURCE, 30000)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      const acquired = data?.locked ?? data?.success ?? false
      const uuid = data?.ownerId ?? data?.lockValue ?? data?.uuid ?? null
      setOwnerId(uuid)

      // Animate nodes sequentially
      const totalNodes = acquired ? NODE_COUNT : Math.floor(NODE_COUNT / 2)
      for (let i = 0; i < totalNodes; i++) {
        const timer = setTimeout(() => {
          setLockedNodes((prev) => [...prev, i])
        }, (i + 1) * 300)
        animTimerRef.current.push(timer)
      }

      // After animation completes, set quorum result
      const finalTimer = setTimeout(() => {
        const lockedCount = totalNodes
        setQuorumReached(lockedCount >= Math.ceil(NODE_COUNT / 2))
        setAnimating(false)
      }, (totalNodes + 1) * 300)
      animTimerRef.current.push(finalTimer)

      if (acquired) {
        pushLog('REDLOCK ACQUIRE', `Kilit alindi (${NODE_COUNT} node'dan ${totalNodes}'ine) owner: ${uuid}`, 'lock', ms)
        addLog('redlock', 'lock', `Redlock kilit alindi: ${RESOURCE}`, ms)
        markCompleted('redlock')
      } else {
        pushLog('REDLOCK ACQUIRE', data?.message ?? 'Quorum saglanamadi', 'error', ms)
        addLog('redlock', 'error', 'Redlock quorum basarisiz', ms)
      }
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setAnimating(false)
      pushLog('REDLOCK ACQUIRE', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  /* ---- Release ---- */
  const handleRelease = async () => {
    setLoadingBtn('release')
    clearAnimTimers()
    try {
      const start = performance.now()
      await redlockApi.release(RESOURCE)
      const ms = Math.round(performance.now() - start)

      setLockedNodes([])
      setQuorumReached(null)
      setOwnerId(null)
      setAnimating(false)
      pushLog('REDLOCK RELEASE', 'Tum node\'lardan kilit birakildi', 'success', ms)
      addLog('redlock', 'success', `Redlock kilit birakildi: ${RESOURCE}`, ms)
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('REDLOCK RELEASE', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  /* ---- Scheduled Job ---- */
  const handleScheduledJob = async () => {
    setLoadingBtn('scheduled')
    setScheduledResult(null)
    try {
      const start = performance.now()
      const res = await redlockApi.scheduledJob('payment-reconciliation', 3)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      const winner = data?.acquiredBy ?? data?.winner ?? data?.podName ?? 'Pod-1'
      setScheduledResult(winner)
      pushLog('SCHEDULED JOB', `Kilidi alan pod: ${winner}`, 'lock', ms)
      addLog('redlock', 'info', `Zamanlanmis job: ${winner} kazandi`, ms)
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('SCHEDULED JOB', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Scenario Card */}
      <motion.div
        variants={item}
        className="glass p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl"
      >
        <h3 className="text-sm font-bold text-rose-400 mb-1">Senaryo: Guvenli Odeme</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Musteri <span className="text-amber-400 font-semibold">74.999 TL</span>'lik MacBook Pro icin
          odeme yapiyor. <span className="text-rose-300 font-semibold">3 farkli Redis node</span>'u var.
          Double-charge <span className="text-red-400 font-bold">olmamali!</span>
        </p>
      </motion.div>

      {/* Redis Cluster Diagram */}
      <motion.div variants={item}>
        <RedisClusterDiagram
          nodeCount={NODE_COUNT}
          lockedNodes={lockedNodes}
          quorumReached={quorumReached}
          animating={animating}
        />
      </motion.div>

      {/* Controls */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        <ActionButton
          variant="primary"
          onClick={handleAcquire}
          loading={loadingBtn === 'acquire'}
          disabled={lockedNodes.length > 0}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          }
        >
          Odeme Baslat (Redlock)
        </ActionButton>

        <ActionButton
          variant="warning"
          onClick={handleRelease}
          loading={loadingBtn === 'release'}
          disabled={lockedNodes.length === 0}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        >
          Kilidi Birak
        </ActionButton>

        <ActionButton
          variant="success"
          onClick={handleScheduledJob}
          loading={loadingBtn === 'scheduled'}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          Zamanlanmis Job
        </ActionButton>
      </motion.div>

      {/* Scheduled Job Result */}
      {scheduledResult && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-3 rounded-xl border border-green-500/20 bg-green-500/5 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Kilidi Alan Pod</p>
            <p className="text-sm font-bold text-green-300">{scheduledResult}</p>
          </div>
        </motion.div>
      )}

      {/* Comparison Panel */}
      <motion.div variants={item}>
        <ComparisonPanel
          leftTitle="Single Lock (1 Node)"
          rightTitle="Redlock (5 Node)"
          leftMetrics={[
            { label: 'Redis Node', value: '1' },
            { label: 'Node cokarsa', value: 'KAYIP' },
            { label: 'Latency', value: 'Dusuk' },
          ]}
          rightMetrics={[
            { label: 'Redis Node', value: '5' },
            { label: 'Node cokarsa', value: 'GUVENLI' },
            { label: 'Latency', value: 'Biraz yuksek' },
          ]}
        />
      </motion.div>

      {/* Pseudocode */}
      <motion.div variants={item}>
        <MiniCodeBlock
          language="pseudocode"
          code={`// Redlock Algorithm
1. T1 = current time
2. for each Redis node (N1..N5):
     SET resource <uuid> NX PX 30000
3. T2 = current time
4. validity = ttl - (T2 - T1)
5. if locked_count >= 3 (quorum)
     && validity > 0:
       LOCK ACQUIRED
6. else:
       RELEASE all nodes`}
        />
      </motion.div>

      {/* Log Stream */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}
