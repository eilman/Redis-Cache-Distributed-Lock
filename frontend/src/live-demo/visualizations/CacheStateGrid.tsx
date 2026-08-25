import { motion, AnimatePresence } from 'framer-motion'

export interface CacheEntry {
  key: string
  value: string
  ttl: number
  maxTtl: number
  status: 'active' | 'expiring' | 'expired'
}

interface Props {
  entries: CacheEntry[]
}

const statusStyles = {
  active:   { border: '#00d4ff25', bg: '#00d4ff08', glow: '#00d4ff' },
  expiring: { border: '#fbbf2430', bg: '#fbbf2410', glow: '#fbbf24' },
  expired:  { border: '#ffffff08', bg: '#00000030', glow: 'transparent' },
}

function getBarColor(percent: number): string {
  if (percent > 60) return '#4ade80'
  if (percent > 25) return '#fbbf24'
  return '#f87171'
}

export default function CacheStateGrid({ entries }: Props) {
  return (
    <div className="glass p-3 space-y-2">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Cache Durumu</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <AnimatePresence>
          {entries.map((entry) => {
            const ttlPercent = entry.maxTtl > 0 ? (entry.ttl / entry.maxTtl) * 100 : 0
            const barColor = getBarColor(ttlPercent)
            const style = statusStyles[entry.status]

            return (
              <motion.div
                key={entry.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: entry.status === 'expired' ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="p-2 rounded-lg border"
                style={{
                  borderColor: style.border,
                  backgroundColor: style.bg,
                  boxShadow: entry.status !== 'expired' ? `0 0 12px ${style.glow}10, inset 0 1px 0 rgba(255,255,255,0.03)` : undefined,
                }}
              >
                <p className="text-[10px] font-mono truncate" style={{ color: '#00d4ff' }}>{entry.key}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{entry.value}</p>
                <div className="mt-1.5">
                  <div className="flex justify-between text-[8px] mb-0.5">
                    <span className="text-gray-600">TTL</span>
                    <span style={{ color: entry.status === 'expired' ? '#6b7280' : barColor }}>
                      {entry.status === 'expired' ? 'EXPIRED' : `${entry.ttl}s`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-black/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: barColor,
                        boxShadow: ttlPercent > 0 ? `0 0 6px ${barColor}50` : undefined,
                      }}
                      animate={{ width: `${ttlPercent}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      {entries.length === 0 && (
        <p className="text-[11px] text-gray-600 text-center py-6">Cache bos. Bir işlem çalıştırin.</p>
      )}
    </div>
  )
}
