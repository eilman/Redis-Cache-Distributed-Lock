import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { lockApi } from '../../api/lockApi'
import { testApi } from '../../api/cacheApi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface LogEntry {
  action: string
  result: string
  time: number
  variant: 'success' | 'error' | 'info'
}

interface ContentionDetail {
  threadId: number
  acquired: boolean
  waitTimeMs: number
  workDone?: boolean
}

interface ContentionResult {
  threadCount: number
  acquiredCount: number
  mutualExclusion: boolean
  details: ContentionDetail[]
}

type LockPhase = 'idle' | 'waiting' | 'locked' | 'releasing' | 'expired'

/* ------------------------------------------------------------------ */
/*  State Machine Diagram                                              */
/* ------------------------------------------------------------------ */

const phases: { key: LockPhase; label: string; desc: string; color: string; border: string; bg: string; dot: string }[] = [
  { key: 'idle', label: 'SERBEST', desc: 'Kilit mevcut değil', color: 'text-green-400', border: 'border-green-500/50', bg: 'bg-green-500/10', dot: 'bg-green-500' },
  { key: 'waiting', label: 'BEKLENİYOR', desc: 'tryLock() çağrıldı...', color: 'text-yellow-400', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10', dot: 'bg-yellow-500' },
  { key: 'locked', label: 'KİLİTLİ', desc: 'Sadece sahip işlem yapabilir', color: 'text-red-400', border: 'border-red-500/50', bg: 'bg-red-500/10', dot: 'bg-red-500' },
  { key: 'expired', label: 'SÜRE DOLDU', desc: 'Lease süresi doldu', color: 'text-orange-400', border: 'border-orange-500/50', bg: 'bg-orange-500/10', dot: 'bg-orange-500' },
]

function StateMachine({ currentPhase }: { currentPhase: LockPhase }) {
  return (
    <div className="glass p-3 rounded-xl">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-3 text-center">Kilit Durum Makinesi</h4>
      <div className="flex items-center justify-center gap-1">
        {phases.map((p, i) => {
          const isActive = p.key === currentPhase
          return (
            <div key={p.key} className="flex items-center">
              <motion.div
                animate={{
                  scale: isActive ? 1.08 : 1,
                  boxShadow: isActive ? `0 0 16px ${p.dot.replace('bg-', '').replace('-500', '')}40` : 'none',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`relative px-3 py-2 rounded-lg border-2 ${isActive ? p.border : 'border-white/10'} ${isActive ? p.bg : 'bg-white/[0.02]'} transition-colors duration-300`}
              >
                {/* Pulse dot */}
                <div className="flex items-center gap-1.5 mb-0.5">
                  <motion.div
                    animate={isActive ? { scale: [1, 1.4, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 0.3 }}
                    transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
                    className={`w-2 h-2 rounded-full ${isActive ? p.dot : 'bg-gray-600'}`}
                  />
                  <span className={`text-xs font-bold font-mono ${isActive ? p.color : 'text-gray-600'}`}>
                    {p.label}
                  </span>
                </div>
                <p className={`text-[9px] ${isActive ? 'text-gray-400' : 'text-gray-700'}`}>{p.desc}</p>
              </motion.div>

              {/* Arrow */}
              {i < phases.length - 1 && (
                <div className="flex items-center mx-0.5">
                  <div className="h-[2px] w-3 bg-gray-700" />
                  <div className="w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] border-l-gray-700" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Radial Lease Timer                                                 */
/* ------------------------------------------------------------------ */

function RadialTimer({ remaining, total }: { remaining: number; total: number }) {
  const percent = total > 0 ? Math.max(0, (remaining / total) * 100) : 0
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - percent / 100)
  const color = percent > 30 ? '#06b6d4' : percent > 10 ? '#eab308' : '#ef4444'
  const bgRing = percent > 30 ? 'rgba(6,182,212,0.1)' : percent > 10 ? 'rgba(234,179,8,0.1)' : 'rgba(239,68,68,0.1)'

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={bgRing} strokeWidth="5" />
          <motion.circle
            cx="50" cy="50" r={radius} fill="none"
            stroke={color} strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.15 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold font-mono" style={{ color }}>
            {(remaining / 1000).toFixed(1)}
          </span>
          <span className="text-[9px] text-gray-500">saniye</span>
        </div>
      </div>
      {/* Linear bar */}
      <div className="w-full mt-2">
        <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-colors duration-300"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
        <div className="flex justify-between text-[8px] text-gray-600 mt-0.5">
          <span>ACQUIRE</span>
          <span>EXPIRE</span>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Lock Lifecycle Tab                                                 */
/* ------------------------------------------------------------------ */

function LifecycleTab() {
  const [lockName, setLockName] = useState('payment-lock')
  const [leaseTime, setLeaseTime] = useState(10)
  const [waitTime, setWaitTime] = useState(5)
  const [phase, setPhase] = useState<LockPhase>('idle')
  const [acquiredAt, setAcquiredAt] = useState<number | null>(null)
  const [activeLease, setActiveLease] = useState(0)
  const [leaseRemaining, setLeaseRemaining] = useState<number | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (acquiredAt === null || activeLease <= 0) return
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - acquiredAt
      const remaining = Math.max(0, activeLease - elapsed)
      setLeaseRemaining(remaining)
      if (remaining <= 0) {
        setPhase('expired')
        setAcquiredAt(null)
        setLogs(prev => [...prev, {
          action: 'LEASE_EXPIRED',
          result: 'Kilit süresi doldu — otomatik serbest kaldı',
          time: 0,
          variant: 'error',
        }])
        if (intervalRef.current) clearInterval(intervalRef.current)
        setTimeout(() => setPhase('idle'), 2000)
      }
    }, 100)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [acquiredAt, activeLease])

  const addLog = (entry: LogEntry) => setLogs(prev => [...prev, entry])

  const handleAcquire = useCallback(async () => {
    setLoading('acquire')
    setPhase('waiting')
    try {
      const res = await lockApi.acquire(lockName, leaseTime * 1000, waitTime * 1000)
      const data = res.data?.data as Record<string, unknown> | undefined
      if (data?.acquired) {
        setPhase('locked')
        setAcquiredAt(Date.now())
        setActiveLease(leaseTime * 1000)
        setLeaseRemaining(leaseTime * 1000)
        addLog({ action: 'ACQUIRE', result: `Kilit alındı: ${lockName} (lease=${leaseTime}s)`, time: res.data?.metadata?.executionTimeMs || 0, variant: 'success' })
      } else {
        setPhase('idle')
        addLog({ action: 'ACQUIRE_FAIL', result: `Kilit alınamadı (wait timeout=${waitTime}s doldu)`, time: res.data?.metadata?.executionTimeMs || 0, variant: 'error' })
      }
    } catch (err: unknown) {
      setPhase('idle')
      addLog({ action: 'ERROR', result: err instanceof Error ? err.message : 'Bilinmeyen hata', time: 0, variant: 'error' })
    } finally { setLoading(null) }
  }, [lockName, leaseTime, waitTime])

  const handleRelease = useCallback(async () => {
    setLoading('release')
    setPhase('releasing')
    try {
      await lockApi.release(lockName)
      setPhase('idle')
      setAcquiredAt(null)
      setLeaseRemaining(null)
      if (intervalRef.current) clearInterval(intervalRef.current)
      addLog({ action: 'RELEASE', result: `Kilit serbest bırakıldı: ${lockName}`, time: 0, variant: 'success' })
    } catch (err: unknown) {
      setPhase('locked')
      addLog({ action: 'ERROR', result: err instanceof Error ? err.message : 'Bilinmeyen hata', time: 0, variant: 'error' })
    } finally { setLoading(null) }
  }, [lockName])

  const handleStatus = useCallback(async () => {
    setLoading('status')
    try {
      const res = await lockApi.status(lockName)
      const data = res.data?.data as Record<string, unknown> | undefined
      const locked = data?.locked
      const remaining = data?.remainingLeaseTimeMs as number | undefined
      addLog({
        action: 'STATUS',
        result: locked
          ? `KİLİTLİ — kalan lease: ${Math.round((remaining || 0) / 1000)}s`
          : 'SERBEST — kilit mevcut değil',
        time: 0,
        variant: 'info',
      })
    } catch (err: unknown) {
      addLog({ action: 'ERROR', result: err instanceof Error ? err.message : 'Bilinmeyen hata', time: 0, variant: 'error' })
    } finally { setLoading(null) }
  }, [lockName])

  const isLocked = phase === 'locked'

  return (
    <div className="space-y-3">
      {/* State Machine */}
      <StateMachine currentPhase={phase} />

      {/* Two-column layout */}
      <div className="grid grid-cols-[3fr_2fr] gap-3">
        {/* Left: Lock visualization + Radial timer */}
        <div className="space-y-3">
          {/* Lock state card */}
          <div className={`glass p-4 border ${isLocked ? 'border-red-500/30' : phase === 'expired' ? 'border-orange-500/30' : 'border-green-500/30'} transition-colors duration-300`}>
            <div className="flex items-center gap-4">
              {/* Lock icon */}
              <motion.div
                animate={{ rotate: isLocked ? 0 : 15 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="shrink-0"
              >
                <svg viewBox="0 0 24 24" className={`w-10 h-10 ${isLocked ? 'text-red-400' : 'text-green-400'} transition-colors`} fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  {isLocked ? (
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  ) : (
                    <path d="M7 11V7a5 5 0 019.9-1" />
                  )}
                </svg>
              </motion.div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={isLocked ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
                    transition={isLocked ? { duration: 1.5, repeat: Infinity } : {}}
                    className={`w-3 h-3 rounded-full ${isLocked ? 'bg-red-500' : phase === 'expired' ? 'bg-orange-500' : 'bg-green-500'}`}
                  />
                  <span className={`text-sm font-bold ${isLocked ? 'text-red-400' : phase === 'expired' ? 'text-orange-400' : 'text-green-400'}`}>
                    {isLocked ? 'KİLİTLİ' : phase === 'expired' ? 'SÜRE DOLDU' : phase === 'waiting' ? 'BEKLENİYOR...' : 'SERBEST'}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{lockName}</span>
                </div>
                {isLocked && leaseRemaining !== null && (
                  <p className="text-[10px] text-gray-500 mt-1">
                    SET {lockName} "uuid" NX PX {activeLease}
                  </p>
                )}
              </div>

              {isLocked && leaseRemaining !== null && (
                <Badge variant={leaseRemaining / activeLease > 0.3 ? 'cyan' : leaseRemaining / activeLease > 0.1 ? 'yellow' : 'red'}>
                  {(leaseRemaining / 1000).toFixed(1)}s
                </Badge>
              )}
            </div>
          </div>

          {/* Radial timer */}
          <AnimatePresence>
            {isLocked && leaseRemaining !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass p-4 flex items-center gap-6"
              >
                <RadialTimer remaining={leaseRemaining} total={activeLease} />
                <div className="flex-1 space-y-2">
                  <h4 className="text-xs text-gray-400 font-semibold">Lease Countdown</h4>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    Kilit <span className="text-cyan-400 font-mono">{activeLease / 1000}s</span> süreyle aktif.
                    Süre dolunca kilit otomatik olarak serbest kalır.
                    {leaseRemaining / activeLease <= 0.3 && leaseRemaining / activeLease > 0.1 && (
                      <span className="text-yellow-400 font-semibold"> Süre azalıyor!</span>
                    )}
                    {leaseRemaining / activeLease <= 0.1 && (
                      <span className="text-red-400 font-semibold"> Kritik! Kilit düşmek üzere!</span>
                    )}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Explanation */}
          <div className="glass p-3 border border-indigo-500/15 text-[11px] text-gray-500 leading-relaxed">
            <span className="text-indigo-400 font-semibold">Lease Time neden önemli?</span>{' '}
            Lock sahibi crash olursa, lease süresi dolunca kilit otomatik serbest kalır — deadlock önlenir.
            Ancak lease çok kısa olursa iş bitmeden kilit düşer ve başka thread girer → <span className="text-red-400">data corruption</span>.
          </div>
        </div>

        {/* Right: Controls + Logs */}
        <div className="space-y-3">
          {/* Config */}
          <div className="glass p-3 space-y-2">
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 shrink-0">Lock Name</label>
              <input
                value={lockName}
                onChange={e => setLockName(e.target.value)}
                className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-white font-mono flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 shrink-0">Lease Time</label>
              <input type="range" min={2} max={30} value={leaseTime}
                onChange={e => setLeaseTime(Number(e.target.value))} className="flex-1 accent-cyan-500" />
              <span className="text-cyan-400 font-mono text-xs w-7 text-right">{leaseTime}s</span>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] text-gray-500 w-16 shrink-0">Wait Time</label>
              <input type="range" min={1} max={15} value={waitTime}
                onChange={e => setWaitTime(Number(e.target.value))} className="flex-1 accent-indigo-500" />
              <span className="text-indigo-400 font-mono text-xs w-7 text-right">{waitTime}s</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAcquire} loading={loading === 'acquire'} size="sm" disabled={isLocked}>
              Kilidi Al
            </Button>
            <Button onClick={handleRelease} loading={loading === 'release'} size="sm" variant="danger" disabled={!isLocked}>
              Serbest Bırak
            </Button>
            <Button onClick={handleStatus} loading={loading === 'status'} size="sm" variant="ghost">
              Durum
            </Button>
            {logs.length > 0 && (
              <Button onClick={() => setLogs([])} size="sm" variant="ghost">Temizle</Button>
            )}
          </div>

          {/* Guide */}
          <div className="glass p-2.5 border border-amber-500/15 text-[10px] text-gray-500 space-y-1">
            <p className="text-amber-400 font-semibold text-[11px]">Deneyin:</p>
            <p>1. "Kilidi Al" ile lock edinin</p>
            <p>2. Radyal zamanlayıcıda lease süresini izleyin</p>
            <p>3. Manuel "Serbest Bırak" veya sürenin dolmasını bekleyin</p>
          </div>

          {/* Logs */}
          {logs.length > 0 && (
            <div className="space-y-1 max-h-[120px] overflow-y-auto">
              <h4 className="text-[10px] text-gray-600 font-semibold">İşlem Geçmişi</h4>
              {logs.slice(-6).map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-[10px] font-mono bg-black/20 px-2 py-1 rounded"
                >
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    log.variant === 'success' ? 'bg-green-500' :
                    log.variant === 'error' ? 'bg-red-500' : 'bg-indigo-500'
                  }`} />
                  <span className={
                    log.variant === 'success' ? 'text-green-400 w-20 shrink-0' :
                    log.variant === 'error' ? 'text-red-400 w-20 shrink-0' :
                    'text-indigo-400 w-20 shrink-0'
                  }>{log.action}</span>
                  <span className="text-gray-400 flex-1 truncate">{log.result}</span>
                  {log.time > 0 && <span className="text-gray-600 shrink-0">{log.time}ms</span>}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Lock Contention Tab                                                */
/* ------------------------------------------------------------------ */

const threadColors = [
  'bg-cyan-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-rose-500',
  'bg-orange-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500', 'bg-teal-500',
]
const threadTextColors = [
  'text-cyan-400', 'text-indigo-400', 'text-purple-400', 'text-pink-400', 'text-rose-400',
  'text-orange-400', 'text-amber-400', 'text-lime-400', 'text-emerald-400', 'text-teal-400',
]

function ContentionTab() {
  const [lockName, setLockName] = useState('contention-test')
  const [threadCount, setThreadCount] = useState(5)
  const [result, setResult] = useState<ContentionResult | null>(null)
  const [loading, setLoading] = useState(false)

  const WORK_MS = 200

  const runDemo = useCallback(async () => {
    setLoading(true)
    setResult(null)
    try {
      const ts = Date.now()
      const res = await testApi.concurrentLocks(threadCount, lockName + '-' + ts)
      setResult(res.data?.data as ContentionResult)
    } finally { setLoading(false) }
  }, [lockName, threadCount])

  const sortedDetails = result?.details?.slice().sort((a, b) => a.waitTimeMs - b.waitTimeMs) || []
  const maxDuration = sortedDetails.length > 0
    ? Math.max(...sortedDetails.map(d => d.waitTimeMs + (d.acquired ? WORK_MS : 0)), 1)
    : 1

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="glass p-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[120px]">
          <label className="text-[10px] text-gray-500 whitespace-nowrap">Lock:</label>
          <input
            value={lockName}
            onChange={e => setLockName(e.target.value)}
            className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-xs text-white font-mono flex-1"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
          <label className="text-[10px] text-gray-500 whitespace-nowrap">Thread Sayısı:</label>
          <input type="range" min={2} max={10} value={threadCount}
            onChange={e => setThreadCount(Number(e.target.value))} className="flex-1 accent-indigo-500" />
          <span className="text-indigo-400 font-mono text-sm font-bold w-5 text-right">{threadCount}</span>
        </div>
        {/* Thread dots */}
        <div className="flex items-center gap-1">
          {Array.from({ length: threadCount }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-3 h-3 rounded-full ${threadColors[i % threadColors.length]} opacity-60`}
            />
          ))}
        </div>
        <Button onClick={runDemo} loading={loading} size="sm" variant="secondary">
          Yarışmayı Başlat
        </Button>
      </div>

      {/* Pre-run state */}
      <AnimatePresence mode="wait">
        {!result && !loading && (
          <motion.div
            key="pre-run"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass p-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              {Array.from({ length: threadCount }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                  className={`w-9 h-9 rounded-full border-2 ${threadColors[i % threadColors.length].replace('bg-', 'border-')} bg-black/30 flex items-center justify-center`}
                >
                  <span className={`text-[10px] font-mono font-bold ${threadTextColors[i % threadTextColors.length]}`}>
                    T{i + 1}
                  </span>
                </motion.div>
              ))}

              <div className="mx-3 flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg viewBox="0 0 24 24" className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </motion.div>
                <span className="text-[9px] text-red-400 font-mono mt-1">Redis Lock</span>
              </div>
            </div>

            <p className="text-center text-xs text-gray-500">
              <span className="text-indigo-400 font-bold">{threadCount} thread</span> aynı anda aynı kilide koşacak.
              Sadece <span className="text-green-400 font-bold">1 thread</span> kilidi tutabilir, diğerleri sırayla bekler.
            </p>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass p-8 text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              {Array.from({ length: threadCount }).map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ x: [0, 30 + Math.random() * 20, 30 + Math.random() * 20] }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className={`w-6 h-6 rounded-full ${threadColors[i % threadColors.length]} opacity-50 flex items-center justify-center`}
                >
                  <span className="text-[8px] font-mono text-white font-bold">T{i + 1}</span>
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500">Thread'ler kilide koşuyor...</p>
          </motion.div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass p-3 text-center"
              >
                <p className="text-[10px] text-gray-500">Thread Sayısı</p>
                <p className="text-lg font-bold font-mono text-indigo-400">{result.threadCount}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass p-3 text-center"
              >
                <p className="text-[10px] text-gray-500">Kilit Alan</p>
                <p className="text-lg font-bold font-mono text-green-400">
                  {result.acquiredCount}<span className="text-gray-600 text-sm">/{result.threadCount}</span>
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className={`glass p-3 text-center border ${result.mutualExclusion ? 'border-green-500/30' : 'border-red-500/30'}`}
              >
                <p className="text-[10px] text-gray-500">Mutual Exclusion</p>
                <Badge variant={result.mutualExclusion ? 'green' : 'red'}>
                  {result.mutualExclusion ? 'SAĞLANDI' : 'İHLAL EDİLDİ!'}
                </Badge>
              </motion.div>
            </div>

            {/* Gantt chart */}
            <div className="glass p-3 space-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-gray-500 font-semibold">Thread Timeline</span>
                <div className="flex items-center gap-3 text-[9px]">
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-gray-600/40 rounded-sm inline-block" /> WAIT</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-green-500/60 rounded-sm inline-block" /> LOCK</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-500/40 rounded-sm inline-block" /> TIMEOUT</span>
                </div>
              </div>
              {sortedDetails.map((d, i) => {
                const waitPct = (d.waitTimeMs / maxDuration) * 100
                const workPct = d.acquired ? (WORK_MS / maxDuration) * 100 : 0
                const timeoutPct = !d.acquired ? Math.max(5, 100 - waitPct) : 0
                return (
                  <motion.div
                    key={d.threadId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 text-[11px] font-mono"
                  >
                    {/* Thread label */}
                    <div className="flex items-center gap-1 w-12 shrink-0">
                      <div className={`w-2 h-2 rounded-full ${threadColors[d.threadId % threadColors.length]}`} />
                      <span className="text-gray-400">T{d.threadId}</span>
                    </div>

                    {/* Bar */}
                    <div className="flex-1 h-5 bg-black/20 rounded overflow-hidden flex">
                      {waitPct > 0 && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${waitPct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.06 }}
                          className="h-full bg-gray-600/40 flex items-center justify-center"
                        >
                          {waitPct > 12 && <span className="text-[8px] text-gray-400">WAIT</span>}
                        </motion.div>
                      )}
                      {d.acquired && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${workPct}%` }}
                          transition={{ duration: 0.4, delay: i * 0.06 + 0.3 }}
                          className="h-full bg-gradient-to-r from-green-500/60 to-green-400/40 flex items-center justify-center relative overflow-hidden"
                        >
                          {workPct > 8 && <span className="text-[8px] text-green-200 relative z-10">LOCK</span>}
                          {/* Shimmer */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                          />
                        </motion.div>
                      )}
                      {!d.acquired && (
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${timeoutPct}%` }}
                          transition={{ duration: 0.4, delay: i * 0.06 + 0.3 }}
                          className="h-full bg-red-500/30 flex items-center justify-center"
                        >
                          <span className="text-[8px] text-red-300">TIMEOUT</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Status */}
                    <span className={`w-8 shrink-0 text-center ${d.acquired ? 'text-green-400' : 'text-red-400'}`}>
                      {d.acquired ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-600 w-12 text-right shrink-0">{d.waitTimeMs}ms</span>
                  </motion.div>
                )
              })}
              {/* Time axis */}
              <div className="flex items-center gap-2 mt-1 ml-14">
                <div className="flex-1 flex justify-between text-[8px] text-gray-700">
                  <span>0ms</span>
                  <span>{Math.round(maxDuration / 4)}ms</span>
                  <span>{Math.round(maxDuration / 2)}ms</span>
                  <span>{Math.round(maxDuration * 3 / 4)}ms</span>
                  <span>{Math.round(maxDuration)}ms</span>
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="glass p-3 border border-indigo-500/15 text-[11px] text-gray-500 leading-relaxed">
              <span className="text-indigo-400 font-semibold">Ne Görüyoruz?</span>{' '}
              Her thread aynı anda <span className="text-white font-mono">tryLock()</span> çağırır.
              Redis'in <span className="text-amber-400">single-threaded</span> yapısı sayesinde sadece 1 thread kilidi alabilir.
              Diğerleri sırayla bekler (WAIT) ve sırası gelince kilidi alır.
              Wait timeout içinde kilit alınamazsa <span className="text-red-400">TIMEOUT</span> olur.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function LockDemoSlide() {
  return (
    <div className="space-y-4">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Canlı Demo: Distributed Lock
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs tabs={[
          { label: 'Kilit Yaşam Döngüsü', content: <LifecycleTab /> },
          { label: 'Kilit Yarışması', content: <ContentionTab /> },
        ]} />
      </motion.div>
    </div>
  )
}
