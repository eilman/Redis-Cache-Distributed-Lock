import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'

const keyPoints = [
  {
    title: 'Veritabanı yükünü azaltır',
    description: 'Tekrarlayan sorgular cache üzerinden karşılanır, DB\'ye giden trafik azalır.',
    color: '#00f0ff',
  },
  {
    title: 'Latency düşer',
    description: 'In-memory erişim disk I/O\'dan katlar mertebesinde hızlıdır.',
    color: '#4090ff',
  },
  {
    title: 'Throughput artar',
    description: 'Aynı kaynaklarla çok daha fazla istek işlenir.',
    color: '#b040ff',
  },
]

export default function WhyCacheSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Neden Cache?
      </motion.h2>

      {/* Analogy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-4 max-w-3xl relative overflow-hidden"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #4090ff, transparent)' }} />
        <p className="text-sm text-gray-300 leading-relaxed">
          <span style={{ color: '#4090ff' }} className="font-semibold">Bir e-commerce uygulaması düşünün:</span> Kullanıcı ürün sayfasını her açtığında
          ürün bilgisi, fiyat, stok durumu ve yorumlar için <span style={{ color: '#ff40a0' }} className="font-semibold">veritabanına sorgu atılıyor</span> (~150ms).
          Aynı ürünü saniyede 10.000 kişi görüntülüyorsa, DB bu yükü kaldıramaz.
        </p>
        <p className="text-sm text-gray-300 mt-2 leading-relaxed">
          <span style={{ color: '#00f0ff' }} className="font-semibold">Çözüm:</span> Bu verileri ilk sorguda Redis'e yazın.
          Sonraki istekler <span style={{ color: '#00f0ff' }} className="font-semibold">~1ms</span> içinde Redis'ten döner — DB'ye hiç gitmeden.
          Veri değiştiğinde cache güncellenir veya TTL ile otomatik yenilenir.
        </p>
      </motion.div>

      {/* Latency Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 space-y-4"
      >
        <h3 className="text-lg font-semibold text-white">Latency Karşılaştırması</h3>

        {/* Database bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 w-32">Database (PostgreSQL)</span>
            <span className="font-mono" style={{ color: '#ff40a0' }}>~150ms</span>
          </div>
          <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5, duration: 1.2, ease: 'easeOut' }}
              className="h-full rounded-lg flex items-center justify-end pr-3"
              style={{ background: 'linear-gradient(90deg, #b040ff, #ff40a0)' }}
            >
              <span className="text-xs font-mono text-white/90">150ms</span>
            </motion.div>
          </div>
        </div>

        {/* Redis Cache bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 w-32">Redis Cache</span>
            <span className="font-mono" style={{ color: '#00f0ff' }}>~1ms</span>
          </div>
          <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '0.67%' }}
              transition={{ delay: 0.8, duration: 0.6, ease: 'easeOut' }}
              className="h-full rounded-lg min-w-[48px] flex items-center justify-end pr-3"
              style={{ background: 'linear-gradient(90deg, #00f0ff, #4090ff)' }}
            >
              <span className="text-xs font-mono text-white/90">1ms</span>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-sm"
        >
          <span
            className="font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #00f0ff, #b040ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            ~150x
          </span>
          <span className="text-gray-400 ml-2">daha hızlı</span>
        </motion.div>
      </motion.div>

      {/* Key Points */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-3 gap-4"
      >
        {keyPoints.map((point) => (
          <motion.div
            key={point.title}
            variants={stagger.item}
            className="glass p-5 space-y-2 relative overflow-hidden"
            style={{
              borderColor: `${point.color}20`,
              borderWidth: 1,
              boxShadow: `0 0 20px ${point.color}10, 0 0 60px ${point.color}05`,
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${point.color}, transparent)` }} />
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
              style={{ background: `${point.color}15`, color: point.color }}
            >
              {'⚡'}
            </div>
            <h4 className="font-semibold text-white text-sm">{point.title}</h4>
            <p className="text-xs text-gray-400 leading-relaxed">{point.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
