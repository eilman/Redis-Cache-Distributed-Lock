import { motion } from 'framer-motion'

const takeaways = [
  { title: 'Cache-Aside kullanın', detail: 'En yaygin ve güvenli pattern. Uygulama cache yönetiminden tamamen sorumlu.', letter: 'C', color: '#00f0ff' },
  { title: 'TTL mutlaka kullanın', detail: "Stale data'yi önlemek ve bellek yönetimi için her key'e TTL atayin.", letter: 'T', color: '#4090ff' },
  { title: "Stampede'e karşı kilit kullanın", detail: "Sadece 1 istek DB'ye gitsin, diğerleri beklesin.", letter: 'S', color: '#6366f1' },
  { title: 'Null caching yapin', detail: "Olmayan veriler için de cache'e not düşün.", letter: 'N', color: '#b040ff' },
  { title: 'Redisson kullanın', detail: 'RLock, watchdog ve reentrant özellikleri hazir. Tekerlek icat etmeyin.', letter: 'R', color: '#a855f7' },
  { title: 'Gösterge paneli kurun', detail: 'Hit rate, eviction, latency ve memory metriklerini sürekli izleyin.', letter: 'M', color: '#ff40a0' },
  { title: 'Fail-open strateji seçin', detail: 'Redis down olsa bile servis çalışmalı. Circuit breaker ile koruyun.', letter: 'F', color: '#06b6d4' },
]

export default function SummarySlide() {
  return (
    <div className="space-y-5">
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
        7 Altın Kural
      </motion.h2>

      {/* Neon divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mx-auto w-24 h-px origin-center"
        style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, #b040ff, transparent)' }}
      />

      <div className="space-y-2.5">
        {takeaways.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            whileHover={{ x: 8, transition: { duration: 0.2 } }}
            className="glass p-3 flex items-center gap-4 group cursor-default relative overflow-hidden"
          >
            {/* Animated left border */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 w-[2px]"
              style={{ background: t.color }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.3 }}
            />

            {/* Number */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0"
              style={{
                background: `${t.color}15`,
                color: t.color,
                border: `1px solid ${t.color}30`,
                textShadow: `0 0 6px ${t.color}40`,
              }}
            >
              {i + 1}
            </div>

            {/* Letter badge */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold flex-shrink-0"
              style={{
                background: `${t.color}10`,
                color: t.color,
                textShadow: `0 0 10px ${t.color}50`,
              }}
            >
              {t.letter}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">{t.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{t.detail}</p>
            </div>

            {/* Hover glow */}
            <motion.div
              className="absolute right-2 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
