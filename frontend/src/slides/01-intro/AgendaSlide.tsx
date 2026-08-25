import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'

const agendaItems = [
  {
    icon: '01',
    title: 'Cache Temelleri',
    description: 'Netflix 200M kullanıcı, 10K RPS: neden DB yetmiyor?',
    color: '#00f0ff',
    gradient: 'from-cyan-500/10 to-cyan-900/10',
  },
  {
    icon: '02',
    title: 'Cache Yaklaşımları',
    description: 'Cache-Aside, Read-Through, Write-Through patternleri',
    color: '#4090ff',
    gradient: 'from-blue-500/10 to-blue-900/10',
  },
  {
    icon: '03',
    title: 'TTL & Key Tasarımı',
    description: "Stale data problemi: Black Friday'da eski fiyat gösterme",
    color: '#6366f1',
    gradient: 'from-indigo-500/10 to-indigo-900/10',
  },
  {
    icon: '04',
    title: 'Cache Problemleri',
    description: 'Thundering Herd & Cache Penetration: production incidents',
    color: '#b040ff',
    gradient: 'from-purple-500/10 to-purple-900/10',
  },
  {
    icon: '05',
    title: 'Dayanıklılık',
    description: 'Redis Cluster down olursa? Circuit Breaker & Fail-Open/Close',
    color: '#a855f7',
    gradient: 'from-violet-500/10 to-violet-900/10',
  },
  {
    icon: '06',
    title: 'Dağıtık Kilit',
    description: 'Race condition: Uber 3 pod aynı siparişi işlerse?',
    color: '#ff40a0',
    gradient: 'from-pink-500/10 to-pink-900/10',
  },
  {
    icon: '07',
    title: 'Redlock Algoritması',
    description: "Quorum-based locking: N node'un N/2+1 onay gerektirmesi",
    color: '#ec4899',
    gradient: 'from-rose-500/10 to-rose-900/10',
  },
  {
    icon: '08',
    title: 'İzleme & Test',
    description: 'Prometheus metrics, hit rate, latency percentiles',
    color: '#06b6d4',
    gradient: 'from-teal-500/10 to-teal-900/10',
  },
]

export default function AgendaSlide() {
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
        Yol Haritamız
      </motion.h2>

      {/* Neon divider */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mx-auto w-32 h-px origin-center"
        style={{
          background: 'linear-gradient(90deg, transparent, #00f0ff, #b040ff, transparent)',
        }}
      />

      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 max-w-4xl mx-auto"
      >
        {agendaItems.map((item, i) => (
          <motion.div
            key={item.title}
            variants={stagger.item}
            whileHover={{
              scale: 1.03,
              transition: { duration: 0.2 },
            }}
            className={`glass p-4 cursor-pointer border rounded-xl group transition-all relative overflow-hidden bg-gradient-to-br ${item.gradient}`}
            style={{ borderColor: `${item.color}25` }}
          >
            {/* Animated top border line */}
            <motion.div
              className="absolute top-0 left-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }}
              initial={{ width: '0%' }}
              whileHover={{ width: '100%' }}
              transition={{ duration: 0.4 }}
            />

            <div className="flex items-start gap-3">
              {/* Number badge with neon glow */}
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 relative"
                style={{
                  background: `${item.color}10`,
                  color: item.color,
                  border: `1px solid ${item.color}30`,
                  textShadow: `0 0 8px ${item.color}40`,
                }}
              >
                {item.icon}
                {/* Pulse dot */}
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: item.color }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm group-hover:text-opacity-100 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>

            {/* Bottom corner decoration */}
            <div
              className="absolute bottom-0 right-0 w-6 h-6 opacity-20"
              style={{
                borderRight: `1px solid ${item.color}`,
                borderBottom: `1px solid ${item.color}`,
              }}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Connection line between items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex justify-center items-center gap-2 text-xs text-gray-500 font-mono"
      >
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {'{'}
        </motion.span>
        <span className="text-neon-cyan/40">cache</span>
        <span className="text-gray-600">{'>'}</span>
        <span className="text-neon-blue/40">patterns</span>
        <span className="text-gray-600">{'>'}</span>
        <span className="text-neon-purple/40">resilience</span>
        <span className="text-gray-600">{'>'}</span>
        <span className="text-neon-pink/40">locks</span>
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {'}'}
        </motion.span>
      </motion.div>
    </div>
  )
}
