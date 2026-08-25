import { motion } from 'framer-motion'

const metrics = [
  {
    name: 'Hit Rate',
    description: "Cache'den başarıyla okunan isteklerin oranı",
    threshold: '> %95 ideal',
    color: '#00f0ff',
    detail: 'keyspace_hits / (keyspace_hits + keyspace_misses)',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    name: 'Miss Rate',
    description: "Cache'de bulunamayan isteklerin oranı",
    threshold: '< %5 hedef',
    color: '#ff40a0',
    detail: 'Yüksekse: TTL çok kısa veya cache pattern yanlış',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
  {
    name: 'Eviction Count',
    description: 'Bellek doluluğu nedeniyle silinen key sayısı',
    threshold: '0 olmali (ideal)',
    color: '#b040ff',
    detail: 'Artıyorsa: maxmemory artırın veya TTL küçültün',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
      </svg>
    ),
  },
  {
    name: 'Memory Usage',
    description: "Redis'in kullandığı toplam bellek miktarı",
    threshold: '< maxmemory %80',
    color: '#4090ff',
    detail: 'used_memory / maxmemory oranını izleyin',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <path d="M7 10h10M7 14h6" />
      </svg>
    ),
  },
  {
    name: 'Connected Clients',
    description: 'Aktif bağlantı sayısı',
    threshold: 'maxclients limitinin altında',
    color: '#a855f7',
    detail: 'Connection pool size\'i optimize edin',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    name: 'Latency (p50/p99)',
    description: 'Komut işlem süresi (percentile bazında)',
    threshold: 'p99 < 5ms',
    color: '#6366f1',
    detail: 'Slow log ile yavaş komutları tespit edin',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1 },
}

export default function MetricsOverviewSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-center"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Redis Gösterge Paneli
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass p-3 text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300">
          <span style={{ color: '#4090ff' }} className="font-semibold">Arabadaki göstergeler gibi:</span>{' '}
          Hit Rate = Yakıt verimi, Eviction = Motor aşırı ısınması, Memory = Depo doluluğu, Latency = Motor tepki süresi.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-4"
      >
        {metrics.map((metric) => (
          <motion.div
            key={metric.name}
            variants={item}
            whileHover={{ scale: 1.03, y: -4 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="glass p-3 rounded-xl hover:shadow-lg transition-shadow relative overflow-hidden"
            style={{ borderColor: `${metric.color}20`, borderWidth: 1 }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${metric.color}, transparent)` }} />
            <div className="flex items-start gap-3 mb-3">
              <div
                className="p-2 rounded-lg"
                style={{ background: `${metric.color}10`, color: metric.color }}
              >
                {metric.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-sm">{metric.name}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{metric.description}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Eşik:</span>
                <span
                  className="text-xs font-mono font-semibold"
                  style={{ color: metric.color }}
                >
                  {metric.threshold}
                </span>
              </div>
              <div className="bg-black/20 rounded-lg p-2">
                <p className="text-[11px] text-gray-400 font-mono">{metric.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="glass p-4 rounded-xl"
        style={{ borderColor: 'rgba(176,64,255,0.2)', borderWidth: 1, background: 'rgba(176,64,255,0.03)' }}
      >
        <div className="flex items-start gap-3">
          <span style={{ color: '#b040ff' }} className="text-lg">!</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#b040ff' }}>Alerting Kuralları</p>
            <p className="text-xs text-gray-400 mt-1">
              Hit rate %90 altına düştüğünde, eviction sayısı arttığında ve p99 latency 10ms üzerine
              çıktığında alarm oluştürün. Prometheus + Grafana ile Redis Exporter kullanarak
              bu metrikleri kolayca izleyebilirsiniz.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
