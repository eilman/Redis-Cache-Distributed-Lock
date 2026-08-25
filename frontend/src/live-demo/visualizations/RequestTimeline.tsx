import { motion } from 'framer-motion'

export interface TimelineEntry {
  label: string
  segments: {
    type: 'wait' | 'cache_check' | 'db_query' | 'lock_wait' | 'lock_held' | 'processing' | 'error' | 'cache_hit'
    widthPercent: number
    durationMs?: number
  }[]
}

interface Props {
  entries: TimelineEntry[]
  title?: string
}

const segmentColors = {
  wait: { bg: 'bg-gray-600', label: 'Bekleme' },
  cache_check: { bg: 'bg-cyan-500', label: 'Cache Kontrol' },
  cache_hit: { bg: 'bg-green-500', label: 'Cache HIT' },
  db_query: { bg: 'bg-amber-500', label: 'DB Sorgu' },
  lock_wait: { bg: 'bg-purple-400', label: 'Lock Bekleme' },
  lock_held: { bg: 'bg-purple-600', label: 'Lock Tutma' },
  processing: { bg: 'bg-green-500', label: 'İşlem' },
  error: { bg: 'bg-red-500', label: 'Hata' },
}

export default function RequestTimeline({ entries, title }: Props) {
  return (
    <div className="glass p-3 space-y-2">
      {title && (
        <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">{title}</h4>
      )}

      <div className="space-y-1.5">
        {entries.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-2"
          >
            <span className="text-[10px] text-gray-500 font-mono w-16 shrink-0 truncate">{entry.label}</span>
            <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-black/20">
              {entry.segments.map((seg, j) => (
                <motion.div
                  key={j}
                  initial={{ width: 0 }}
                  animate={{ width: `${seg.widthPercent}%` }}
                  transition={{ delay: i * 0.08 + j * 0.1, duration: 0.4 }}
                  className={`${segmentColors[seg.type].bg} h-full relative group`}
                  title={`${segmentColors[seg.type].label}${seg.durationMs ? ` (${seg.durationMs}ms)` : ''}`}
                >
                  {seg.widthPercent > 15 && seg.durationMs && (
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/80 font-mono">
                      {seg.durationMs}ms
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(segmentColors).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className={`w-2 h-2 rounded-sm ${val.bg}`} />
            {val.label}
          </span>
        ))}
      </div>
    </div>
  )
}
