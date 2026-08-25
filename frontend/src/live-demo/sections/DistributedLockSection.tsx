import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { lockApi } from '../../api/lockApi'
import { testApi } from '../../api/cacheApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import LogStream, { LogEntry } from '../shared/LogStream'
import MiniCodeBlock from '../shared/MiniCodeBlock'
import RequestTimeline, { TimelineEntry } from '../visualizations/RequestTimeline'
import LockAcquireFlowDiagram from '../visualizations/LockAcquireFlowDiagram'
import Tabs from '../../components/ui/Tabs'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

type LockMachineState = 'IDLE' | 'WAITING' | 'LOCKED' | 'RELEASED' | 'EXPIRED'

const LOCK_NAME = 'inventory:product:42'

/* ====================================================================
   State Machine Colors
   ==================================================================== */
const stateConfig: Record<LockMachineState, { label: string; color: string; border: string; bg: string; text: string }> = {
  IDLE:     { label: 'Boşta',       color: '#6b7280', border: 'border-gray-500/40', bg: 'bg-gray-500/10', text: 'text-gray-400' },
  WAITING:  { label: 'Bekliyor',    color: '#f59e0b', border: 'border-amber-500/40', bg: 'bg-amber-500/10', text: 'text-amber-400' },
  LOCKED:   { label: 'Kilitli',     color: '#a855f7', border: 'border-purple-500/40', bg: 'bg-purple-500/10', text: 'text-purple-400' },
  RELEASED: { label: 'Serbest',     color: '#22c55e', border: 'border-green-500/40', bg: 'bg-green-500/10', text: 'text-green-400' },
  EXPIRED:  { label: 'Süresi Doldu', color: '#ef4444', border: 'border-red-500/40', bg: 'bg-red-500/10', text: 'text-red-400' },
}

const machineStates: LockMachineState[] = ['IDLE', 'WAITING', 'LOCKED', 'RELEASED']

/* ====================================================================
   Tab 1: Lock Mechanism
   ==================================================================== */
