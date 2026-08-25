import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Button from '../../components/ui/Button'
import { patternApi, cacheApi } from '../../api/cacheApi'

type PatternType = 'cache-aside' | 'read-through' | 'write-through'

interface LogEntry {
  step: number
  action: string
  result: string
  durationMs: number
}

interface DemoResult {
  cacheHit: boolean | null
  action: 'READ' | 'WRITE' | 'DELETE'
  product: Record<string, unknown> | null
  logs: LogEntry[]
  executionTimeMs: number | null
  source: string | null
}

const patternTabs: { label: string; value: PatternType; desc: string; color: string; bg: string }[] = [
  { label: 'Cache-Aside', value: 'cache-aside', desc: 'App cache\'i kontrol eder → MISS ise DB\'den okur → Cache\'e yazar', color: 'text-indigo-400 border-indigo-400', bg: 'bg-indigo-600 text-white border-indigo-500' },
  { label: 'Read-Through', value: 'read-through', desc: 'Cache katmani MISS durumunda otomatik DB\'den okur', color: 'text-cyan-400 border-cyan-400', bg: 'bg-cyan-600 text-white border-cyan-500' },
  { label: 'Write-Through', value: 'write-through', desc: 'Yazma işlemi cache + DB\'ye eş zamanlı yapılır', color: 'text-green-400 border-green-400', bg: 'bg-green-600 text-white border-green-500' },
]

