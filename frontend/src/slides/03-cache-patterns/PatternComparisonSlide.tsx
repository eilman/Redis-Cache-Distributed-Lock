import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'

const columns = ['Pattern', 'Consistency', 'Performance', 'Complexity', 'Use Case']

const rows = [
  {
    pattern: 'Cache-Aside',
    consistency: { label: 'Eventual', color: 'text-amber-400' },
    performance: { label: 'Yüksek (read)', color: 'text-green-400' },
    complexity: { label: 'Düşük', color: 'text-green-400' },
    useCase: 'Read-heavy workload, genel amaçlı cache',
  },
  {
    pattern: 'Read-Through',
    consistency: { label: 'Eventual', color: 'text-amber-400' },
    performance: { label: 'Yüksek (read)', color: 'text-green-400' },
    complexity: { label: 'Orta', color: 'text-amber-400' },
    useCase: 'Framework-managed caching, temiz kod',
  },
  {
    pattern: 'Write-Through',
    consistency: { label: 'Strong', color: 'text-green-400' },
    performance: { label: 'Orta', color: 'text-amber-400' },
    complexity: { label: 'Orta', color: 'text-amber-400' },
    useCase: 'Consistency kritik senaryolar',
  },
  {
    pattern: 'Write-Behind',
    consistency: { label: 'Eventual', color: 'text-amber-400' },
    performance: { label: 'Çok Yüksek', color: 'text-green-400' },
    complexity: { label: 'Yüksek', color: 'text-red-400' },
    useCase: 'Write-heavy, eventual consistency uygun',
  },
]

export default function PatternComparisonSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Hangi Pattern'i Seçmeliyim?
      </motion.h2>

      {/* Decision guide */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20 max-w-3xl mx-auto text-center"
      >
        <p className="text-sm text-gray-300">
          Çoğu zaman <span className="text-green-400 font-semibold">Cache-Aside</span> yeterlidir.
          Spring Boot kullanıyorsanız <span className="text-indigo-400 font-semibold">@Cacheable</span> ile Read-Through da çok pratiktir.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass overflow-hidden rounded-xl"
      >
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <motion.tr
                key={row.pattern}
                variants={stagger.item}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.3 + i * 0.15 }}
                className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.04] transition-colors`}
              >
                <td className="px-4 py-3">
                  <span className="font-semibold text-white text-sm">{row.pattern}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${row.consistency.color}`}>
                    {row.consistency.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${row.performance.color}`}>
                    {row.performance.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-mono ${row.complexity.color}`}>
                    {row.complexity.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-400">{row.useCase}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      {/* Consistency aciklamasi */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="glass p-3 max-w-3xl mx-auto border border-white/5"
      >
        <div className="flex gap-6 justify-center text-xs text-gray-400">
          <div>
            <span className="text-green-400 font-semibold">Strong:</span> Cache ve DB her zaman senkron. Yazma aninda her ikisi de güncellenir.
          </div>
          <div>
            <span className="text-amber-400 font-semibold">Eventual:</span> Cache ve DB geçici olarak farklı olabilir, TTL veya invalidation ile sonunda tutarlı hale gelir.
          </div>
        </div>
      </motion.div>

      {/* Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="glass p-5 border border-green-500/30 max-w-2xl mx-auto"
      >
        <h4 className="text-sm font-bold text-green-400 mb-2">Öneri</h4>
        <p className="text-sm text-gray-300">
          Çoğu senaryoda <span className="text-white font-semibold">Cache-Aside</span> pattern'i
          yeterlidir. Spring Boot ile <span className="text-white font-semibold">@Cacheable</span> kullanarak
          Read-Through benzeri bir yaklaşım elde edebilirsiniz. Write-Behind sadece
          çok yüksek write throughput gerektiren özel senaryolarda tercih edilmelidir.
        </p>
      </motion.div>
    </div>
  )
}
