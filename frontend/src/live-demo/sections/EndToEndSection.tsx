import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { patternApi } from '../../api/cacheApi'
import { lockApi, redlockApi } from '../../api/lockApi'
import { useLiveDemo } from '../context/LiveDemoContext'
import { e2eSteps } from '../data/mockData'
import ActionButton from '../shared/ActionButton'
import StatusBadge from '../shared/StatusBadge'
import LogStream, { LogEntry } from '../shared/LogStream'
import MiniCodeBlock from '../shared/MiniCodeBlock'
import OrderFlowDiagram from '../visualizations/OrderFlowDiagram'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const PRODUCT_ID = 2 // MacBook Pro M4
const PRODUCT_NAME = 'MacBook Pro M4'
const PRODUCT_PRICE = 74999.99

/* ---- Step config ---- */
interface StepResult {
  success: boolean
  message: string
  detail?: string
}

const redisCommands: Record<number, string> = {
  0: 'GET product:2\n// MISS ise:\nSELECT * FROM products WHERE id=2\nSET product:2 <json> EX 300',
  1: 'GET product:2\n// Read-Through: cache katmani otomatik doldurur',
  2: 'HSET cart:session:abc product:2 1\nEXPIRE cart:session:abc 1800',
  3: 'SET inventory:product:2 <uuid> NX PX 10000',
  4: 'REDLOCK: SET payment:order:1001 <uuid> NX PX 30000\n// 5 node uzerinde quorum ile',
  5: 'PUBLISH order:completed {orderId: 1001}\nINCR metrics:ordersProcessed',
}

