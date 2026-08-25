import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useLiveDemo } from '../context/LiveDemoContext'
import { patternApi, cacheApi } from '../../api/cacheApi'
import { products } from '../data/mockData'
import Tabs from '../../components/ui/Tabs'
import ActionButton from '../shared/ActionButton'
import StatusBadge from '../shared/StatusBadge'
import LogStream, { LogEntry } from '../shared/LogStream'
import CachePatternFlowDiagram from '../visualizations/CachePatternFlowDiagram'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }

/* ---------- Product Selector ---------- */
function ProductSelector({ value, onChange }: { value: number; onChange: (id: number) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-cyan-500/20 bg-black/30 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-cyan-400/50"
    >
      {products.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name} - {p.price.toLocaleString('tr-TR')} TL
        </option>
      ))}
    </select>
  )
}

/* ---------- Product Result Card ---------- */
function ProductCard({ data }: { data: { name: string; price: number; category: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass p-3 rounded-xl space-y-1"
    >
      <p className="text-sm font-semibold text-white">{data.name}</p>
      <p className="text-xs text-cyan-400 font-mono">{Number(data.price).toLocaleString('tr-TR')} TL</p>
      <p className="text-[10px] text-gray-500">{data.category}</p>
    </motion.div>
  )
}

/* ============================================================
   Tab 1: Cache-Aside
   ============================================================ */
function CacheAsideTab() {
  const { addLog, incrementMetric, markCompleted } = useLiveDemo()
  const [productId, setProductId] = useState(products[0].id)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [source, setSource] = useState<'HIT' | 'MISS' | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const pushLog = useCallback((action: string, res: string, type: LogEntry['type'], latencyMs?: number) => {
    setLogs((prev) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, result: res, type, latencyMs }, ...prev])
  }, [])

  const handleRead = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patternApi.cacheAside(productId)
      const data = res.data?.data
      const meta = res.data?.metadata
      const src = meta?.source === 'CACHE' ? 'HIT' : 'MISS'
      setResult(data)
      setSource(src as 'HIT' | 'MISS')
      incrementMetric('totalRequests')
      incrementMetric(src === 'HIT' ? 'cacheHits' : 'cacheMisses')
      pushLog('Cache-Aside GET', `${src} (${meta?.executionTimeMs ?? '-'}ms)`, src === 'HIT' ? 'hit' : 'miss', meta?.executionTimeMs)
      addLog('cache-patterns', src === 'HIT' ? 'hit' : 'miss', `Product #${productId} ${src}`, meta?.executionTimeMs)
      markCompleted('cache-patterns')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('Cache-Aside GET', `HATA: ${msg}`, 'error')
      addLog('cache-patterns', 'error', msg)
    } finally {
      setLoading(false)
    }
  }, [productId, addLog, incrementMetric, markCompleted, pushLog])

  const handleClear = useCallback(async () => {
    setLoading(true)
    try {
      await cacheApi.deleteKey(`product:${productId}`)
      pushLog('Cache DELETE', `product:${productId} silindi`, 'info')
      addLog('cache-patterns', 'info', `Cache key silindi: product:${productId}`)
      setSource(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('Cache DELETE', `HATA: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [productId, addLog, pushLog])

  const handleTripleRead = useCallback(async () => {
    setLoading(true)
    for (let i = 0; i < 3; i++) {
      try {
        const res = await patternApi.cacheAside(productId)
        const meta = res.data?.metadata
        const src = meta?.source === 'CACHE' ? 'HIT' : 'MISS'
        setResult(res.data?.data)
        setSource(src as 'HIT' | 'MISS')
        incrementMetric('totalRequests')
        incrementMetric(src === 'HIT' ? 'cacheHits' : 'cacheMisses')
        pushLog(`Okuma #${i + 1}`, `${src} (${meta?.executionTimeMs ?? '-'}ms)`, src === 'HIT' ? 'hit' : 'miss', meta?.executionTimeMs)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
        pushLog(`Okuma #${i + 1}`, `HATA: ${msg}`, 'error')
      }
    }
    addLog('cache-patterns', 'success', `3 ardışık okuma tamamlandı (product:${productId})`)
    setLoading(false)
  }, [productId, addLog, incrementMetric, pushLog])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Controls */}
        <motion.div variants={item} className="space-y-3">
          <ProductSelector value={productId} onChange={setProductId} />
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={handleRead} loading={loading} variant="primary">Ürün Görüntüle</ActionButton>
            <ActionButton onClick={handleClear} loading={loading} variant="danger">Cache'i Temizle</ActionButton>
            <ActionButton onClick={handleTripleRead} loading={loading} variant="success">Ard Arda 3 Oku</ActionButton>
          </div>
          {source && <StatusBadge type={source} label={source === 'HIT' ? 'Cache HIT' : 'Cache MISS'} />}
          {result && <ProductCard data={result as { name: string; price: number; category: string }} />}
        </motion.div>

        {/* Right: Diagram */}
        <motion.div variants={item} className="glass p-3">
          <CachePatternFlowDiagram mode="cache-aside" isHit={source === 'HIT'} />
        </motion.div>
      </div>
      <LogStream logs={logs} onClear={() => setLogs([])} />
    </motion.div>
  )
}

/* ============================================================
   Tab 2: Read-Through
   ============================================================ */
