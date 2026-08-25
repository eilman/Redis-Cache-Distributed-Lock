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

const segmentStyles: Record<string, { color: string; label: string }> = {
  wait:        { color: '#6b7280', label: 'Bekleme' },
  cache_check: { color: '#00d4ff', label: 'Cache Kontrol' },
  cache_hit:   { color: '#4ade80', label: 'Cache HIT' },
  db_query:    { color: '#fbbf24', label: 'DB Sorgu' },
  lock_wait:   { color: '#c084fc', label: 'Lock Bekleme' },
  lock_held:   { color: '#a855f7', label: 'Lock Tutma' },
  processing:  { color: '#4ade80', label: 'İşlem' },
  error:       { color: '#f87171', label: 'Hata' },
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
            <div className="flex-1 flex h-5 rounded-full overflow-hidden bg-black/30 border border-white/[0.04]">
              {entry.segments.map((seg, j) => {
                const style = segmentStyles[seg.type]
                return (
                  <motion.div
                    key={j}
                    initial={{ width: 0 }}
                    animate={{ width: `${seg.widthPercent}%` }}
                    transition={{ delay: i * 0.08 + j * 0.1, duration: 0.4 }}
                    className="h-full relative group"
                    style={{
                      backgroundColor: style.color,
                      boxShadow: `inset 0 1px 0 ${style.color}40, 0 0 8px ${style.color}25`,
                    }}
                    title={`${style.label}${seg.durationMs ? ` (${seg.durationMs}ms)` : ''}`}
                  >
                    {seg.widthPercent > 15 && seg.durationMs && (
                      <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/90 font-mono font-medium"
                        style={{ textShadow: `0 0 6px ${style.color}` }}>
                        {seg.durationMs}ms
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 pt-1">
        {Object.entries(segmentStyles).map(([key, val]) => (
          <span key={key} className="flex items-center gap-1 text-[9px] text-gray-500">
            <span className="w-2 h-2 rounded-sm"
              style={{
                backgroundColor: val.color,
                boxShadow: `0 0 4px ${val.color}50`,
              }} />
            {val.label}
          </span>
        ))}
      </div>
    </div>
  )
}