function LockMechanismTab() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()

  const [machineState, setMachineState] = useState<LockMachineState>('IDLE')
  const [leaseSeconds, setLeaseSeconds] = useState(10)
  const [ownerUuid, setOwnerUuid] = useState<string | null>(null)
  const [remainingMs, setRemainingMs] = useState(0)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadingBtn, setLoadingBtn] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const leaseEndRef = useRef<number>(0)

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

  /* ---- Lease countdown ---- */
  const startLeaseTimer = useCallback((totalMs: number) => {
    if (timerRef.current) clearInterval(timerRef.current)
    leaseEndRef.current = Date.now() + totalMs
    setRemainingMs(totalMs)

    timerRef.current = setInterval(() => {
      const left = leaseEndRef.current - Date.now()
      if (left <= 0) {
        setRemainingMs(0)
        setMachineState('EXPIRED')
        setOwnerUuid(null)
        if (timerRef.current) clearInterval(timerRef.current)
      } else {
        setRemainingMs(left)
      }
    }, 100)
  }, [])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  /* ---- Handlers ---- */

  const handleAcquire = async () => {
    setLoadingBtn('acquire')
    setMachineState('WAITING')
    try {
      const leaseMs = leaseSeconds * 1000
      const start = performance.now()
      const res = await lockApi.acquire(LOCK_NAME, leaseMs)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      if (data?.locked || data?.success) {
        const uuid = data.ownerId ?? data.uuid ?? data.lockValue ?? '—'
        setOwnerUuid(uuid)
        setMachineState('LOCKED')
        startLeaseTimer(leaseMs)
        pushLog('ACQUIRE', `Kilit alındı (owner: ${uuid})`, 'lock', ms)
        addLog('distributed-lock', 'lock', `Kilit alındı: ${LOCK_NAME}`, ms)
      } else {
        setMachineState('IDLE')
        pushLog('ACQUIRE', data?.message ?? 'Kilit alınamadı', 'error', ms)
        addLog('distributed-lock', 'error', 'Kilit alınamadı', ms)
      }
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setMachineState('IDLE')
      pushLog('ACQUIRE', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  const handleRelease = async () => {
    setLoadingBtn('release')
    try {
      const start = performance.now()
      await lockApi.release(LOCK_NAME)
      const ms = Math.round(performance.now() - start)

      if (timerRef.current) clearInterval(timerRef.current)
      setRemainingMs(0)
      setMachineState('RELEASED')
      pushLog('RELEASE', 'Kilit serbest bırakıldı', 'success', ms)
      addLog('distributed-lock', 'success', `Kilit bırakıldı: ${LOCK_NAME}`, ms)
      setOwnerUuid(null)
      incrementMetric('totalRequests')
      markCompleted('distributed-lock')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('RELEASE', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  const handleStatus = async () => {
    setLoadingBtn('status')
    try {
      const start = performance.now()
      const res = await lockApi.status(LOCK_NAME)
      const ms = Math.round(performance.now() - start)
      const data = res.data
      pushLog(
        'STATUS',
        JSON.stringify(data, null, 0).slice(0, 120),
        data?.locked ? 'lock' : 'info',
        ms,
      )
      addLog('distributed-lock', 'info', `Durum sorgu: ${LOCK_NAME}`, ms)
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('STATUS', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingBtn(null)
    }
  }

  /* ---- Radial Lease Timer (SVG) ---- */
  const totalLeaseMs = leaseSeconds * 1000
  const progress = totalLeaseMs > 0 ? remainingMs / totalLeaseMs : 0
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference * (1 - progress)
  const remainingSec = Math.ceil(remainingMs / 1000)
  const isLocked = machineState === 'LOCKED'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Lock Name */}
      <motion.div variants={item} className="glass p-3 rounded-xl flex items-center gap-3">
        <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-500 tracking-wide font-semibold">KİLİT ADI</p>
          <p className="text-sm text-purple-300 font-mono truncate">{LOCK_NAME}</p>
        </div>
      </motion.div>

      {/* Lease Time Slider */}
      <motion.div variants={item} className="glass p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 tracking-wide font-semibold">LEASE SÜRESİ</span>
          <span className="text-sm font-bold font-mono text-purple-400">{leaseSeconds}s</span>
        </div>
        <input
          type="range"
          min={5}
          max={30}
          value={leaseSeconds}
          onChange={(e) => setLeaseSeconds(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
          disabled={isLocked}
        />
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>5s</span>
          <span>30s</span>
        </div>
      </motion.div>

      {/* 3 Action Buttons */}
      <motion.div variants={item} className="grid grid-cols-3 gap-2">
        <ActionButton
          variant="primary"
          onClick={handleAcquire}
          loading={loadingBtn === 'acquire'}
          disabled={isLocked}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        >
          Kilidi Al
        </ActionButton>

        <ActionButton
          variant="warning"
          onClick={handleRelease}
          loading={loadingBtn === 'release'}
          disabled={!isLocked}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
        >
          Kilidi Bırak
        </ActionButton>

        <ActionButton
          variant="success"
          onClick={handleStatus}
          loading={loadingBtn === 'status'}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
          }
        >
          Durumu Gör
        </ActionButton>
      </motion.div>

      {/* State Machine Visualization */}
      <motion.div variants={item} className="glass p-4 rounded-xl space-y-2">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Kilit Durum Makinesi</h4>
        <div className="flex items-center gap-2">
          {machineStates.map((st, idx) => {
            const cfg = stateConfig[st]
            const finalState = machineState === 'EXPIRED' && st === 'RELEASED' ? stateConfig.EXPIRED : cfg
            const isActive = machineState === st || (machineState === 'EXPIRED' && st === 'RELEASED')
            const actualLabel = machineState === 'EXPIRED' && st === 'RELEASED' ? stateConfig.EXPIRED.label : cfg.label

            return (
              <div key={st} className="flex items-center gap-2 flex-1">
                <motion.div
                  animate={
                    isActive
                      ? { borderColor: [finalState.color + '60', finalState.color, finalState.color + '60'] }
                      : {}
                  }
                  transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                  className={`flex-1 rounded-lg border-2 px-2 py-2.5 text-center transition-all ${
                    isActive
                      ? `${finalState.bg} ${finalState.border}`
                      : 'border-gray-700/40 bg-gray-800/20'
                  }`}
                >
                  <p className={`text-[10px] font-bold ${isActive ? finalState.text : 'text-gray-600'}`}>
                    {machineState === 'EXPIRED' && st === 'RELEASED' ? 'EXPIRED' : st}
                  </p>
                  <p className={`text-[8px] mt-0.5 ${isActive ? 'text-gray-300' : 'text-gray-700'}`}>
                    {actualLabel}
                  </p>
                </motion.div>
                {idx < machineStates.length - 1 && (
                  <svg className="w-4 h-4 text-gray-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            )
          })}
        </div>
      </motion.div>

      {/* Radial Lease Timer + Lock Info Card side by side */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3">
        {/* Radial Timer */}
        <div className="glass p-4 rounded-xl flex items-center justify-center">
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background circle */}
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="6"
            />
            {/* Progress arc */}
            <circle
              cx="65" cy="65" r="54"
              fill="none"
              stroke={isLocked ? '#a855f7' : machineState === 'EXPIRED' ? '#ef4444' : '#6b7280'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 65 65)"
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
            {/* Center text */}
            <text
              x="65" y="60"
              textAnchor="middle"
              fill={isLocked ? '#a855f7' : '#6b7280'}
              fontSize="28"
              fontWeight="700"
              fontFamily="monospace"
            >
              {isLocked ? remainingSec : '—'}
            </text>
            <text
              x="65" y="78"
              textAnchor="middle"
              fill="rgba(255,255,255,0.3)"
              fontSize="10"
            >
              {isLocked ? 'saniye' : 'boşta'}
            </text>
          </svg>
        </div>

        {/* Lock Info Card */}
        <div className="glass p-4 rounded-xl space-y-3">
          <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Kilit Bilgisi</h4>
          <div className="space-y-2">
            <div>
              <p className="text-[9px] text-gray-600 uppercase">Owner UUID</p>
              <p className="text-[11px] text-purple-300 font-mono truncate">{ownerUuid ?? '—'}</p>
            </div>
            <div>
              <p className="text-[9px] text-gray-600 uppercase">Kalan Süre</p>
              <p className="text-sm font-bold font-mono text-purple-400">
                {isLocked ? `${(remainingMs / 1000).toFixed(1)}s` : '—'}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-gray-600 uppercase">Durum</p>
              <p className={`text-xs font-semibold ${stateConfig[machineState].text}`}>
                {stateConfig[machineState].label}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ecommerce Flow Diagram */}
      <motion.div variants={item} className="glass p-4 rounded-xl">
        <h4 className="text-[10px] text-gray-500 tracking-wide font-semibold mb-2">
          KİLİT EDİNME AKIŞI
        </h4>
        <LockAcquireFlowDiagram />
      </motion.div>

      {/* Redis Command */}
      <motion.div variants={item}>
        <MiniCodeBlock
          language="redis"
          code={`SET ${LOCK_NAME} <uuid> NX PX ${leaseSeconds * 1000}`}
        />
      </motion.div>

      {/* Log Stream */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}

/* ====================================================================
   Tab 2: Concurrent Buyers
   ==================================================================== */
function ConcurrentBuyersTab() {
  const { addLog, incrementMetric } = useLiveDemo()

  const [buyerCount, setBuyerCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [winnerLabel, setWinnerLabel] = useState<string | null>(null)

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

  const handleRace = async () => {
    setLoading(true)
    setTimeline([])
    setWinnerLabel(null)
    setLogs([])

    try {
      const start = performance.now()
      const res = await testApi.concurrentLocks(buyerCount, LOCK_NAME)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      incrementMetric('totalRequests')
      addLog('distributed-lock', 'info', `${buyerCount} eş zamanlı kilit yarışı tamamlandı`, ms)

      // Parse response into timeline entries
      const results: Array<{
        threadName?: string
        threadId?: number
        acquired?: boolean
        success?: boolean
        lockAcquired?: boolean
        waitTimeMs?: number
        holdTimeMs?: number
        processingTimeMs?: number
        totalTimeMs?: number
      }> = Array.isArray(data?.results) ? data.results : Array.isArray(data) ? data : []

      let foundWinner = false
      const entries: TimelineEntry[] = results.map((r, i) => {
        const label = r.threadName ?? `Müşteri-${i + 1}`
        const acquired = r.acquired ?? r.success ?? r.lockAcquired ?? false
        const waitMs = r.waitTimeMs ?? 0
        const holdMs = r.holdTimeMs ?? r.processingTimeMs ?? 0
        const totalMs = r.totalTimeMs ?? ((waitMs + holdMs) || 1)

        if (acquired && !foundWinner) {
          foundWinner = true
          setWinnerLabel(label)
        }

        const segments: TimelineEntry['segments'] = []
        if (waitMs > 0) {
          segments.push({ type: 'lock_wait', widthPercent: Math.max((waitMs / totalMs) * 100, 5), durationMs: waitMs })
        }
        if (acquired && holdMs > 0) {
          segments.push({ type: 'lock_held', widthPercent: Math.max((holdMs / totalMs) * 100, 10), durationMs: holdMs })
          segments.push({ type: 'processing', widthPercent: 15, durationMs: Math.round(holdMs * 0.3) })
        }
        if (!acquired) {
          segments.push({ type: 'error', widthPercent: 15 })
        }
        // Fill remaining
        const used = segments.reduce((s, seg) => s + seg.widthPercent, 0)
        if (used < 100) {
          segments.push({ type: 'wait', widthPercent: 100 - used })
        }

        pushLog(
          `BUYER_${i + 1}`,
          acquired ? `Kilidi ALDI (${holdMs}ms)` : `Kilidi ALAMADI (${waitMs}ms bekledi)`,
          acquired ? 'lock' : 'error',
          waitMs + holdMs,
        )

        return { label, segments }
      })

      // If we got no parsed results, build a simple fallback timeline
      if (entries.length === 0) {
        for (let i = 0; i < buyerCount; i++) {
          const label = `Müşteri-${i + 1}`
          if (i === 0) {
            setWinnerLabel(label)
            entries.push({
              label,
              segments: [
                { type: 'lock_wait', widthPercent: 10, durationMs: 5 },
                { type: 'lock_held', widthPercent: 50, durationMs: 200 },
                { type: 'processing', widthPercent: 20, durationMs: 80 },
                { type: 'wait', widthPercent: 20 },
              ],
            })
          } else {
            entries.push({
              label,
              segments: [
                { type: 'lock_wait', widthPercent: 60, durationMs: 300 + i * 50 },
                { type: 'error', widthPercent: 15 },
                { type: 'wait', widthPercent: 25 },
              ],
            })
          }
          pushLog(
            `BUYER_${i + 1}`,
            i === 0 ? 'Kilidi ALDI' : 'Kilidi ALAMADI',
            i === 0 ? 'lock' : 'error',
          )
        }
      }

      setTimeline(entries)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('RACE', `HATA: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      {/* Buyer Count Slider */}
      <motion.div variants={item} className="glass p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 tracking-wide font-semibold">EŞ ZAMANLI MÜŞTERİ SAYISI</span>
          <span className="text-sm font-bold font-mono text-purple-400">{buyerCount}</span>
        </div>
        <input
          type="range"
          min={2}
          max={10}
          value={buyerCount}
          onChange={(e) => setBuyerCount(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-purple-500"
          disabled={loading}
        />
        <div className="flex justify-between text-[9px] text-gray-600">
          <span>2</span>
          <span>10</span>
        </div>
      </motion.div>

      {/* Start Race Button */}
      <motion.div variants={item}>
        <ActionButton
          variant="primary"
          onClick={handleRace}
          loading={loading}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          }
        >
          Yarışı Başlat ({buyerCount} müşteri)
        </ActionButton>
      </motion.div>

      {/* Winner Highlight */}
      {winnerLabel && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-3.77 1.522 6.003 6.003 0 01-3.77-1.522" />
            </svg>
          </div>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Kazanan</p>
            <p className="text-sm font-bold text-purple-300">{winnerLabel}</p>
          </div>
        </motion.div>
      )}

      {/* Request Timeline */}
      {timeline.length > 0 && (
        <motion.div variants={item}>
          <RequestTimeline
            entries={timeline}
            title="Müşteri Kilit Yarışı Zamanlama Çizelgesi"
          />
        </motion.div>
      )}

      {/* Log Stream */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}

/* ====================================================================
   Main Section
   ==================================================================== */
export default function DistributedLockSection() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Scenario Description */}
      <motion.div
        variants={item}
        className="glass p-4 border border-purple-500/20 bg-purple-500/5 rounded-xl"
      >
        <h3 className="text-sm font-bold text-purple-400 mb-1">Senaryo: Son Ürün İçin Yaris</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Stokta son <span className="text-amber-400 font-semibold">1 RTX 5090</span> kaldı.
          Ayni anda <span className="text-purple-300 font-semibold">5 müşteri</span> "Satın Al"
          butonuna basıyor... Distributed Lock olmadan <span className="text-red-400">oversell</span> riski!
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs
          tabs={[
            { label: 'Kilit Mekanizması', content: <LockMechanismTab /> },
            { label: 'Eş Zamanlı Alıcılar', content: <ConcurrentBuyersTab /> },
          ]}
        />
      </motion.div>
    </motion.div>
  )
}