export default function EndToEndSection() {
  const { addLog, incrementMetric, markCompleted, addToCart, e2eProgress, setE2eProgress, globalMetrics } = useLiveDemo()

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadingStep, setLoadingStep] = useState<number | null>(null)
  const [stepResults, setStepResults] = useState<Record<number, StepResult>>({})
  const [showCelebration, setShowCelebration] = useState(false)

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

  const setResult = (step: number, result: StepResult) => {
    setStepResults((prev) => ({ ...prev, [step]: result }))
  }

  /* ---- Step handlers ---- */

  const handleStep0 = async () => {
    setLoadingStep(0)
    try {
      const start = performance.now()
      const res = await patternApi.cacheAside(PRODUCT_ID)
      const ms = Math.round(performance.now() - start)
      const meta = res.data?.metadata
      const src = meta?.source === 'CACHE' ? 'HIT' : 'MISS'

      setResult(0, { success: true, message: `Cache ${src}`, detail: `${PRODUCT_NAME} bulundu (${ms}ms)` })
      incrementMetric('totalRequests')
      incrementMetric(src === 'HIT' ? 'cacheHits' : 'cacheMisses')
      pushLog('Ürün Arama', `${src} - ${PRODUCT_NAME} (${ms}ms)`, src === 'HIT' ? 'hit' : 'miss', ms)
      addLog('e2e-flow', src === 'HIT' ? 'hit' : 'miss', `Ürün arama: ${PRODUCT_NAME} ${src}`, ms)
      setE2eProgress(1)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(0, { success: false, message: 'Hata', detail: msg })
      pushLog('Ürün Arama', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const handleStep1 = async () => {
    setLoadingStep(1)
    try {
      const start = performance.now()
      const res = await patternApi.readThrough(PRODUCT_ID)
      const ms = Math.round(performance.now() - start)
      const data = res.data?.data
      const meta = res.data?.metadata
      const src = meta?.source === 'CACHE' ? 'HIT' : 'MISS'

      const name = data?.name ?? PRODUCT_NAME
      const price = data?.price ?? PRODUCT_PRICE
      setResult(1, {
        success: true,
        message: `${name}`,
        detail: `${Number(price).toLocaleString('tr-TR')} TL - ${src} (${ms}ms)`,
      })
      incrementMetric('totalRequests')
      incrementMetric(src === 'HIT' ? 'cacheHits' : 'cacheMisses')
      pushLog('Ürün Detay', `${name} - ${Number(price).toLocaleString('tr-TR')} TL (${src})`, src === 'HIT' ? 'hit' : 'miss', ms)
      addLog('e2e-flow', 'info', `Read-Through: ${name}`, ms)
      setE2eProgress(2)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(1, { success: false, message: 'Hata', detail: msg })
      pushLog('Ürün Detay', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const handleStep2 = async () => {
    setLoadingStep(2)
    try {
      addToCart({ id: PRODUCT_ID, name: PRODUCT_NAME, price: PRODUCT_PRICE })
      setResult(2, {
        success: true,
        message: 'Sepete eklendi',
        detail: `${PRODUCT_NAME} (${PRODUCT_PRICE.toLocaleString('tr-TR')} TL)`,
      })
      pushLog('Sepete Ekle', `${PRODUCT_NAME} sepete eklendi`, 'success')
      addLog('e2e-flow', 'success', `Sepete eklendi: ${PRODUCT_NAME}`)
      setE2eProgress(3)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(2, { success: false, message: 'Hata', detail: msg })
      pushLog('Sepete Ekle', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const handleStep3 = async () => {
    setLoadingStep(3)
    try {
      const start = performance.now()
      const res = await lockApi.acquire(`inventory:product:${PRODUCT_ID}`, 10000)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      const acquired = data?.locked ?? data?.success ?? false
      if (acquired) {
        setResult(3, { success: true, message: 'Stok kilitlendi', detail: `Envanter kilidi alındı (${ms}ms)` })
        pushLog('Stok Kontrol', `Envanter kilidi alındı (${ms}ms)`, 'lock', ms)
        addLog('e2e-flow', 'lock', `Stok kilidi: inventory:product:${PRODUCT_ID}`, ms)
      } else {
        setResult(3, { success: false, message: 'Kilit alınamadı', detail: data?.message ?? 'Stok zaten kilitli' })
        pushLog('Stok Kontrol', 'Kilit alınamadı', 'error', ms)
      }
      incrementMetric('totalRequests')
      setE2eProgress(4)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(3, { success: false, message: 'Hata', detail: msg })
      pushLog('Stok Kontrol', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const handleStep4 = async () => {
    setLoadingStep(4)
    try {
      const start = performance.now()
      const res = await redlockApi.acquire('payment:order:1001', 30000)
      const ms = Math.round(performance.now() - start)
      const data = res.data

      const acquired = data?.locked ?? data?.success ?? false
      if (acquired) {
        setResult(4, { success: true, message: 'Ödeme kilidi alındı', detail: `Redlock ile güvenli ödeme (${ms}ms)` })
        pushLog('Ödeme', `Redlock kilidi alındı (${ms}ms)`, 'lock', ms)
        addLog('e2e-flow', 'lock', 'Redlock: payment:order:1001', ms)
      } else {
        setResult(4, { success: false, message: 'Ödeme başarısız', detail: data?.message ?? 'Quorum sağlanamadı' })
        pushLog('Ödeme', 'Redlock başarısız', 'error', ms)
      }
      incrementMetric('totalRequests')
      setE2eProgress(5)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(4, { success: false, message: 'Hata', detail: msg })
      pushLog('Ödeme', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const handleStep5 = async () => {
    setLoadingStep(5)
    try {
      incrementMetric('ordersProcessed')
      setResult(5, {
        success: true,
        message: 'SİPARİŞ onaylandı!',
        detail: `SİPARİŞ #1001 - ${PRODUCT_NAME} - ${PRODUCT_PRICE.toLocaleString('tr-TR')} TL`,
      })
      pushLog('SİPARİŞ Onay', `SİPARİŞ #1001 tamamlandı`, 'success')
      addLog('e2e-flow', 'success', `SİPARİŞ onaylandı: #1001 - ${PRODUCT_NAME}`)
      setE2eProgress(6)
      markCompleted('e2e-flow')
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setResult(5, { success: false, message: 'Hata', detail: msg })
      pushLog('SİPARİŞ Onay', `HATA: ${msg}`, 'error')
    } finally {
      setLoadingStep(null)
    }
  }

  const stepHandlers = [handleStep0, handleStep1, handleStep2, handleStep3, handleStep4, handleStep5]

  const stepButtonLabels = ['Ürün Ara', 'Detay Görüntüle', 'Sepete Ekle', 'Stok Kontrol', 'Ode', 'SİPARİŞi Onayla']

  const handleReset = () => {
    setE2eProgress(0)
    setStepResults({})
    setLogs([])
    setShowCelebration(false)
  }

  const currentStep = Math.min(e2eProgress, 5)
  const allCompleted = e2eProgress >= 6

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-5">
      {/* Scenario Card */}
      <motion.div
        variants={item}
        className="glass p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-xl"
      >
        <h3 className="text-sm font-bold text-emerald-400 mb-1">Senaryo: Uç Uca SİPARİŞ AKIŞI</h3>
        <p className="text-xs text-gray-400 leading-relaxed">
          Bir müşterinin <span className="text-emerald-300 font-semibold">TechMart</span>'a girip sipariş
          tamamlamasina kadar <span className="text-amber-400 font-semibold">tüm adımlar</span>. Her
          adımda farklı bir Redis pattern devreye girer.
        </p>
      </motion.div>

      {/* Order Flow Diagram */}
      <motion.div variants={item}>
        <OrderFlowDiagram
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step <= e2eProgress && step <= 5) {
              // Allow viewing completed steps
            }
          }}
        />
      </motion.div>

      {/* Celebration Animation */}
      {showCelebration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'][i % 6],
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: (Math.random() - 0.5) * 500,
                y: (Math.random() - 0.5) * 500,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}

      {/* Step Detail Panel */}
      {!allCompleted && (
        <motion.div variants={item} className="glass p-4 rounded-xl space-y-3">
          {/* Step Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <span className="text-sm font-bold text-emerald-400">{currentStep + 1}</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{e2eSteps[currentStep].label}</h4>
                <p className="text-[11px] text-gray-500">{e2eSteps[currentStep].desc}</p>
              </div>
            </div>
            <StatusBadge
              type="OK"
              label={e2eSteps[currentStep].redis}
            />
          </div>

          {/* Action Button */}
          <ActionButton
            variant="primary"
            onClick={stepHandlers[currentStep]}
            loading={loadingStep === currentStep}
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
              </svg>
            }
          >
            {stepButtonLabels[currentStep]}
          </ActionButton>

          {/* Step Result */}
          {stepResults[currentStep] && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-lg border ${
                stepResults[currentStep].success
                  ? 'border-green-500/20 bg-green-500/5'
                  : 'border-red-500/20 bg-red-500/5'
              }`}
            >
              <p className={`text-xs font-semibold ${stepResults[currentStep].success ? 'text-green-400' : 'text-red-400'}`}>
                {stepResults[currentStep].message}
              </p>
              {stepResults[currentStep].detail && (
                <p className="text-[11px] text-gray-400 mt-0.5">{stepResults[currentStep].detail}</p>
              )}
            </motion.div>
          )}

          {/* Redis Command */}
          <MiniCodeBlock language="redis" code={redisCommands[currentStep]} />
        </motion.div>
      )}

      {/* Completion Summary */}
      {allCompleted && (
        <motion.div
          variants={item}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4"
        >
          <div className="text-center space-y-2">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center"
            >
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </motion.div>
            <h3 className="text-lg font-bold text-emerald-400">SİPARİŞ Tamamlandı!</h3>
            <p className="text-xs text-gray-400">
              Tüm Redis pattern'leri başarıyla uygulandi.
            </p>
          </div>

          {/* Summary Metrics */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-[9px] text-gray-500 uppercase">Toplam İstek</p>
              <p className="text-lg font-bold font-mono text-cyan-400">{globalMetrics.totalRequests}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-[9px] text-gray-500 uppercase">Cache Hit</p>
              <p className="text-lg font-bold font-mono text-green-400">{globalMetrics.cacheHits}</p>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <p className="text-[9px] text-gray-500">SİPARİŞ</p>
              <p className="text-lg font-bold font-mono text-emerald-400">{globalMetrics.ordersProcessed}</p>
            </div>
          </div>

          {/* Completed Steps Summary */}
          <div className="space-y-1.5">
            {e2eSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <svg className="w-3.5 h-3.5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span className="text-gray-300">{step.label}</span>
                <span className="text-gray-600 flex-1 border-b border-dotted border-gray-800" />
                <span className="text-[10px] font-mono text-gray-500">{step.redis}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Reset Button */}
      <motion.div variants={item}>
        <ActionButton
          variant="warning"
          onClick={handleReset}
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
          }
        >
          Baştan Başlat
        </ActionButton>
      </motion.div>

      {/* Log Stream */}
      <motion.div variants={item}>
        <LogStream logs={logs} onClear={() => setLogs([])} />
      </motion.div>
    </motion.div>
  )
}
