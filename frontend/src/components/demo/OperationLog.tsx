import { motion } from 'framer-motion'

interface LogEntry {
  step: number
  action: string
  result: string
  durationMs: number
}

interface Props {
  logs: LogEntry[]
}

export default function OperationLog({ logs }: Props) {
  if (logs.length === 0) return null

  return (
    <div className="space-y-1 mt-4">
      <h4 className="text-xs text-gray-500 uppercase tracking-wide mb-2">Operation Log</h4>
      {logs.map((log, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-3 text-sm font-mono bg-black/20 px-3 py-1.5 rounded"
        >
          <span className="text-gray-600 w-6">#{log.step}</span>
          <span className="text-cyan-400 min-w-[140px]">{log.action}</span>
          <span className="text-gray-300 flex-1">{log.result}</span>
          <span className="text-gray-600 text-xs">{log.durationMs}ms</span>
        </motion.div>
      ))}
    </div>
  )
}
