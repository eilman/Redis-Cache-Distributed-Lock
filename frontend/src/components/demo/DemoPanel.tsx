import { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import Button from '../ui/Button'

interface LogEntry {
  step: number
  action: string
  result: string
  durationMs: number
}

interface Props {
  title: string
  description?: string
  onRun: () => Promise<{ data?: { logs?: LogEntry[]; data?: unknown; metadata?: { executionTimeMs?: number; source?: string } } }>
  children?: ReactNode
  renderResult?: (data: unknown) => ReactNode
}

export default function DemoPanel({ title, description, onRun, children, renderResult }: Props) {
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [result, setResult] = useState<unknown>(null)
  const [executionTime, setExecutionTime] = useState<number | null>(null)

  const handleRun = async () => {
    setLoading(true)
    setLogs([])
    setResult(null)
    try {
      const res = await onRun()
      const d = res.data
      if (d?.logs) setLogs(d.logs)
      if (d?.data !== undefined) setResult(d.data)
      if (d?.metadata?.executionTimeMs) setExecutionTime(d.metadata.executionTimeMs)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setLogs([{ step: 0, action: 'ERROR', result: msg, durationMs: 0 }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="glass p-4 space-y-3 overflow-hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
          {description && <p className="text-xs text-gray-400 mt-0.5 truncate">{description}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {executionTime !== null && (
            <span className="text-[10px] text-gray-500 font-mono">{executionTime}ms</span>
          )}
          <Button onClick={handleRun} loading={loading} size="sm">
            Çalıştır
          </Button>
        </div>
      </div>

      {children}

      {logs.length > 0 && (
        <div className="space-y-1">
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 text-xs font-mono bg-black/20 px-2 py-1.5 rounded overflow-hidden"
            >
              <span className="text-gray-600 shrink-0">#{log.step}</span>
              <span className="text-cyan-400 shrink-0">{log.action}</span>
              <span className={`flex-1 min-w-0 truncate ${log.result.includes('HIT') || log.result.includes('OK') || log.result.includes('FOUND') ? 'text-green-400' : log.result.includes('MISS') || log.result.includes('ERROR') || log.result.includes('NOT_FOUND') ? 'text-red-400' : 'text-gray-300'}`}>
                {log.result}
              </span>
              <span className="text-gray-600 text-[10px] shrink-0">{log.durationMs}ms</span>
            </motion.div>
          ))}
        </div>
      )}

      {result !== null && renderResult && (
        <div className="mt-4 bg-black/20 p-4 rounded-lg">
          {renderResult(result)}
        </div>
      )}
    </div>
  )
}
