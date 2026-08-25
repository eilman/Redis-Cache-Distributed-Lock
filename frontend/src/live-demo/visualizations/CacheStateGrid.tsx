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

export default function CacheStateGrid({ entries }: Props) {
  return (
    <div className="glass p-3 space-y-2">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Cache Durumu</h4>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        <AnimatePresence>
          {entries.map((entry) => {
            const ttlPercent = entry.maxTtl > 0 ? (entry.ttl / entry.maxTtl) * 100 : 0
            const barColor = ttlPercent > 60 ? 'bg-green-500' : ttlPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

            return (
              <motion.div
                key={entry.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: entry.status === 'expired' ? 0.4 : 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className={`p-2 rounded-lg border ${
                  entry.status === 'expired'
                    ? 'border-gray-700/30 bg-gray-900/30'
                    : entry.status === 'expiring'
                    ? 'border-amber-500/20 bg-amber-500/5'
                    : 'border-cyan-500/15 bg-cyan-500/5'
                }`}
              >
                <p className="text-[10px] font-mono text-cyan-400 truncate">{entry.key}</p>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">{entry.value}</p>
                <div className="mt-1.5">
                  <div className="flex justify-between text-[8px] mb-0.5">
                    <span className="text-gray-600">TTL</span>
                    <span className={entry.status === 'expired' ? 'text-gray-600' : 'text-gray-400'}>
                      {entry.status === 'expired' ? 'EXPIRED' : `${entry.ttl}s`}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${barColor}`}
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
