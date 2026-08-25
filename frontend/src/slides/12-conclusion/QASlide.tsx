import { motion } from 'framer-motion'

/** Pulsing neon ring effect */
function NeonRing({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute rounded-full border"
      style={{ borderColor: 'rgba(0,240,255,0.15)' }}
      initial={{ width: 60, height: 60, opacity: 0 }}
      animate={{
        width: [60, 200],
        height: [60, 200],
        opacity: [0.6, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  )
}

export default function QASlide() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
      {/* Neon Redis logo */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: 'spring' }}
        className="relative flex items-center justify-center"
      >
        {/* Pulsing rings */}
        <NeonRing delay={0} />
        <NeonRing delay={1} />
        <NeonRing delay={2} />

        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
          <svg viewBox="0 0 100 100" className="w-24 h-24 relative z-10">
            <defs>
              <linearGradient id="qaLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#b040ff" />
              </linearGradient>
              <filter id="qaGlow">
                <feGaussianBlur stdDeviation="3" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <polygon points="50,5 95,25 95,75 50,95 5,75 5,25" fill="none" stroke="url(#qaLogoGrad)" strokeWidth="2" opacity="0.7" filter="url(#qaGlow)" />
            <polygon points="50,15 85,30 85,70 50,85 15,70 15,30" fill="rgba(0,240,255,0.06)" stroke="url(#qaLogoGrad)" strokeWidth="1" />
            <text x="50" y="58" textAnchor="middle" fill="url(#qaLogoGrad)" fontSize="24" fontWeight="bold" filter="url(#qaGlow)">R</text>
          </svg>
        </motion.div>
      </motion.div>

      {/* Giant question mark */}
      <motion.span
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: [1, 1.05, 1] }}
        transition={{ delay: 0.3, duration: 2, repeat: Infinity }}
        className="text-8xl font-black"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 20px rgba(0,240,255,0.3))',
        }}
      >
        ?
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-5xl font-bold"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Sorular?
      </motion.h2>

      {/* Resources card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass p-6 max-w-md w-full relative overflow-hidden"
      >
        {/* Top neon line */}
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, #b040ff, transparent)' }} />

        <h3 className="text-sm text-gray-400 mb-3 font-mono">// Kaynaklar</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { name: 'Redis Documentation', url: 'redis.io/docs', color: '#00f0ff' },
            { name: 'Redisson GitHub', url: 'github.com/redisson', color: '#4090ff' },
            { name: 'Spring Cache Guide', url: 'spring.io/guides', color: '#b040ff' },
            { name: 'Redlock Algorithm', url: 'redis.io/topics/distlock', color: '#ff40a0' },
          ].map(link => (
            <div
              key={link.name}
              className="rounded-lg px-3 py-2 transition-all hover:scale-[1.02]"
              style={{
                background: `${link.color}08`,
                border: `1px solid ${link.color}20`,
              }}
            >
              <p className="font-semibold text-white">{link.name}</p>
              <p style={{ color: `${link.color}80` }} className="font-mono">{link.url}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Thanks */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ delay: 1, duration: 3, repeat: Infinity }}
        className="text-3xl font-bold"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 15px rgba(0,240,255,0.2))',
        }}
      >
        Teşekkürler!
      </motion.p>

      {/* Tech stack badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="flex items-center gap-3 text-sm font-mono"
      >
        {[
          { name: 'Spring Boot', color: '#00f0ff' },
          { name: 'Redis', color: '#4090ff' },
          { name: 'Redisson', color: '#b040ff' },
        ].map((tech, i) => (
          <span key={tech.name} className="flex items-center gap-2">
            {i > 0 && (
              <motion.span
                className="w-1 h-1 rounded-full"
                style={{ background: tech.color, boxShadow: `0 0 4px ${tech.color}` }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
              />
            )}
            <span style={{ color: `${tech.color}90` }}>{tech.name}</span>
          </span>
        ))}
      </motion.div>
    </div>
  )
}
