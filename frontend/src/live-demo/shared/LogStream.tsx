import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

export interface LogEntry {
  id: string
  action: string
  result: string
  type: 'hit' | 'miss' | 'error' | 'lock' | 'info' | 'success'
  latencyMs?: number
}

interface Props {
  logs: LogEntry[]
  maxHeight?: number
  onClear?: () => void
}

const typeColors = {
  hit: 'text-green-400',
  miss: 'text-amber-400',
  error: 'text-red-400',
  lock: 'text-purple-400',
  info: 'text-gray-400',
  success: 'text-green-400',
}

const resultColors = (result: string) => {
  if (/HIT|OK|SUCCESS|FOUND|ACQUIRED|TRUE/i.test(result)) return 'text-green-400'
  if (/MISS|NOT_FOUND|FALSE/i.test(result)) return 'text-amber-400'
  if (/ERROR|FAIL|REJECT|DENIED/i.test(result)) return 'text-red-400'
  if (/LOCK|WAIT/i.test(result)) return 'text-purple-400'
  return 'text-gray-300'
}

export default function LogStream({ logs, maxHeight = 200, onClear }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs.length])

  return (
    <div className="glass p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Islem Loglari</h4>
        {onClear && logs.length > 0 && (
          <button onClick={onClear} className="text-[10px] text-gray-600 hover:text-gray-400 transition-colors">
            Temizle
          </button>
        )}
      </div>
      <div ref={scrollRef} className="space-y-1 overflow-y-auto" style={{ maxHeight }}>
        {logs.length === 0 ? (
          <p className="text-[11px] text-gray-600 text-center py-4">Henuz islem yok. Bir demo baslatin.</p>
        ) : (
          logs.map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i < 5 ? i * 0.05 : 0 }}
              className="flex items-center gap-2 text-[11px] font-mono bg-black/20 px-2 py-1.5 rounded"
            >
              <span className="text-gray-600 shrink-0 w-5 text-right">#{i + 1}</span>
              <span className={`shrink-0 ${typeColors[log.type]}`}>{log.action}</span>
              <span className={`flex-1 min-w-0 truncate ${resultColors(log.result)}`}>{log.result}</span>
              {log.latencyMs !== undefined && (
                <span className="text-gray-600 text-[9px] shrink-0">{log.latencyMs}ms</span>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
