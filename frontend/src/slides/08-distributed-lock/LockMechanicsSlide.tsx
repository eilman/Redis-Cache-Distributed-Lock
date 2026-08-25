import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Tabs from '../../components/ui/Tabs'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { lockApi } from '../../api/lockApi'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface SetNxResult {
  command: string
  result: string
  acquired: boolean
  key: string
  value?: string
  ttlMs?: number
  currentOwner?: string
  remainingTtlMs?: number
}

interface CheckResult {
  key: string
  exists: boolean
  value: string
  ttlMs: number
}

interface ReleaseResult {
  released: boolean
  reason?: string
  owner?: string
  yourUuid?: string
  actualOwner?: string
}

interface PodResult {
  pod: string
  uuid: string
  command: string
  acquired: boolean
  result: string
  durationMs: number
}

interface RaceResult {
  key: string
  podResults: PodResult[]
  winner: string
  mutualExclusion: boolean
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function shortUuid() {
  return Math.random().toString(36).substring(2, 10)
}

/* ------------------------------------------------------------------ */
/*  Command parts reference data                                       */
/* ------------------------------------------------------------------ */

const commandParts = [
  { token: 'SET', desc: 'Redis SET komutu', detail: 'Key-value çifti oluşturur', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { token: 'lock:payment:order-123', desc: 'Kilit key adi', detail: 'Hangi kaynağı kilitlediğimizi belirtir. lock:{domain}:{id}', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { token: '"uuid-a1b2c3"', desc: 'Benzersiz sahip kimliği (UUID)', detail: 'Her instance kendine özel UUID üretir. Kilidi sadece sahibi açabilir', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  { token: 'NX', desc: 'Not eXists - sadece key yoksa yaz', detail: 'Key zaten varsa nil döner. Aynı anda sadece 1 process kilidi alabilir', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  { token: 'PX 10000', desc: 'Otomatik expire süresi (ms)', detail: '10s sonra key silinir. Process crash olursa deadlock önlenir', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
]

/* ------------------------------------------------------------------ */
/*  SET NX PX Interactive Tab                                          */
/* ------------------------------------------------------------------ */

function SetNxPxTab() {
  const [key, setKey] = useState('lock:payment:order-123')
  const [uuid, setUuid] = useState(() => shortUuid())
  const [pxMs, setPxMs] = useState(10000)
  const [result, setResult] = useState<SetNxResult | null>(null)
  const [checkResult, setCheckResult] = useState<CheckResult | null>(null)
  const [releaseResult, setReleaseResult] = useState<ReleaseResult | null>(null)
  const [loading, setLoading] = useState<string | null>(null)

  const handleTrySetNx = useCallback(async () => {
    setLoading('set')
    setResult(null)
    setCheckResult(null)
    setReleaseResult(null)
    try {
      const res = await lockApi.mechanicsTrySetNx(key, uuid, pxMs)
      setResult(res.data?.data as SetNxResult)
    } finally { setLoading(null) }
  }, [key, uuid, pxMs])

  const handleCheck = useCallback(async () => {
    setLoading('check')
    setCheckResult(null)
    try {
      const res = await lockApi.mechanicsCheck(key)
      setCheckResult(res.data?.data as CheckResult)
    } finally { setLoading(null) }
  }, [key])

  const handleRelease = useCallback(async () => {
    setLoading('release')
    setReleaseResult(null)
    try {
      const res = await lockApi.mechanicsRelease(key, uuid)
      setReleaseResult(res.data?.data as ReleaseResult)
    } finally { setLoading(null) }
  }, [key, uuid])

  const handleReset = useCallback(() => {
    setResult(null)
    setCheckResult(null)
    setReleaseResult(null)
    setUuid(shortUuid())
  }, [])

  return (
    <div className="space-y-4">
      {/* Inputs */}
      <div className="glass p-4 space-y-3">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-400 w-14 shrink-0">Key:</label>
          <input
            value={key} onChange={e => setKey(e.target.value)}
            className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-cyan-400 font-mono flex-1"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <label className="text-xs text-gray-400 w-14 shrink-0">UUID:</label>
            <input
              value={uuid} onChange={e => setUuid(e.target.value)}
              className="bg-black/30 border border-green-500/20 rounded px-2 py-1 text-sm text-green-400 font-mono flex-1"
            />
            <button onClick={() => setUuid(shortUuid())}
              className="text-[10px] text-gray-500 hover:text-gray-300 bg-white/5 px-2 py-1 rounded">
              Yenile
            </button>
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <label className="text-xs text-gray-400 shrink-0">PX:</label>
            <input type="range" min={1000} max={30000} step={1000} value={pxMs}
              onChange={e => setPxMs(Number(e.target.value))} className="flex-1 accent-orange-500" />
            <span className="text-orange-400 font-mono text-xs w-16 text-right">{pxMs}ms</span>
          </div>
        </div>
      </div>

      {/* Live command preview */}
      <div className="bg-slate-950/60 border border-cyan-500/15 rounded-xl px-4 py-2.5 font-mono text-sm overflow-x-auto">
        <span className="text-gray-500">{'> '}</span>
        <span className="text-indigo-400">SET </span>
        <span className="text-cyan-400">{key} </span>
        <span className="text-green-400">"{uuid}" </span>
        <span className="text-yellow-400">NX </span>
        <span className="text-orange-400">PX {pxMs}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button onClick={handleTrySetNx} loading={loading === 'set'} size="sm">SET NX PX</Button>
        <Button onClick={handleCheck} loading={loading === 'check'} size="sm" variant="ghost">GET + PTTL</Button>
        <Button onClick={handleRelease} loading={loading === 'release'} size="sm" variant="danger">Release (DEL)</Button>
        <Button onClick={handleReset} size="sm" variant="ghost">Temizle</Button>
      </div>

      {/* SET NX PX Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`glass p-4 border ${result.acquired ? 'border-green-500/30' : 'border-red-500/30'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${result.acquired ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-sm font-bold ${result.acquired ? 'text-green-400' : 'text-red-400'}`}>
                Return: {result.result}
              </span>
              <Badge variant={result.acquired ? 'green' : 'red'}>
                {result.acquired ? 'Lock Alındı' : 'Lock Başkasında'}
              </Badge>
            </div>

            {/* Flow visualization */}
            <div className="flex items-center gap-2 text-xs font-mono bg-black/20 px-3 py-2 rounded mb-2">
              <span className="text-blue-400">Client</span>
              <span className="text-gray-600">&rarr;</span>
              <span className="text-indigo-400">SET NX PX</span>
              <span className="text-gray-600">&rarr;</span>
              <span className="text-cyan-400">Redis</span>
              <span className="text-gray-600">&rarr;</span>
              <span className={result.acquired ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {result.result}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Key:</span>
                <p className="text-cyan-400 font-mono truncate">{result.key}</p>
              </div>
              {result.acquired ? (
                <>
                  <div>
                    <span className="text-gray-500">Value (UUID):</span>
                    <p className="text-green-400 font-mono">{result.value}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">TTL:</span>
                    <p className="text-orange-400 font-mono">{result.ttlMs}ms</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="text-gray-500">Mevcut Sahip:</span>
                    <p className="text-red-400 font-mono">{result.currentOwner}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Kalan TTL:</span>
                    <p className="text-orange-400 font-mono">{result.remainingTtlMs}ms</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Check Result */}
      {checkResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass p-3 space-y-1 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-gray-500">{'>'}</span>
            <span className="text-indigo-400">GET</span>
            <span className="text-cyan-400">{checkResult.key}</span>
            <span className="text-gray-600">&rarr;</span>
            <span className={checkResult.exists ? 'text-green-400' : 'text-red-400'}>
              {checkResult.exists ? `"${checkResult.value}"` : '(nil)'}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500">{'>'}</span>
            <span className="text-indigo-400">PTTL</span>
            <span className="text-cyan-400">{checkResult.key}</span>
            <span className="text-gray-600">&rarr;</span>
            <span className={checkResult.ttlMs > 0 ? 'text-orange-400' : 'text-red-400'}>
              {checkResult.ttlMs > 0 ? `${checkResult.ttlMs}ms` : checkResult.ttlMs === -1 ? 'no expire' : '-2 (key yok)'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Release Result */}
      {releaseResult && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className={`glass p-3 text-sm border ${releaseResult.released ? 'border-green-500/20' : 'border-red-500/20'}`}>
          {releaseResult.released ? (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-green-400">UUID eşleşti - lock silindi</span>
              <span className="text-gray-500 font-mono text-xs ml-auto">DEL {key}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400">{releaseResult.reason === 'Owner mismatch'
                ? `UUID eşleşmedi: senin="${releaseResult.yourUuid}" gerçek="${releaseResult.actualOwner}"`
                : releaseResult.reason}</span>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Race Condition Tab                                                 */
/* ------------------------------------------------------------------ */

function RaceConditionTab() {
  const [key, setKey] = useState('lock:race:order-456')
  const [pxMs, setPxMs] = useState(10000)
  const [result, setResult] = useState<RaceResult | null>(null)
  const [loading, setLoading] = useState(false)

  const runRace = useCallback(async () => {
    setLoading(true)
    setResult(null)
    try {
      const ts = Date.now()
      const res = await lockApi.mechanicsRace(key + '-' + ts, pxMs)
      setResult(res.data?.data as RaceResult)
    } finally { setLoading(false) }
  }, [key, pxMs])

  return (
    <div className="space-y-4">
      {/* Scenario */}
      <div className="glass p-3 border border-amber-500/20">
        <p className="text-xs text-gray-300">
          <span className="text-amber-400 font-semibold">Senaryo:</span>{' '}
          2 pod eş zamanlı olarak <span className="text-white font-mono">SET ... NX PX</span> komutunu çalıştırır.
          Redis single-threaded olduğu için sadece 1 tanesi <span className="text-green-400">OK</span> alır,
          diğeri <span className="text-red-400">nil</span> döner.
        </p>
      </div>

      {/* Inputs */}
      <div className="glass p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <label className="text-xs text-gray-400">Key:</label>
          <input value={key} onChange={e => setKey(e.target.value)}
            className="bg-black/30 border border-cyan-500/20 rounded px-2 py-1 text-sm text-white font-mono flex-1" />
        </div>
        <div className="flex items-center gap-2 min-w-[180px]">
          <label className="text-xs text-gray-400">PX:</label>
          <input type="range" min={1000} max={30000} step={1000} value={pxMs}
            onChange={e => setPxMs(Number(e.target.value))} className="flex-1 accent-orange-500" />
          <span className="text-orange-400 font-mono text-xs w-16 text-right">{pxMs}ms</span>
        </div>
        <Button onClick={runRace} loading={loading} size="sm" variant="secondary">
          2 Pod Yarıştır
        </Button>
      </div>

      {!result && !loading && (
        <div className="glass p-8 text-center text-xs text-gray-600">
          2 pod eş zamanlı olarak aynı key'e SET NX PX çalıştıracak.
          Sadece biri kazanabilir.
        </div>
      )}

      {/* Race Result */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Pod results */}
          <div className="grid grid-cols-2 gap-3">
            {result.podResults.map((pod, i) => (
              <motion.div
                key={pod.pod}
                initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`glass p-4 border ${pod.acquired ? 'border-green-500/30' : 'border-red-500/30'}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-3 h-3 rounded-full ${
                    pod.pod === 'Pod-A' ? 'bg-indigo-500' : 'bg-orange-500'
                  }`} />
                  <span className="text-sm font-bold text-white">{pod.pod}</span>
                  <Badge variant={pod.acquired ? 'green' : 'red'}>
                    {pod.acquired ? 'KAZANDI' : 'KAYBETTI'}
                  </Badge>
                  <span className="ml-auto text-[10px] text-gray-600">{pod.durationMs}ms</span>
                </div>

                {/* Command */}
                <div className="bg-black/30 rounded px-2 py-1.5 mb-2 text-[10px] font-mono text-gray-400 overflow-x-auto">
                  {'> '}{pod.command}
                </div>

                {/* Flow */}
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span className={pod.pod === 'Pod-A' ? 'text-indigo-400' : 'text-orange-400'}>{pod.pod}</span>
                  <span className="text-gray-600">&rarr;</span>
                  <span className="text-cyan-400">Redis</span>
                  <span className="text-gray-600">&rarr;</span>
                  <span className={`font-bold ${pod.acquired ? 'text-green-400' : 'text-red-400'}`}>
                    {pod.result}
                  </span>
                </div>

                {/* UUID */}
                <div className="mt-2 text-[10px] text-gray-500">
                  UUID: <span className="text-green-400 font-mono">{pod.uuid}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mutual exclusion confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-3 rounded-lg text-sm flex items-center gap-3 ${
              result.mutualExclusion
                ? 'bg-green-500/10 border border-green-500/20'
                : 'bg-red-500/10 border border-red-500/20'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${result.mutualExclusion ? 'bg-green-500' : 'bg-red-500'}`} />
            <div>
              <span className={`font-semibold ${result.mutualExclusion ? 'text-green-400' : 'text-red-400'}`}>
                {result.mutualExclusion ? 'Mutual Exclusion Sağlandı' : 'HATA: Mutual exclusion ihlali!'}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {result.mutualExclusion
                  ? `NX sayesinde sadece ${result.winner} lock'u aldı. Diğeri nil aldı ve işlem yapmadı.`
                  : 'Bu durum NX kullanıldığında olmamalı!'}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Command Reference Tab                                              */
/* ------------------------------------------------------------------ */

function ReferenceTab() {
  return (
    <div className="space-y-4">
      {/* Wrong vs Right */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/60 border border-red-500/20 rounded-xl overflow-hidden">
          <div className="bg-red-500/10 px-3 py-1.5 text-xs text-red-400 font-semibold border-b border-red-500/10">
            Yanlış: 2 Ayrı Komut (Race Condition!)
          </div>
          <pre className="p-3 text-xs font-mono leading-relaxed text-gray-400">
{`GET lock:payment:order-123    // Kontrol et
// Tam bu arada başka process yazabilir!
SET lock:payment:order-123 "uuid"  // Yaz`}
          </pre>
        </div>
        <div className="bg-slate-950/60 border border-green-500/20 rounded-xl overflow-hidden">
          <div className="bg-green-500/10 px-3 py-1.5 text-xs text-green-400 font-semibold border-b border-green-500/10">
            Doğru: Tek Atomic Komut
          </div>
          <pre className="p-3 text-xs font-mono leading-relaxed text-gray-400">
{`SET lock:payment:order-123 "uuid" NX PX 10000

// Tek komut = atomic. Araya kimse giremez.
// "OK" = kilit alındı  |  nil = başkası tutuyor`}
          </pre>
        </div>
      </div>

      {/* Command parts */}
      <div className="glass p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-400 mb-2">Komutun Her Parçası</h3>
        {commandParts.map((p, i) => (
          <motion.div
            key={p.token}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-start gap-3 ${p.bg} border ${p.border} rounded-lg px-3 py-2`}
          >
            <code className={`font-mono font-bold text-sm ${p.color} flex-shrink-0 min-w-[180px]`}>{p.token}</code>
            <div className="flex-1">
              <span className="text-sm text-gray-300 font-semibold">{p.desc}</span>
              <p className="text-xs text-gray-500 mt-0.5">{p.detail}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Return values */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass p-3 border border-green-500/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <p className="text-sm font-semibold text-green-400">Return: "OK"</p>
          </div>
          <p className="text-xs text-gray-400">Kilit başarıyla alındı. Bu process artık kaynağın tek sahibi.</p>
        </div>
        <div className="glass p-3 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <p className="text-sm font-semibold text-red-400">Return: nil</p>
          </div>
          <p className="text-xs text-gray-400">Kilit alınamadı. Başka bir process zaten kilidi tutuyor.</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function LockMechanicsSlide() {
  return (
    <div className="space-y-4">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        SET NX PX: Atomic Lock Acquisition
      </motion.h2>

      {/* Condensed scenario */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20">
        <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
          <span className="text-gray-600 font-mono">t1-t2</span>
          <span className="text-gray-400">
            <span className="text-indigo-400">Pod-A</span> ve <span className="text-orange-400">Pod-B</span> ayni
            anda <span className="text-white font-mono">GET</span> yapar &rarr; ikisi de "key yok" görür
          </span>
          <span className="text-gray-600 font-mono">t3-t4</span>
          <span className="text-gray-400">
            Ikisi de <span className="text-white font-mono">SET</span> yapar &rarr;{' '}
            <span className="text-red-400 font-bold">ikisi de kilidi aldigini sanir!</span>
          </span>
          <span className="text-gray-600 font-mono">&rarr;</span>
          <span className="text-gray-400">
            <span className="text-white font-mono">SET NX PX</span> bunu{' '}
            <span className="text-cyan-400">tek atomic komuta</span> sıkıştırır. Redis single-threaded = araya kimse giremez.
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Tabs tabs={[
          { label: 'SET NX PX Dene', content: <SetNxPxTab /> },
          { label: 'Race Condition', content: <RaceConditionTab /> },
          { label: 'Komut Referansi', content: <ReferenceTab /> },
        ]} />
      </motion.div>
    </div>
  )
}
