import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

/** Hexagonal Redis logo with neon glow */
function NeonRedisLogo() {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1, type: 'spring', stiffness: 100 }}
      className="relative"
    >
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            '0 0 30px rgba(0,240,255,0.2), 0 0 60px rgba(176,64,255,0.1)',
            '0 0 50px rgba(0,240,255,0.4), 0 0 100px rgba(176,64,255,0.2)',
            '0 0 30px rgba(0,240,255,0.2), 0 0 60px rgba(176,64,255,0.1)',
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 120, height: 120 }}
      />
      <svg viewBox="0 0 100 100" className="w-28 h-28 relative z-10">
        <defs>
          <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#4090ff" />
            <stop offset="100%" stopColor="#b040ff" />
          </linearGradient>
          <filter id="logoGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polygon
          points="50,5 95,25 95,75 50,95 5,75 5,25"
          fill="none"
          stroke="url(#logoGrad)"
          strokeWidth="2"
          opacity="0.6"
          filter="url(#logoGlow)"
        />
        <polygon
          points="50,15 85,30 85,70 50,85 15,70 15,30"
          fill="rgba(0,240,255,0.08)"
          stroke="url(#logoGrad)"
          strokeWidth="1.5"
        />
        <text
          x="50" y="58"
          textAnchor="middle"
          fill="url(#logoGrad)"
          fontSize="26"
          fontWeight="bold"
          filter="url(#logoGlow)"
        >
          R
        </text>
      </svg>
    </motion.div>
  )
}

/** Animated typing text effect */
function TypewriterText({ text, delay = 0 }: { text: string; delay?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      let i = 0
      const interval = setInterval(() => {
        if (i <= text.length) {
          setDisplayed(text.slice(0, i))
          i++
        } else {
          clearInterval(interval)
          // Blink cursor a few times then hide
          setTimeout(() => setShowCursor(false), 2000)
        }
      }, 60)
      return () => clearInterval(interval)
    }, delay)
    return () => clearTimeout(startTimeout)
  }, [text, delay])

  return (
    <span>
      {displayed}
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
          className="text-neon-cyan"
        >
          _
        </motion.span>
      )}
    </span>
  )
}

/** Orbiting data particles around the logo */
function OrbitingParticles() {
  const particles = [
    { label: 'CACHE', angle: 0, radius: 140, color: '#00f0ff', speed: 20 },
    { label: 'LOCK', angle: 120, radius: 140, color: '#b040ff', speed: 25 },
    { label: 'TTL', angle: 240, radius: 140, color: '#4090ff', speed: 22 },
  ]

  return (
    <>
      {particles.map((p, i) => (
        <motion.div
          key={p.label}
          className="absolute font-mono text-xs font-bold"
          style={{ color: p.color, textShadow: `0 0 10px ${p.color}60` }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            rotate: [p.angle, p.angle + 360],
          }}
          transition={{
            duration: p.speed,
            delay: 1.5 + i * 0.3,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <div
            style={{
              position: 'absolute',
              transform: `rotate(${p.angle}deg) translateX(${p.radius}px) rotate(-${p.angle}deg)`,
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {p.label}
            </motion.span>
          </div>
        </motion.div>
      ))}
    </>
  )
}

export default function TitleSlide() {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 relative">
      {/* Orbiting keywords */}
      <div className="relative">
        <OrbitingParticles />
        <NeonRedisLogo />
      </div>

      {/* Main title with neon gradient */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-6xl font-black"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff, #ff40a0)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: 'none',
          filter: 'drop-shadow(0 0 30px rgba(0,240,255,0.15))',
        }}
      >
        Redis Cache & Distributed Lock
      </motion.h1>

      {/* Subtitle with typewriter effect */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-lg text-gray-400 font-mono"
      >
        <TypewriterText
          text="High-performance caching & data consistency in distributed systems"
          delay={1200}
        />
      </motion.div>

      {/* Neon separator line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="w-48 h-px origin-center"
        style={{
          background: 'linear-gradient(90deg, transparent, #00f0ff, #b040ff, transparent)',
          boxShadow: '0 0 10px rgba(0,240,255,0.3)',
        }}
      />

      {/* Tech badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex items-center gap-3"
      >
        {['Spring Boot', 'Redis 7', 'Redisson', 'Distributed Systems'].map((tech, i) => (
          <motion.span
            key={tech}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6 + i * 0.1 }}
            className="px-3 py-1 text-xs font-mono rounded-full border"
            style={{
              borderColor: ['#00f0ff30', '#4090ff30', '#b040ff30', '#ff40a030'][i],
              color: ['#00f0ff', '#4090ff', '#b040ff', '#ff40a0'][i],
              background: ['rgba(0,240,255,0.06)', 'rgba(64,144,255,0.06)', 'rgba(176,64,255,0.06)', 'rgba(255,64,160,0.06)'][i],
              textShadow: `0 0 8px ${['#00f0ff30', '#4090ff30', '#b040ff30', '#ff40a030'][i]}`,
            }}
          >
            {tech}
          </motion.span>
        ))}
      </motion.div>

      {/* Floating data particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3,
            height: 2 + Math.random() * 3,
            background: ['#00f0ff', '#4090ff', '#b040ff', '#ff40a0'][i % 4],
            boxShadow: `0 0 6px ${['#00f0ff', '#4090ff', '#b040ff', '#ff40a0'][i % 4]}40`,
            left: `${10 + Math.random() * 80}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -60 - i * 10],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: 2 + i * 0.3,
            repeat: Infinity,
            repeatDelay: 1 + Math.random() * 3,
          }}
        />
      ))}
    </div>
  )
}
