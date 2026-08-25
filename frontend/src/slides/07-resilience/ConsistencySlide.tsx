import { motion } from 'framer-motion'

const problems = [
  { title: 'Dual Write', desc: "Cache ve DB'yi ayrı ayrı güncellemek race condition yaratır.", color: '#ff40a0' },
  { title: 'Stale Data', desc: "Cache'deki veri DB'den eski kalabilir.", color: '#b040ff' },
  { title: 'Race Condition', desc: "Birden fazla işlem aynı anda cache'i güncelleyebilir.", color: '#fbbf24' },
]

const solutions = [
  { title: 'TTL', desc: "Her key'e TTL atayın. Stale data en fazla TTL kadar kalır.", color: '#00f0ff' },
  { title: 'Event-Driven', desc: 'DB değişikliklerinde event yayınlayarak cache invalidate edin.', color: '#4090ff' },
  { title: 'Distributed Lock', desc: 'Kritik yazma işlemlerinde lock ile sıra garantisi sağlayın.', color: '#b040ff' },
]

export default function ConsistencySlide() {
  return (
    <div className="space-y-6">
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
        Cache-DB Consistency Problemi
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300">
          <span style={{ color: '#4090ff' }} className="font-semibold">E-commerce'de stok güncelleniyor:</span> Redis'teki cache ve PostgreSQL'deki gerçek veri
          aynı anda güncel olmalı. Birini güncelleyip diğeri başarısız olursa? Kullanici stokta olmayan urunu satin alabilir.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: '#ff40a0' }}>Problemler</h3>
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass p-4 border-l-2 relative overflow-hidden"
              style={{ borderLeftColor: p.color }}
            >
              <p className="font-semibold" style={{ color: p.color }}>{p.title}</p>
              <p className="text-sm text-gray-400 mt-1">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: '#00f0ff' }}>Çözümler</h3>
          {solutions.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="glass p-4 border-l-2 relative overflow-hidden"
              style={{ borderLeftColor: s.color }}
            >
              <p className="font-semibold" style={{ color: s.color }}>{s.title}</p>
              <p className="text-sm text-gray-400 mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
