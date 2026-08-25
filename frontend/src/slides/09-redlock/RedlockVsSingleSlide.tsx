import { motion } from 'framer-motion'
import Card from '../../components/ui/Card'

const comparisons = [
  {
    aspect: 'Karmaşıklık',
    single: { text: 'Basit', detail: 'Tek Redis instance yeterli' },
    redlock: { text: 'Karmaşık', detail: 'N adet bağımsız Redis instance gerekli' },
  },
  {
    aspect: 'Hız',
    single: { text: 'Hızlı (~1ms)', detail: 'Tek network round-trip' },
    redlock: { text: 'Daha yavaş (~5-15ms)', detail: 'N adet sequential SET işlemi' },
  },
  {
    aspect: 'Hata Toleransi',
    single: { text: 'Yok', detail: 'Redis düşerse lock mekanizması çalışmayı durdurur' },
    redlock: { text: 'Yüksek', detail: 'N/2-1 node düşebilir, sistem çalışmaya devam eder' },
  },
  {
    aspect: 'Tutarlılık',
    single: { text: 'Yüksek', detail: 'Tek kaynak, split-brain riski yok' },
    redlock: { text: 'Tartışmalı', detail: 'Clock drift ve NPC sorunları mümkün' },
  },
  {
    aspect: 'Operasyonel Yük',
    single: { text: 'Düşük', detail: 'Tek instance yönetimi' },
    redlock: { text: 'Yüksek', detail: '5+ bağımsız Redis instance yönetimi' },
  },
]

const useCases = [
  {
    title: 'Single Instance Lock Kullanın',
    color: 'indigo',
    items: [
      'Redis zaten HA (Sentinel/Cluster) ile korunuyor',
      'Lock kaybında en kötü ihtimal duplike işlem (idempotent)',
      'Performans kritik, latency önemli',
      'Basit deployment istiyorsunuz',
    ],
  },
  {
    title: 'Redlock Kullanın',
    color: 'red',
    items: [
      'Lock kaybında ciddi veri tutarsızlığı oluşur',
      'Finansal işlemler, envanter yönetimi',
      'Birden fazla bağımsız Redis instance zaten var',
      'Ekstra latency kabul edilebilir',
    ],
  },
]

export default function RedlockVsSingleSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Ev Kilidi vs Apartman Yönetim Kilidi
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20 text-center"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Evinizin önündeki kilit</span> (Single) basit ve hızlı.
          <span className="text-amber-400 font-semibold"> Apartman yönetimi kilidi</span> (Redlock) güvenceli ama yavaş ve karmaşık.
        </p>
      </motion.div>

      {/* Comparison Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl overflow-hidden"
      >
        <div className="grid grid-cols-[180px_1fr_1fr] gap-0">
          {/* Header */}
          <div className="bg-white/5 p-3 border-b border-white/10">
            <span className="text-sm font-semibold text-gray-400">Özellik</span>
          </div>
          <div className="bg-indigo-500/10 p-3 border-b border-white/10 text-center">
            <span className="text-sm font-bold text-indigo-400">Single Instance</span>
          </div>
          <div className="bg-red-500/10 p-3 border-b border-white/10 text-center">
            <span className="text-sm font-bold text-red-400">Redlock</span>
          </div>

          {/* Rows */}
          {comparisons.map((row, i) => (
            <motion.div
              key={row.aspect}
              className="contents"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <div className="p-3 border-b border-white/5 flex items-center">
                <span className="text-sm font-medium text-gray-300">{row.aspect}</span>
              </div>
              <div className="p-3 border-b border-white/5 text-center">
                <p className="text-sm font-semibold text-indigo-300">{row.single.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{row.single.detail}</p>
              </div>
              <div className="p-3 border-b border-white/5 text-center">
                <p className="text-sm font-semibold text-red-300">{row.redlock.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{row.redlock.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Use Case Cards */}
      <div className="grid grid-cols-2 gap-4">
        {useCases.map((useCase, i) => (
          <motion.div
            key={useCase.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.15 }}
          >
            <Card glow={useCase.color as 'indigo' | 'red'}>
              <h3
                className={`text-lg font-bold mb-4 ${
                  useCase.color === 'indigo' ? 'text-indigo-400' : 'text-red-400'
                }`}
              >
                {useCase.title}
              </h3>
              <ul className="space-y-2">
                {useCase.items.map((item, j) => (
                  <motion.li
                    key={j}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + i * 0.15 + j * 0.08 }}
                    className="flex items-start gap-2 text-sm text-gray-300"
                  >
                    <span
                      className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        useCase.color === 'indigo' ? 'bg-indigo-500' : 'bg-red-500'
                      }`}
                    />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
