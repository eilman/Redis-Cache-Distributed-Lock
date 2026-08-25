import { motion } from 'framer-motion'

const strategies = [
  {
    title: 'TTL-Based',
    desc: 'Her cache key\'e sabit TTL ata (örneğin 30 dk). Süre dolunca otomatik silinir. Netflix & GitHub kullanır.',
    pros: ['Basit implementasyon', 'Otomatik temizlik'],
    cons: ['Stale data riski', 'TTL seçimi zor'],
    color: 'border-green-500/30',
    badge: 'bg-green-500/20 text-green-400',
  },
  {
    title: 'Event-Driven',
    desc: 'DB değişikliği olunca Kafka/RabbitMQ event\'i ile cache invalidate edilir. Uber & Airbnb kullanır.',
    pros: ['Anında tutarlılık', 'Minimum stale data'],
    cons: ['Event altyapısı gerekli', 'Karmaşık'],
    color: 'border-indigo-500/30',
    badge: 'bg-indigo-500/20 text-indigo-400',
  },
  {
    title: 'Manual',
    desc: 'Admin panel veya scheduled job ile belirli key pattern\'leri temizlenir. Deploy sonrası cache flush gibi.',
    pros: ['Tam kontrol', 'Basit anlaşılır'],
    cons: ['Unutulabilir', 'Dağıtık sistemlerde zor'],
    color: 'border-yellow-500/30',
    badge: 'bg-yellow-500/20 text-yellow-400',
  },
  {
    title: 'Versioned Keys',
    desc: 'Key\'e versiyon numarası eklenir (product:v2:42). Yeni versiyon yazılır, eski TTL ile düşer. Blue-green deployment mantığı.',
    pros: ['Atomic geçiş', 'Rollback kolaylığı'],
    cons: ['Eski key temizliği', 'Key boyutu artar'],
    color: 'border-cyan-500/30',
    badge: 'bg-cyan-500/20 text-cyan-400',
  },
]

export default function InvalidationStrategiesSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Veriyi Ne Zaman Çöpe Atarız?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 italic"
      >
        "There are only two hard things in CS: cache invalidation and naming things." - Phil Karlton
      </motion.p>
      <div className="grid grid-cols-2 gap-4">
        {strategies.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className={`glass p-4 border ${s.color} space-y-2`}
          >
            <span className={`text-xs px-2 py-0.5 rounded-full ${s.badge}`}>{s.title}</span>
            <p className="text-sm text-gray-300">{s.desc}</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-green-400 font-semibold mb-1">Avantajlar</p>
                {s.pros.map(p => <p key={p} className="text-gray-400">+ {p}</p>)}
              </div>
              <div>
                <p className="text-red-400 font-semibold mb-1">Dezavantajlar</p>
                {s.cons.map(c => <p key={c} className="text-gray-400">- {c}</p>)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
