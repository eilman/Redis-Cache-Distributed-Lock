import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'
import CodeBlock from '../../components/code/CodeBlock'

const ttlCode = `// Redis CLI
SET product:42 "{"name":"Laptop"}" EX 60

// Spring Boot ile TTL ayarlama
redis.opsForValue()
    .set(key, value, Duration.ofMinutes(30));

// @Cacheable ile TTL
@Cacheable(value = "products", key = "#id",
    cacheManager = "ttlCacheManager")
public Product getProduct(Long id) { ... }`

const ttlStrategies = [
  {
    title: 'Sabit TTL',
    description: 'Tüm key\'ler için aynı süre. Örnek: 30 dakika.',
    code: 'EX 1800',
    color: 'text-green-400',
  },
  {
    title: 'Dinamik TTL',
    description: 'Verinin özelliğine göre değişen süre.',
    code: 'EX calculateTTL(data)',
    color: 'text-amber-400',
  },
  {
    title: 'Jittered TTL',
    description: 'Cache Avalanche\'i önlemek için rastgele sapma eklenir.',
    code: 'EX baseTTL + random(0, 300)',
    color: 'text-indigo-400',
  },
]

export default function TTLConceptSlide() {
  const [ttl, setTtl] = useState(60)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return
    const timer = setInterval(() => {
      setTtl((prev) => {
        if (prev <= 0) {
          setIsRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning])

  const resetTimer = () => {
    setTtl(60)
    setIsRunning(true)
  }

  const percentage = (ttl / 60) * 100
  const timerColor = ttl > 30 ? '#22c55e' : ttl > 10 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        TTL: Veriye Son Kullanma Tarihi
      </motion.h2>

      {/* Analogy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">JWT (JSON Web Token)</span> kullanıcı kimlik doğrulama için kullanılan bir token standardıdır.
          Redis bağlamında önemlidir çünkü ikisi de <span className="text-amber-400">TTL/expire</span> mantığıyla çalışır:
          JWT'de <code className="text-xs bg-black/30 px-1 rounded">exp</code> alanı token'ın ne zaman geçersiz olacağını belirler — süre dolunca token reddedilir.
          Redis TTL de aynı mantık: key'e bir ömür biçersiniz, süre dolunca Redis o key'i otomatik siler.
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Stale data kullanıcıya ulaşmadan temizlenir. <span className="text-amber-400">Netflix</span> tüm cache key'lerine TTL atar —
          hiçbir key sonsuza kadar yaşamaz, böylece eski veri birikimi önlenir.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Timer + Strategies */}
        <div className="space-y-4">
          {/* Animated TTL Countdown */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass p-4 flex flex-col items-center space-y-3"
          >
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              TTL Countdown
            </h3>

            {/* Circular progress */}
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="6"
                />
                {/* Progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={timerColor}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - percentage / 100)}`}
                  animate={{
                    strokeDashoffset: 2 * Math.PI * 42 * (1 - percentage / 100),
                    stroke: timerColor,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className="text-3xl font-bold font-mono"
                  style={{ color: timerColor }}
                >
                  {ttl}
                </span>
                <span className="text-xs text-gray-500">saniye</span>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              {ttl === 0 ? (
                <span className="text-sm text-red-400 font-mono">EXPIRED - Key silindi!</span>
              ) : (
                <span className="text-sm text-gray-400 font-mono">
                  product:42 - {ttl > 0 ? 'ACTIVE' : 'EXPIRED'}
                </span>
              )}
            </div>

            <button
              onClick={resetTimer}
              className="px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-300 transition-colors"
            >
              Sıfırla (SET ... EX 60)
            </button>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass p-4 border border-amber-500/20"
          >
            <p className="text-sm text-gray-300">
              Veri belirli bir süre sonra <span className="text-amber-400 font-semibold">otomatik olarak silinir</span>.
              Bu mekanizma stale data sorununu önler ve bellek yönetimini kolaylaştırır.
            </p>
          </motion.div>

          {/* TTL Strategies */}
          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {ttlStrategies.map((strategy) => (
              <motion.div
                key={strategy.title}
                variants={stagger.item}
                className="glass p-3 flex items-center gap-3"
              >
                <div className="flex-1">
                  <h4 className={`text-sm font-semibold ${strategy.color}`}>{strategy.title}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">{strategy.description}</p>
                </div>
                <code className="text-xs font-mono text-gray-500 bg-black/30 px-2 py-1 rounded">
                  {strategy.code}
                </code>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Right: Code */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CodeBlock
            code={ttlCode}
            language="java"
            title="TTL Kullanımı"
          />
        </motion.div>
      </div>
    </div>
  )
}
