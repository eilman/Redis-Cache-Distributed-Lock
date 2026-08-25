import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { resilienceApi } from '../../api/cacheApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import ActionButton from '../shared/ActionButton'
import StatusBadge from '../shared/StatusBadge'
import LogStream, { LogEntry } from '../shared/LogStream'
import ComparisonPanel from '../shared/ComparisonPanel'
import MiniCodeBlock from '../shared/MiniCodeBlock'
import CircuitBreakerDiagram from '../visualizations/CircuitBreakerDiagram'
import CircuitBreakerFlowDiagram from '../visualizations/CircuitBreakerFlowDiagram'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

type CBState = 'CLOSED' | 'OPEN' | 'HALF_OPEN'

export default function ResilienceSection() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()

  /* ---- local state ---- */
  const [redisStatus, setRedisStatus] = useState<'healthy' | 'down'>('healthy')
  const [cbState, setCbState] = useState<CBState>('CLOSED')
  const [apiStatus, setApiStatus] = useState<'healthy' | 'degraded' | 'down'>('healthy')

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadingStep, setLoadingStep] = useState<number | null>(null)

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

  /* ---- step handlers ---- */

  // 1. Redis'i Çökert
  const handleCrash = async () => {
    setLoadingStep(1)
    try {
      const start = performance.now()
      const res = await resilienceApi.simulateFailure(5)
      const ms = Math.round(performance.now() - start)
      setRedisStatus('down')
      setCbState('OPEN')
      setApiStatus('degraded')
      pushLog('SIMULATE_FAILURE', res.data?.message ?? 'Redis çökertildi', 'error', ms)
      addLog('resilience', 'error', 'Redis çökertildi - Circuit Breaker OPEN', ms)
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('SIMULATE_FAILURE', `HATA: ${msg}`, 'error')
      // Still update statuses for demo purposes
      setRedisStatus('down')
      setCbState('OPEN')
      setApiStatus('degraded')
    } finally {
      setLoadingStep(null)
    }
  }

  // 2. Fail-Open: Sipariş Ver
  const handleFailOpen = async () => {
    setLoadingStep(2)
    try {
      const start = performance.now()
      const res = await resilienceApi.failOpen(1)
      const ms = Math.round(performance.now() - start)
      const data = res.data
      pushLog(
        'FAIL_OPEN',
        data?.source
          ? `Basarili (kaynak: ${data.source}) - DB fallback ile devam edildi`
          : 'Sipariş işlendi (DB fallback)',
        'success',
        ms,
      )
      addLog('resilience', 'success', 'Fail-Open: DB fallback ile sipariş işlendi', ms)
      incrementMetric('totalRequests')
      setCbState('HALF_OPEN')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('FAIL_OPEN', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  // 3. Fail-Close: Sipariş Ver
  const handleFailClose = async () => {
    setLoadingStep(3)
    try {
      const start = performance.now()
      const res = await resilienceApi.failClose(1)
      const ms = Math.round(performance.now() - start)
      const data = res.data
      pushLog(
        'FAIL_CLOSE',
        data?.error ?? 'Sipariş REDDEDİLDİ - güvenlik öncelikli',
        'error',
        ms,
      )
      addLog('resilience', 'error', 'Fail-Close: Sipariş reddedildi', ms)
      incrementMetric('totalRequests')
    } catch (err: unknown) {
      // Fail-close is expected to reject — that's the point
      const ms = Math.round(performance.now())
      pushLog('FAIL_CLOSE', 'Sipariş REDDEDİLDİ - ServiceUnavailableException', 'error', undefined)
      addLog('resilience', 'error', 'Fail-Close: İstek reddedildi (503)', undefined)
      incrementMetric('totalRequests')
    } finally {
      setLoadingStep(null)
    }
  }

  // 4. Sistemi Onar
  const handleReset = async () => {
    setLoadingStep(4)
    try {
      const start = performance.now()
      await resilienceApi.reset()
      const ms = Math.round(performance.now() - start)
      setRedisStatus('healthy')
      setCbState('CLOSED')
      setApiStatus('healthy')
      pushLog('RESET', 'Sistem tamamen onarıldı', 'success', ms)
      addLog('resilience', 'success', 'Sistem onarıldı - Circuit Breaker CLOSED', ms)
      markCompleted('resilience')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('RESET', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  /* ---- status helpers ---- */
  const redisColor =
    redisStatus === 'healthy' ? 'border-green-500/30' : 'border-red-500/30'
  const redisBg =
    redisStatus === 'healthy' ? 'bg-green-500/5' : 'bg-red-500/5'
  const cbColor =
    cbState === 'CLOSED'
      ? 'border-green-500/30'
      : cbState === 'OPEN'
        ? 'border-red-500/30'
        : 'border-amber-500/30'
  const cbBg =
    cbState === 'CLOSED'
      ? 'bg-green-500/5'
      : cbState === 'OPEN'
        ? 'bg-red-500/5'
        : 'bg-amber-500/5'
  const apiColor =
    apiStatus === 'healthy'
      ? 'border-green-500/30'
      : apiStatus === 'degraded'
        ? 'border-amber-500/30'
        : 'border-red-500/30'
  const apiBg =
    apiStatus === 'healthy'
      ? 'bg-green-500/5'
      : apiStatus === 'degraded'
        ? 'bg-amber-500/5'
        : 'bg-red-500/5'

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* -------- Scenario Description -------- */}
      <motion.div
        variants={item}
        className="glass p-4 border border-green-500/20 bg-green-500/5 rounded-xl"
      >
        <h3 className="text-sm font-bold text-green-400 mb-1">Senaryo: Redis Çökme Aninda Sipariş Akışı</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Peak saatte Redis sunucusu çöktü.{' '}
          <span className="text-amber-400 font-semibold">50.000</span> aktif kullanıcı siparişte.
          Circuit Breaker devreye giriyor — fail-open mi, fail-close mu? Hangisi ne zaman kullanılır?
        </p>
      </motion.div>

      {/* -------- System Status Panel (3 cards) -------- */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {/* Redis */}
        <div className={`glass p-3 rounded-xl border ${redisColor} ${redisBg} text-center`}>
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
            </svg>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Redis</span>
          </div>
          <StatusBadge
            type={redisStatus === 'healthy' ? 'OK' : 'ERROR'}
            label={redisStatus === 'healthy' ? 'Sağlıklı' : 'Çöktü'}
          />
        </div>

        {/* Circuit Breaker */}
        <div className={`glass p-3 rounded-xl border ${cbColor} ${cbBg} text-center`}>
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">Circuit Breaker</span>
          </div>
          <StatusBadge
            type={cbState === 'CLOSED' ? 'OK' : cbState === 'OPEN' ? 'ERROR' : 'WAITING'}
            label={cbState}
          />
        </div>

        {/* API */}
        <div className={`glass p-3 rounded-xl border ${apiColor} ${apiBg} text-center`}>
          <div className="flex items-center justify-center gap-1.5 mb-1.5">
            <svg className="w-4 h-4 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
            </svg>
            <span className="text-[10px] text-gray-400 uppercase font-semibold">API</span>
          </div>
          <StatusBadge
            type={apiStatus === 'healthy' ? 'OK' : apiStatus === 'degraded' ? 'WAITING' : 'ERROR'}
            label={apiStatus === 'healthy' ? 'Sağlıklı' : apiStatus === 'degraded' ? 'Düşük Performans' : 'Çöktü'}
          />
        </div>
      </motion.div>

      {/* -------- Step-by-Step Demo (4 buttons) -------- */}
      <motion.div variants={item} className="glass p-4 rounded-xl space-y-3">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
          Adım Adım Demo
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            variant="danger"
            onClick={handleCrash}
            loading={loadingStep === 1}
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            }
          >
            1. Redis'i Çökert
          </ActionButton>

          <ActionButton
            variant="warning"
            onClick={handleFailOpen}
            loading={loadingStep === 2}
            disabled={redisStatus === 'healthy'}
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          >
            2. Fail-Open: Sipariş Ver
          </ActionButton>

          <ActionButton
            variant="danger"
            onClick={handleFailClose}
            loading={loadingStep === 3}
            disabled={redisStatus === 'healthy'}
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            }
          >
            3. Fail-Close: Sipariş Ver
          </ActionButton>

          <ActionButton
            variant="success"
            onClick={handleReset}
            loading={loadingStep === 4}
            disabled={redisStatus === 'healthy'}
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            }
          >
            4. Sistemi Onar
          </ActionButton>
        </div>
      </motion.div>

      {/* -------- Circuit Breaker Diagram -------- */}
      <motion.div variants={item}>
        <CircuitBreakerDiagram state={cbState} />
      </motion.div>

      {/* -------- Ecommerce Flow Diagram -------- */}
      <motion.div variants={item} className="glass p-4 rounded-xl">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">
          Redis Hata Durumunda İstek Akışı
        </h4>
        <CircuitBreakerFlowDiagram />
      </motion.div>

      {/* -------- Fail-Open vs Fail-Close Comparison -------- */}
      <motion.div variants={item}>
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">
          Fail-Open vs Fail-Close Karşılaştırması
        </h4>
        <ComparisonPanel
          leftTitle="Fail-Close (Güvenlik Öncelikli)"
          rightTitle="Fail-Open (Kullanılabilirlik Öncelikli)"
          leftMetrics={[
            { label: 'Strateji', value: 'Güvenlik öncelikli' },
            { label: 'Redis cokerse', value: 'Siparişi REDDEDER' },
            { label: 'Kullanim alani', value: 'Ödeme, stok azaltma' },
          ]}
          rightMetrics={[
            { label: 'Strateji', value: 'Kullanılabilirlik öncelikli' },
            { label: 'Redis cokerse', value: "DB'den devam eder" },
            { label: 'Kullanim alani', value: 'Sepet, ürün listeleme' },
          ]}
        />
      </motion.div>

      {/* -------- Code Block -------- */}
      <motion.div variants={item}>
        <MiniCodeBlock
          language="java"
          code={`if (redis.isDown()) {
  if (failStrategy == "OPEN")
    return db.query(key);  // fallback
  else
    throw new ServiceUnavailableException();
}`}
        />
      </motion.div>

      {/* -------- Log Stream -------- */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}