function ReadThroughTab() {
  const { addLog, incrementMetric } = useLiveDemo()
  const [productId, setProductId] = useState(products[0].id)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [source, setSource] = useState<'HIT' | 'MISS' | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const pushLog = useCallback((action: string, res: string, type: LogEntry['type'], latencyMs?: number) => {
    setLogs((prev) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, result: res, type, latencyMs }, ...prev])
  }, [])

  const handleRead = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patternApi.readThrough(productId)
      const data = res.data?.data
      const meta = res.data?.metadata
      const src = meta?.source === 'CACHE' ? 'HIT' : 'MISS'
      setResult(data)
      setSource(src as 'HIT' | 'MISS')
      incrementMetric('totalRequests')
      incrementMetric(src === 'HIT' ? 'cacheHits' : 'cacheMisses')
      pushLog('Read-Through', `${src} (${meta?.executionTimeMs ?? '-'}ms)`, src === 'HIT' ? 'hit' : 'miss', meta?.executionTimeMs)
      addLog('cache-patterns', src === 'HIT' ? 'hit' : 'miss', `Read-Through product:${productId} ${src}`, meta?.executionTimeMs)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('Read-Through', `HATA: ${msg}`, 'error')
      addLog('cache-patterns', 'error', msg)
    } finally {
      setLoading(false)
    }
  }, [productId, addLog, incrementMetric, pushLog])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={item} className="space-y-3">
          <ProductSelector value={productId} onChange={setProductId} />
          <ActionButton onClick={handleRead} loading={loading} variant="primary">Oku</ActionButton>
          {source && <StatusBadge type={source} label={source === 'HIT' ? 'Cache HIT' : 'Cache MISS'} />}
          {result && <ProductCard data={result as { name: string; price: number; category: string }} />}
        </motion.div>
        <motion.div variants={item} className="glass p-3">
          <CachePatternFlowDiagram mode="read-through" isHit={source === 'HIT'} />
        </motion.div>
      </div>
      <LogStream logs={logs} onClear={() => setLogs([])} />
    </motion.div>
  )
}

/* ============================================================
   Tab 3: Write-Through
   ============================================================ */
function WriteThroughTab() {
  const { addLog, incrementMetric } = useLiveDemo()
  const [productId, setProductId] = useState(products[0].id)
  const [name, setName] = useState(products[0].name)
  const [price, setPrice] = useState(String(products[0].price))
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [logs, setLogs] = useState<LogEntry[]>([])

  const pushLog = useCallback((action: string, res: string, type: LogEntry['type'], latencyMs?: number) => {
    setLogs((prev) => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, action, result: res, type, latencyMs }, ...prev])
  }, [])

  const handleProductChange = useCallback((id: number) => {
    setProductId(id)
    const p = products.find((pr) => pr.id === id)
    if (p) {
      setName(p.name)
      setPrice(String(p.price))
    }
  }, [])

  const handleWrite = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patternApi.writeThrough(productId, { name, price: Number(price) })
      const meta = res.data?.metadata
      incrementMetric('totalRequests')
      pushLog('Write-Through PUT', `OK (${meta?.executionTimeMs ?? '-'}ms)`, 'success', meta?.executionTimeMs)
      addLog('cache-patterns', 'success', `Write-Through product:${productId} güncellendi`, meta?.executionTimeMs)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('Write-Through PUT', `HATA: ${msg}`, 'error')
      addLog('cache-patterns', 'error', msg)
    } finally {
      setLoading(false)
    }
  }, [productId, name, price, addLog, incrementMetric, pushLog])

  const handleVerify = useCallback(async () => {
    setLoading(true)
    try {
      const res = await patternApi.cacheAside(productId)
      const data = res.data?.data
      const meta = res.data?.metadata
      setResult(data)
      incrementMetric('totalRequests')
      incrementMetric('cacheHits')
      pushLog('Doğrulama Oku', `HIT (${meta?.executionTimeMs ?? '-'}ms)`, 'hit', meta?.executionTimeMs)
      addLog('cache-patterns', 'hit', `Doğrulama: product:${productId} cache'den okundu`, meta?.executionTimeMs)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata'
      pushLog('Doğrulama Oku', `HATA: ${msg}`, 'error')
    } finally {
      setLoading(false)
    }
  }, [productId, addLog, incrementMetric, pushLog])

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={item} className="space-y-3">
          <ProductSelector value={productId} onChange={handleProductChange} />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ürün adi"
            className="w-full rounded-lg border border-cyan-500/20 bg-black/30 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-cyan-400/50"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            placeholder="Fiyat (TL)"
            className="w-full rounded-lg border border-cyan-500/20 bg-black/30 text-sm text-gray-200 px-3 py-2 focus:outline-none focus:border-cyan-400/50"
          />
          <div className="flex flex-wrap gap-2">
            <ActionButton onClick={handleWrite} loading={loading} variant="warning">Güncelle</ActionButton>
            <ActionButton onClick={handleVerify} loading={loading} variant="success">Tekrar Oku</ActionButton>
          </div>
          {result && <ProductCard data={result as { name: string; price: number; category: string }} />}
        </motion.div>
        <motion.div variants={item} className="glass p-3">
          <CachePatternFlowDiagram mode="write-through" />
        </motion.div>
      </div>
      <LogStream logs={logs} onClear={() => setLogs([])} />
    </motion.div>
  )
}

/* ============================================================
   Main Section
   ============================================================ */
export default function CachePatternsSection() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      {/* Scenario Header */}
      <div className="glass p-4">
        <h2 className="text-lg font-bold text-gradient mb-1">Cache Patterns</h2>
        <p className="text-sm text-gray-400">
          Senaryo: Müşteri TechMart'ta ürün kataloğu tariyor. Veri nereden geliyor?
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { label: 'Cache-Aside', content: <CacheAsideTab /> },
          { label: 'Read-Through', content: <ReadThroughTab /> },
          { label: 'Write-Through', content: <WriteThroughTab /> },
        ]}
      />
    </motion.div>
  )
}
