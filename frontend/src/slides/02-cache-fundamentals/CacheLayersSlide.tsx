import { motion } from 'framer-motion'

const layers = [
  {
    id: 'l1',
    label: 'L1 - Local Cache (JVM Heap)',
    latency: '~0.01ms',
    tech: 'ConcurrentHashMap / Caffeine',
    color: '#00f0ff',
    description: "Her instance'in kendi belleği. En hızlı ama sadece o pod/instance için geçerli.",
    width: '60%',
  },
  {
    id: 'l2',
    label: 'L2 - Distributed Cache (Redis)',
    latency: '~1ms',
    tech: 'Redis / Redisson',
    color: '#4090ff',
    description: "Tum instance'lar arası paylaşımlı. Netflix 75B+ key tutuyor. Network hop var ama çok hızlı.",
    width: '80%',
  },
  {
    id: 'db',
    label: 'Source of Truth (Database)',
    latency: '~50-150ms',
    tech: 'PostgreSQL / MySQL',
    color: '#b040ff',
    description: 'Persistent storage. Disk I/O + query execution. Cache MISS olursa buraya düşülür.',
    width: '100%',
  },
]

export default function CacheLayersSlide() {
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
        Cache Katmanları: L1, L2, Database
      </motion.h2>

      <div className="flex flex-col items-center space-y-4 max-w-3xl mx-auto">
        {layers.map((layer, i) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.3, duration: 0.6, type: 'spring' }}
            className="rounded-xl p-5 w-full relative overflow-hidden"
            style={{
              border: `1px solid ${layer.color}30`,
              background: `linear-gradient(135deg, ${layer.color}08, ${layer.color}03)`,
              maxWidth: layer.width,
            }}
          >
            {/* Animated top border */}
            <motion.div
              className="absolute top-0 left-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, transparent, ${layer.color}, transparent)` }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ delay: 0.5 + i * 0.3, duration: 0.8 }}
            />

            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-white text-base">{layer.label}</h3>
              <span
                className="text-sm font-mono font-bold px-3 py-1 rounded-full"
                style={{
                  color: layer.color,
                  backgroundColor: `${layer.color}15`,
                  textShadow: `0 0 8px ${layer.color}40`,
                }}
              >
                {layer.latency}
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-2">{layer.description}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Tech:</span>
              <span className="text-xs font-mono" style={{ color: layer.color }}>
                {layer.tech}
              </span>
            </div>
          </motion.div>
        ))}

        {/* Arrows between layers */}
        {[0, 1].map((i) => (
          <motion.div
            key={`arrow-${i}`}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.5 + i * 0.3, duration: 0.4 }}
            className="flex flex-col items-center -my-2 z-10"
          >
            <svg width="24" height="32" viewBox="0 0 24 32">
              <motion.path
                d="M12 0 L12 24 M6 18 L12 26 L18 18"
                stroke={['#00f0ff', '#4090ff'][i]}
                strokeWidth="2"
                fill="none"
                opacity={0.5}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.7 + i * 0.3, duration: 0.5 }}
              />
            </svg>
            <span className="text-[10px] font-mono" style={{ color: ['#00f0ff', '#4090ff'][i] + '80' }}>
              MISS
            </span>
          </motion.div>
        ))}
      </div>

      {/* Request flow summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="glass p-4 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 text-sm">
          <span className="font-mono" style={{ color: '#00f0ff' }}>L1 HIT?</span>
          <span style={{ color: '#00f0ff40' }}>{'>'}</span>
          <span className="font-mono" style={{ color: '#4090ff' }}>L2 HIT?</span>
          <span style={{ color: '#4090ff40' }}>{'>'}</span>
          <span className="font-mono" style={{ color: '#b040ff' }}>DB Query</span>
          <span style={{ color: '#b040ff40' }}>{'>'}</span>
          <span className="font-mono" style={{ color: '#ff40a0' }}>Populate Cache</span>
        </div>
      </motion.div>
    </div>
  )
}
