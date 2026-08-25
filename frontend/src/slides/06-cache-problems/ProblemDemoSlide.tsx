import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { problemApi } from '../../api/cacheApi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RequestDetail {
  requestId: number
  source: string
  durationMs: number
  cacheResult?: string
  dbHit?: boolean
  nullCached?: boolean
}

interface StampedeResult {
  totalRequests: number
  dbHits: number
  cacheHits: number
  details: RequestDetail[]
}

interface PenetrationMultiResult {
  key: string
  totalRequests: number
  dbHits: number
  cacheHits: number
  useNullCaching: boolean
  requests: RequestDetail[]
}

interface StaleDataResult {
  cachePrice: number
  dbPrice: number
  isStale: boolean
  remainingTTL: number
  priceDifference: number
  fixed?: boolean
}

/* ------------------------------------------------------------------ */
/*  Stampede Tab                                                        */
/* ------------------------------------------------------------------ */

function StampedeTab() {
  const [productId, setProductId] = useState(1)
  const [concurrent, setConcurrent] = useState(10)
  const [unprotectedResult, setUnprotectedResult] = useState<StampedeResult | null>(null)
  const [protectedResult, setProtectedResult] = useState<StampedeResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const runUnprotected = useCallback(async () => {
    setLoading('unprotected')
    setUnprotectedResult(null)
    try {
      const res = await problemApi.stampede(productId, concurrent)
      setUnprotectedResult(res.data?.data as StampedeResult)
    } finally { setLoading(null) }
  }, [productId, concurrent])

  const runProtected = useCallback(async () => {
    setLoading('protected')
    setProtectedResult(null)
    try {
      const res = await problemApi.stampedeMitigated(productId, concurrent)
      setProtectedResult(res.data?.data as StampedeResult)
    } finally { setLoading(null) }
  }, [productId, concurrent])

  const runBoth = useCallback(async () => {
    setLoading('both')
    setUnprotectedResult(null)
    setProtectedResult(null)
    try {
      const [u, p] = await Promise.all([
        problemApi.stampede(productId, concurrent),
        problemApi.stampedeMitigated(productId, concurrent),
      ])
      setUnprotectedResult(u.data?.data as StampedeResult)
      setProtectedResult(p.data?.data as StampedeResult)
    } finally { setLoading(null) }
  }, [productId, concurrent])

  const maxDuration = Math.max(
    ...(unprotectedResult?.details?.map(d => d.durationMs) || [1]),
    ...(protectedResult?.details?.map(d => d.durationMs) || [1]),
    1
  )

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass p-4 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400">Product ID:</label>
          <select
            value={productId}
            onChange={e => setProductId(Number(e.target.value))}
            className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white"
          >
            {[1, 2, 3, 4, 5].map(id => (
              <option key={id} value={id}>#{id}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400 whitespace-nowrap">Es Zamanli Istek:</label>
          <input
            type="range"
            min={2} max={50}
            value={concurrent}
            onChange={e => setConcurrent(Number(e.target.value))}
            className="flex-1 accent-cyan-500"
          />
          <span className="text-cyan-400 font-mono text-sm font-bold w-8 text-right">{concurrent}</span>
        </div>
        <Button onClick={runBoth} loading={loading === 'both'} size="sm" variant="secondary">
          Karsilastir
        </Button>
      </div>

      {/* Side by side */}
      <div className="grid grid-cols-2 gap-3">
        {/* Unprotected */}
        <div className="glass p-4 space-y-3 border border-red-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="red">Korumasiz</Badge>
              <span className="text-[10px] text-gray-500">Lock yok</span>
            </div>
            <Button onClick={runUnprotected} loading={loading === 'unprotected'} size="sm" variant="danger">
              Calistir
            </Button>
          </div>
          {unprotectedResult && <StampedeResultView result={unprotectedResult} maxDuration={maxDuration} bad />}
          {!unprotectedResult && !loading && (
            <p className="text-xs text-gray-600 text-center py-6">Henuz çalıştırılmadı</p>
          )}
        </div>

        {/* Protected */}
        <div className="glass p-4 space-y-3 border border-green-500/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="green">Lock Korumali</Badge>
              <span className="text-[10px] text-gray-500">Distributed Lock</span>
            </div>
            <Button onClick={runProtected} loading={loading === 'protected'} size="sm">
              Calistir
            </Button>
          </div>
          {protectedResult && <StampedeResultView result={protectedResult} maxDuration={maxDuration} bad={false} />}
          {!protectedResult && !loading && (
            <p className="text-xs text-gray-600 text-center py-6">Henuz çalıştırılmadı</p>
          )}
        </div>
      </div>
    </div>
  )
}

function StampedeResultView({ result, maxDuration, bad }: { result: StampedeResult; maxDuration: number; bad: boolean }) {
  const avgMs = Math.round(result.details.reduce((s, d) => s + d.durationMs, 0) / result.details.length)
  const dbPct = Math.round((result.dbHits / result.totalRequests) * 100)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-black/30 rounded p-2 text-center">
          <div className={`text-lg font-bold ${bad ? 'text-red-400' : 'text-green-400'}`}>{result.dbHits}</div>
          <div className="text-[10px] text-gray-500">DB Hit</div>
        </div>
        <div className="bg-black/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-cyan-400">{result.cacheHits}</div>
          <div className="text-[10px] text-gray-500">Cache Hit</div>
        </div>
        <div className="bg-black/30 rounded p-2 text-center">
          <div className="text-lg font-bold text-gray-300">{avgMs}ms</div>
          <div className="text-[10px] text-gray-500">Ort. Sure</div>
        </div>
      </div>

      {/* DB load bar */}
      <div>
        <div className="flex justify-between text-[10px] text-gray-500 mb-1">
          <span>DB Yuku</span>
          <span>{dbPct}%</span>
        </div>
        <div className="h-2 bg-black/30 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dbPct}%` }}
            transition={{ duration: 0.8 }}
            className={`h-full rounded-full ${bad ? 'bg-red-500' : 'bg-green-500'}`}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0.5 max-h-[180px] overflow-y-auto pr-1">
        <div className="text-[10px] text-gray-500 mb-1">Istek Timeline</div>
        {result.details.map((d, i) => {
          const isDb = d.source === 'DB' || d.source?.startsWith('DB')
          const label = d.source === 'DB' ? 'DB' : d.source?.includes('lock holder') ? 'DB(lock)' : 'CACHE'
          return (
            <motion.div
              key={d.requestId}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-1.5 text-[10px] font-mono"
            >
              <span className="text-gray-600 w-5 text-right shrink-0">R{d.requestId}</span>
              <div className="flex-1 h-3 bg-black/20 rounded overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max((d.durationMs / maxDuration) * 100, 5)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.03 }}
                  className={`h-full rounded ${isDb ? 'bg-red-500/60' : 'bg-green-500/60'}`}
                />
              </div>
              <span className={`w-14 shrink-0 truncate ${isDb ? 'text-red-400' : 'text-green-400'}`}>{label}</span>
              <span className="text-gray-600 w-10 text-right shrink-0">{d.durationMs}ms</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Penetration Tab                                                    */
/* ------------------------------------------------------------------ */

function PenetrationTab() {
  const [key, setKey] = useState('nonexistent:product:99999')
  const [requestCount, setRequestCount] = useState(5)
  const [useNullCaching, setUseNullCaching] = useState(false)
  const [result, setResult] = useState<PenetrationMultiResult | null>(null)
  const [comparison, setComparison] = useState<{ without: PenetrationMultiResult; with_: PenetrationMultiResult } | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const runDemo = useCallback(async () => {
    setLoading('single')
    setResult(null)
    setComparison(null)
    try {
      const res = await problemApi.penetrationMulti(key, requestCount, useNullCaching)
      setResult(res.data?.data as PenetrationMultiResult)
    } finally { setLoading(null) }
  }, [key, requestCount, useNullCaching])

  const runComparison = useCallback(async () => {
    setLoading('compare')
    setResult(null)
    setComparison(null)
    try {
      const ts = Date.now()
      const [w, n] = await Promise.all([
        problemApi.penetrationMulti(key + ':cmp-without-' + ts, requestCount, false),
        problemApi.penetrationMulti(key + ':cmp-with-' + ts, requestCount, true),
      ])
      setComparison({
        without: w.data?.data as PenetrationMultiResult,
        with_: n.data?.data as PenetrationMultiResult,
      })
    } finally { setLoading(null) }
  }, [key, requestCount])

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="glass p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs text-gray-400 whitespace-nowrap">Key:</label>
            <input
              type="text"
              value={key}
              onChange={e => setKey(e.target.value)}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white font-mono flex-1"
              placeholder="Var olmayan bir key girin"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Istek:</label>
            <select
              value={requestCount}
              onChange={e => setRequestCount(Number(e.target.value))}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white"
            >
              {[3, 5, 8, 10].map(n => (
                <option key={n} value={n}>{n} istek</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">Mod:</label>
            <div className="flex bg-black/30 rounded-lg p-0.5">
              <button
                onClick={() => setUseNullCaching(false)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  !useNullCaching ? 'bg-red-500/30 text-red-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Korumasiz
              </button>
              <button
                onClick={() => setUseNullCaching(true)}
                className={`px-3 py-1 text-xs rounded-md transition-all ${
                  useNullCaching ? 'bg-green-500/30 text-green-400' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Null Caching
              </button>
            </div>
          </div>
          <div className="flex gap-2 ml-auto">
            <Button onClick={runDemo} loading={loading === 'single'} size="sm">Calistir</Button>
            <Button onClick={runComparison} loading={loading === 'compare'} size="sm" variant="secondary">Karsilastir</Button>
          </div>
        </div>
      </div>

      {/* Single result */}
      {result && <PenetrationResultView result={result} />}

      {/* Comparison */}
      {comparison && (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass p-3 border border-red-500/20 space-y-2">
            <Badge variant="red">Korumasiz</Badge>
            <PenetrationResultView result={comparison.without} compact />
          </div>
          <div className="glass p-3 border border-green-500/20 space-y-2">
            <Badge variant="green">Null Caching</Badge>
            <PenetrationResultView result={comparison.with_} compact />
          </div>
        </div>
      )}
    </div>
  )
}

function PenetrationResultView({ result, compact }: { result: PenetrationMultiResult; compact?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`space-y-3 ${compact ? '' : 'glass p-4'}`}>
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-red-400 font-bold text-lg">{result.dbHits}</span>
          <span className="text-xs text-gray-500">DB Hit</span>
        </div>
        <span className="text-gray-600">/</span>
        <div className="flex items-center gap-1.5">
          <span className="text-green-400 font-bold text-lg">{result.cacheHits}</span>
          <span className="text-xs text-gray-500">Cache Hit</span>
        </div>
        <span className="ml-auto text-xs text-gray-500">
          {result.totalRequests} istek
        </span>
      </div>

      {/* Hit ratio bar */}
      <div className="h-2 bg-black/30 rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(result.dbHits / result.totalRequests) * 100}%` }}
          transition={{ duration: 0.6 }}
          className="h-full bg-red-500"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(result.cacheHits / result.totalRequests) * 100}%` }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="h-full bg-green-500"
        />
      </div>

      {/* Request flow */}
      <div className="space-y-1">
        {result.requests.map((req, i) => {
          const isHit = req.cacheResult?.includes('HIT')
          return (
            <motion.div
              key={req.requestId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center gap-2 text-[11px] font-mono bg-black/20 px-2 py-1.5 rounded"
            >
              <span className="text-gray-500 w-4 shrink-0">#{req.requestId}</span>
              <span className="text-blue-400 shrink-0">Client</span>
              <span className="text-gray-600 shrink-0">&rarr;</span>
              <span className={`shrink-0 ${isHit ? 'text-green-400' : 'text-red-400'}`}>
                Redis({isHit ? (req.cacheResult?.includes('null') ? 'HIT:null' : 'HIT') : 'MISS'})
              </span>
              {req.dbHit && (
                <>
                  <span className="text-gray-600 shrink-0">&rarr;</span>
                  <span className="text-yellow-400 shrink-0">DB(NULL)</span>
                  {req.nullCached && (
                    <>
                      <span className="text-gray-600 shrink-0">&rarr;</span>
                      <span className="text-green-400 shrink-0">Cache(null)</span>
                    </>
                  )}
                </>
              )}
              <span className="ml-auto text-gray-600 shrink-0">{req.durationMs}ms</span>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stale Data Tab                                                     */
/* ------------------------------------------------------------------ */

function StaleDataTab() {
  const [productName, setProductName] = useState('MacBook Pro')
  const [originalPrice, setOriginalPrice] = useState(74999.99)
  const [newPrice, setNewPrice] = useState(64999)
  const [ttl, setTtl] = useState(300)
  const [result, setResult] = useState<StaleDataResult | null>(null)
  const [fixResult, setFixResult] = useState<StaleDataResult | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState<string | null>(null)

  const runStaleDemo = useCallback(async () => {
    setLoading('stale')
    setResult(null)
    setFixResult(null)
    setCurrentStep(1)
    try {
      const res = await problemApi.staleData(productName, originalPrice, newPrice, ttl)
      setResult(res.data?.data as StaleDataResult)
      setCurrentStep(4)
    } finally { setLoading(null) }
  }, [productName, originalPrice, newPrice, ttl])

  const runFix = useCallback(async () => {
    setLoading('fix')
    try {
      const res = await problemApi.staleDataFix(productName)
      setFixResult(res.data?.data as StaleDataResult)
      setCurrentStep(5)
    } finally { setLoading(null) }
  }, [productName])

  const reset = useCallback(() => {
    setResult(null)
    setFixResult(null)
    setCurrentStep(0)
  }, [])

  const steps = ['Cache Yaz', 'DB Guncelle', 'Cache Oku', 'Stale!', 'Fix']

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="glass p-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-20 shrink-0">Ürün:</label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-20 shrink-0">TTL:</label>
            <input
              type="number"
              value={ttl}
              onChange={e => setTtl(Number(e.target.value))}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white w-20"
            />
            <span className="text-xs text-gray-500">saniye</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-20 shrink-0">Cache Fiyat:</label>
            <input
              type="number"
              value={originalPrice}
              onChange={e => setOriginalPrice(Number(e.target.value))}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white flex-1"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400 w-20 shrink-0">Yeni Fiyat:</label>
            <input
              type="number"
              value={newPrice}
              onChange={e => setNewPrice(Number(e.target.value))}
              className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white flex-1"
            />
            <span className="text-xs text-gray-500">TL</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button onClick={runStaleDemo} loading={loading === 'stale'} size="sm" variant="danger">
          Stale Data Olustur
        </Button>
        {result && !fixResult && (
          <Button onClick={runFix} loading={loading === 'fix'} size="sm">
            Cache Invalidate Et
          </Button>
        )}
        {currentStep > 0 && (
          <Button onClick={reset} size="sm" variant="ghost">
            Sifirla
          </Button>
        )}
      </div>

      {/* Step indicators */}
      {currentStep > 0 && (
        <div className="flex items-center gap-1 text-xs">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-600">&rarr;</span>}
              <span className={`px-2 py-0.5 rounded transition-all ${
                i + 1 <= currentStep
                  ? i < 3 ? 'bg-cyan-500/20 text-cyan-400'
                    : i === 3 ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
                  : 'bg-black/20 text-gray-600'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Cache vs DB visualization */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-3">
          {/* Cache */}
          <div className={`glass p-4 border ${fixResult ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full ${fixResult ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-sm font-semibold text-white">Redis Cache</span>
              {!fixResult && <Badge variant="red">STALE</Badge>}
              {fixResult && <Badge variant="green">GUNCEL</Badge>}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ürün:</span>
                <span className="text-white font-mono">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fiyat:</span>
                <span className={`font-mono font-bold text-lg ${fixResult ? 'text-green-400' : 'text-red-400'}`}>
                  {fixResult ? newPrice : originalPrice} TL
                </span>
              </div>
              {!fixResult && result.remainingTTL > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Kalan TTL:</span>
                  <span className="text-yellow-400 font-mono">{result.remainingTTL}s</span>
                </div>
              )}
            </div>
          </div>

          {/* DB */}
          <div className="glass p-4 border border-green-500/30">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-white">PostgreSQL DB</span>
              <Badge variant="green">GUNCEL</Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Ürün:</span>
                <span className="text-white font-mono">{productName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Fiyat:</span>
                <span className="text-green-400 font-mono font-bold text-lg">{newPrice} TL</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stale alert */}
      {result && !fixResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start gap-3"
        >
          <span className="text-red-400 text-lg font-bold shrink-0">!</span>
          <div className="text-sm">
            <p className="text-red-400 font-semibold">Stale Data Tespit Edildi</p>
            <p className="text-gray-400 mt-1">
              Kullanıcı <span className="text-red-400 font-bold">{result.priceDifference} TL</span> farkla
              yanlis fiyat goruyor. Cache TTL dolana kadar (<span className="text-yellow-400">{result.remainingTTL}s</span>)
              bu durum devam edecek.
            </p>
          </div>
        </motion.div>
      )}

      {/* Fix success */}
      {fixResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-start gap-3"
        >
          <span className="text-green-400 text-lg font-bold shrink-0">OK</span>
          <div className="text-sm">
            <p className="text-green-400 font-semibold">Cache Invalidate Edildi</p>
            <p className="text-gray-400 mt-1">
              Cache temizlendi ve DB'den güncel veri ile yeniden dolduruldu.
              Artik kullanıcı dogru fiyati (<span className="text-green-400 font-bold">{newPrice} TL</span>) goruyor.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ProblemDemoSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Canlı Demo: Cache Problemleri
      </motion.h2>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs tabs={[
          { label: 'Stampede', content: <StampedeTab /> },
          { label: 'Penetration', content: <PenetrationTab /> },
          { label: 'Stale Data', content: <StaleDataTab /> },
        ]} />
      </motion.div>
    </div>
  )
}
