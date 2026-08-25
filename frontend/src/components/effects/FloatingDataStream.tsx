import { motion } from 'framer-motion'
import { memo, useMemo } from 'react'

/** Floating binary/hex data fragments that drift across the screen */
function FloatingDataStream() {
  const fragments = useMemo(() => {
    const items = [
      'SET', 'GET', 'DEL', 'TTL', 'NX', 'PX', 'LOCK',
      '0xFF', '0x00', 'ACK', 'SYN', 'OK', 'nil',
      '10ms', '1ms', '200K', 'HIT', 'MISS',
      'HASH', 'ZSET', 'LIST', 'KEY', 'EXPIRE',
    ]
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      text: items[i % items.length],
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      size: 9 + Math.random() * 3,
      opacity: 0.03 + Math.random() * 0.04,
    }))
  }, [])

  const colors = ['#00f0ff', '#4090ff', '#b040ff', '#ff40a0']

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {fragments.map((f) => (
        <motion.span
          key={f.id}
          className="absolute font-mono font-bold whitespace-nowrap"
          style={{
            left: `${f.x}%`,
            top: `${f.y}%`,
            fontSize: f.size,
            color: colors[f.id % colors.length],
            opacity: f.opacity,
            textShadow: `0 0 10px ${colors[f.id % colors.length]}40`,
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, (f.id % 2 === 0 ? 30 : -30), (f.id % 2 === 0 ? -20 : 20)],
            opacity: [0, f.opacity, f.opacity, 0],
          }}
          transition={{
            duration: f.duration,
            delay: f.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {f.text}
        </motion.span>
      ))}
    </div>
  )
}

export default memo(FloatingDataStream)