export default function PatternDemoSlide() {
  const [pattern, setPattern] = useState<PatternType>('cache-aside')
  const [productId, setProductId] = useState(1)
  const [productName, setProductName] = useState('Redis Kitabi')
  const [productPrice, setProductPrice] = useState(49.99)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DemoResult | null>(null)

  const parseResponse = (res: { data?: { logs?: LogEntry[]; data?: unknown; metadata?: Record<string, unknown> } }, action: DemoResult['action']): DemoResult => {
    const d = res.data
    const logs = d?.logs || []
    const hit = logs.some(l => l.result?.includes('HIT'))
    const data = d?.data as Record<string, unknown> | null
    return {
      cacheHit: action === 'READ' ? hit : null,
      action,
      product: data,
      logs,
      executionTimeMs: (d?.metadata?.executionTimeMs as number) || null,
      source: (d?.metadata?.source as string) || (data?.source as string) || null,
    }
  }

  const handleRead = async () => {
    setLoading(true)
    try {
      const res = pattern === 'read-through'
        ? await patternApi.readThrough(productId)
        : await patternApi.cacheAside(productId)
      setResult(parseResponse(res, 'READ'))
    } catch {
      setResult({ cacheHit: null, action: 'READ', product: null, logs: [{ step: 0, action: 'ERROR', result: 'Bağlantı hatası', durationMs: 0 }], executionTimeMs: null, source: null })
    } finally {
      setLoading(false)
    }
  }

  const handleWrite = async () => {
    setLoading(true)
    try {
      const res = await patternApi.writeThrough(productId, { name: productName, price: productPrice })
      setResult(parseResponse(res, 'WRITE'))
    } catch {
      setResult({ cacheHit: null, action: 'WRITE', product: null, logs: [{ step: 0, action: 'ERROR', result: 'Bağlantı hatası', durationMs: 0 }], executionTimeMs: null, source: null })
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    setLoading(true)
    try {
      await cacheApi.deleteKey(`product:${productId}`)
      setResult({
        cacheHit: null,
        action: 'DELETE',
        product: null,
        logs: [{ step: 1, action: 'DEL', result: `product:${productId} cache silindi`, durationMs: 0 }],
        executionTimeMs: null,
        source: 'DELETED',
      })
    } catch {
      setResult({ cacheHit: null, action: 'DELETE', product: null, logs: [{ step: 0, action: 'ERROR', result: 'Silme hatası', durationMs: 0 }], executionTimeMs: null, source: null })
    } finally {
      setLoading(false)
    }
  }

  const isWrite = pattern === 'write-through'
  const tab = patternTabs.find(t => t.value === pattern)!

  return (
    <div className="space-y-3">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient text-center">
        Canlı Demo: Cache Pattern'leri
      </motion.h2>

      {/* Pattern tabs */}
      <div className="flex justify-center border-b border-white/5">
        {patternTabs.map(t => (
          <button
            key={t.value}
            onClick={() => { setPattern(t.value); setResult(null) }}
            className={`px-4 py-1.5 text-xs font-bold border-b-2 -mb-px transition-all ${
              pattern === t.value ? t.color : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <motion.div key={pattern} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-2 text-center border border-amber-500/15">
        <p className="text-xs text-gray-400">{tab.desc}</p>
      </motion.div>

      {/* 2-column layout */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left: Controls */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-3">
          {/* Product form */}
          <div className="glass p-3 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ürün Bilgileri</h3>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 w-12">ID</label>
              <input
                type="number" value={productId} onChange={e => setProductId(Number(e.target.value))} min={1} max={100}
                className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40"
              />
            </div>

            <AnimatePresence>
              {isWrite && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="space-y-2 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12">İsim</label>
                    <input
                      value={productName} onChange={e => setProductName(e.target.value)}
                      className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500 w-12">Fiyat</label>
                    <input
                      type="number" value={productPrice} onChange={e => setProductPrice(Number(e.target.value))} step={0.01}
                      className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-sm text-white font-mono focus:outline-none focus:border-cyan-500/40"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {!isWrite && (
              <Button onClick={handleRead} loading={loading} size="sm">
                Oku (GET)
              </Button>
            )}
            {isWrite && (
              <>
                <Button onClick={handleWrite} loading={loading} size="sm">
                  Yaz (Cache+DB)
                </Button>
                <Button onClick={handleRead} variant="secondary" loading={loading} size="sm">
                  Oku (Doğrula)
                </Button>
              </>
            )}
            <Button onClick={handleClear} variant="danger" loading={loading} size="sm">
              Cache Sil
            </Button>
          </div>

          {/* Scenario guide */}
          <div className="glass p-2 border border-cyan-500/10">
            <p className="text-[10px] text-cyan-400 font-semibold mb-1">Deneyin:</p>
            {isWrite ? (
              <ol className="text-[10px] text-gray-500 space-y-0.5 list-decimal list-inside">
                <li>Ürün bilgilerini değiştirin</li>
                <li><span className="text-green-400">Yaz</span> ile cache+DB'ye kaydedin</li>
                <li><span className="text-indigo-400">Oku</span> ile cache'den doğrulayın</li>
              </ol>
            ) : (
              <ol className="text-[10px] text-gray-500 space-y-0.5 list-decimal list-inside">
                <li><span className="text-red-400">Cache Sil</span> ile cache'i temizleyin</li>
                <li><span className="text-cyan-400">Oku</span> — <span className="text-amber-400">MISS</span> (DB'den gelir)</li>
                <li>Tekrar <span className="text-cyan-400">Oku</span> — <span className="text-green-400">HIT</span> (cache'den gelir!)</li>
              </ol>
            )}
          </div>
        </motion.div>

        {/* Right: Results */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass p-3">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div key={`result-${Date.now()}`} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {/* Status badge row */}
                <div className="flex items-center justify-between">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      result.action === 'DELETE' ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500/30' :
                      result.action === 'WRITE' ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' :
                      result.cacheHit ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30' :
                      'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      result.action === 'DELETE' ? 'bg-red-400' :
                      result.action === 'WRITE' ? 'bg-green-400' :
                      result.cacheHit ? 'bg-green-400' : 'bg-amber-400'
                    }`} />
                    {result.action === 'DELETE' ? 'SILINDI' :
                     result.action === 'WRITE' ? 'YAZILDI' :
                     result.cacheHit ? 'CACHE HIT' : 'CACHE MISS'}
                  </motion.span>
                  {result.executionTimeMs != null && (
                    <span className="text-xs text-gray-500 font-mono">{result.executionTimeMs}ms</span>
                  )}
                </div>

                {/* Source indicator */}
                {result.source && result.action === 'READ' && (
                  <div className="flex gap-2">
                    {['CACHE', 'DB'].map(s => (
                      <div key={s} className={`flex-1 text-center py-1 rounded text-[10px] font-bold border ${
                        (result.cacheHit && s === 'CACHE') || (!result.cacheHit && s === 'DB')
                          ? s === 'CACHE' ? 'bg-green-500/15 text-green-400 border-green-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-white/3 text-gray-600 border-white/5'
                      }`}>
                        {s === 'CACHE' ? 'Redis Cache' : 'PostgreSQL'}
                      </div>
                    ))}
                  </div>
                )}

                {/* Product card */}
                {result.product && (
                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="bg-black/30 rounded-lg p-2.5 border border-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {(result.product.name as string) || `Product #${productId}`}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                          id: {(result.product.id as number) || productId}
                          {result.product.category ? ` | ${String(result.product.category)}` : ''}
                        </p>
                      </div>
                      {result.product.price != null && (
                        <span className="text-lg font-bold text-cyan-400 font-mono">
                          ${Number(result.product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step logs */}
                {result.logs.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="text-[10px] text-gray-600 uppercase tracking-wide">İşlem Adımları</h4>
                    {result.logs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="flex items-center gap-2 text-[11px] font-mono bg-black/20 px-2 py-1 rounded"
                      >
                        <span className="text-gray-600 w-4">#{log.step}</span>
                        <span className="text-cyan-400 min-w-[80px]">{log.action}</span>
                        <span className={`flex-1 truncate ${
                          log.result.includes('HIT') || log.result.includes('OK') || log.result.includes('FOUND') || log.result.includes('SUCCESS')
                            ? 'text-green-400'
                            : log.result.includes('MISS') || log.result.includes('ERROR')
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {log.result}
                        </span>
                        {log.durationMs > 0 && <span className="text-gray-600 text-[10px]">{log.durationMs}ms</span>}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 text-gray-600"
              >
                <svg className="w-8 h-8 mb-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <p className="text-xs">Soldaki butonlarla işlem başlatın</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
