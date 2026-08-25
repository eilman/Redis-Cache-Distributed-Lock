import { motion } from 'framer-motion'

export default function PatternProblemSlide() {
  return (
    <div className="space-y-4">
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
        Problem: Cache'i Kim Yönetiyor?
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 max-w-3xl mx-auto text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-lg text-gray-300">
          Redis cluster'iniz var. Ama <span style={{ color: '#4090ff' }} className="font-semibold">cache'i kim dolduruyor?</span>
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Uygulama kodu mu manuel yönetiyor? Yoksa framework otomatik mi hallediyor?
        </p>
      </motion.div>

      <div className="grid grid-cols-3 gap-5 max-w-4xl mx-auto">
        {[
          {
            icon: '🔧',
            title: 'Manuel Cache Yönetimi',
            desc: "Redis'e bak, yoksa DB'den cek, Redis'e yaz. Uygulama kodu tamamen kontrol ediyor.",
            badge: 'Cache-Aside',
            color: '#00f0ff',
          },
          {
            icon: '🤖',
            title: 'Framework Otomasyonu',
            desc: "@Cacheable annotation koy, gerisini Spring halletsin. Cache MISS'te otomatik DB'ye gider.",
            badge: 'Read-Through',
            color: '#4090ff',
          },
          {
            icon: '📝',
            title: 'Sync Write Pattern',
            desc: 'Veri yazıldığında hem cache hem DB ayni anda güncellenir. Strong consistency gerektiğinde kullanılır.',
            badge: 'Write-Through',
            color: '#b040ff',
          },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1, type: 'spring' }}
            className="glass p-5 space-y-3 text-center relative overflow-hidden"
            style={{ borderColor: `${item.color}25`, borderWidth: 1 }}
          >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} />
            <span className="text-3xl">{item.icon}</span>
            <h3 className="text-sm font-bold" style={{ color: item.color }}>{item.title}</h3>
            <p className="text-xs text-gray-400">{item.desc}</p>
            <div
              className="text-xs font-mono px-2 py-1 rounded"
              style={{ color: item.color, background: `${item.color}10` }}
            >
              {item.badge}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="glass p-4 max-w-2xl mx-auto text-center"
      >
        <p className="text-sm text-gray-400">
          Şimdi bu <span className="text-white font-semibold">3 farklı yaklaşımı</span> tek tek inceleyelim
          ve hangisinin ne zaman uygun olduğunu görelim.
        </p>
      </motion.div>
    </div>
  )
}
