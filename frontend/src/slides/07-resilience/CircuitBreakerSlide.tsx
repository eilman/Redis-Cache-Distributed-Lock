import { motion } from 'framer-motion'

const states = [
  {
    name: 'CLOSED',
    desc: "Normal akış. İstekler Redis'e gidiyor. Hatalar sayılıyor.",
    color: '#00f0ff',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#00f0ff" strokeWidth={2}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    name: 'OPEN',
    desc: "Hata eşiği aşıldı. Redis'e istek gönderilmez, doğrudan fallback çağrılır.",
    color: '#ff40a0',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#ff40a0" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
    ),
  },
  {
    name: 'HALF_OPEN',
    desc: "Bekleme süresi doldu. Sınırlı sayıda istek Redis'e gönderilerek test edilir.",
    color: '#fbbf24',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#fbbf24" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

const transitions = [
  { from: 'CLOSED', to: 'OPEN', trigger: 'Hata oranı eşiği aşıyor', color: '#ff40a0' },
  { from: 'OPEN', to: 'HALF_OPEN', trigger: 'Bekleme süresi (timeout) doluyor', color: '#fbbf24' },
  { from: 'HALF_OPEN', to: 'CLOSED', trigger: 'Test istekleri başarılı', color: '#00f0ff' },
  { from: 'HALF_OPEN', to: 'OPEN', trigger: 'Test istekleri başarısız', color: '#ff40a0' },
]

export default function CircuitBreakerSlide() {
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
        Circuit Breaker Pattern
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300">
          Elektrik sigortası mantığı: Arka arkaya çok fazla hata olursa,
          <span style={{ color: '#00f0ff' }} className="font-semibold"> devreyi kes</span> ve
          başarısız olacağı bilinen istekleri gönderme.
          Belirli bir süre sonra tekrar dene.
        </p>
      </motion.div>

      {/* 3 States */}
      <div className="grid grid-cols-3 gap-3">
        {states.map((s, i) => (
          <motion.div
            key={s.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="glass p-4 space-y-2 text-center relative overflow-hidden"
            style={{
              borderColor: `${s.color}25`,
              borderWidth: 1,
              background: `linear-gradient(180deg, ${s.color}08, transparent)`,
            }}
          >
            {/* Top glow line */}
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}, transparent)` }} />

            <div className="flex justify-center">{s.icon}</div>
            <p className="text-lg font-bold" style={{ color: s.color, textShadow: `0 0 10px ${s.color}40` }}>{s.name}</p>
            <p className="text-xs text-gray-400">{s.desc}</p>

            {/* Pulse dot */}
            <motion.div
              className="absolute top-3 right-3 w-2 h-2 rounded-full"
              style={{ background: s.color }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* State Transitions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="glass p-4 space-y-2"
      >
        <h3 className="text-sm font-semibold text-gray-400 mb-3 font-mono">// State Geçişleri</h3>
        {transitions.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="flex items-center gap-3 text-sm"
          >
            <span className="font-mono text-gray-300 w-24 text-right">{t.from}</span>
            <motion.span
              style={{ color: t.color }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.span>
            <span className="font-mono text-gray-300 w-24">{t.to}</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-xs">{t.trigger}</span>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="glass p-3 text-center text-sm"
      >
        <p className="text-gray-400">
          <span style={{ color: '#00f0ff' }} className="font-semibold">Fail-Open</span> + Circuit Breaker:
          CB <span style={{ color: '#ff40a0' }}>OPEN</span> iken Redis'e hiç gitmeden doğrudan DB fallback'e düşer →
          <span style={{ color: '#4090ff' }}> gereksiz timeout beklenmez</span>, DB yükünü kontrol altında tutar.
        </p>
      </motion.div>
    </div>
  )
}
