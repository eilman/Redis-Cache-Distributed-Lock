import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const features = [
  {
    id: 'rlock',
    icon: '\uD83D\uDD12',
    title: 'RLock (Distributed Lock)',
    desc: 'SET NX + Lua script + UUID sahiplik kontrolü tek satırda. tryLock/unlock API\'si ile kolay kullanım.',
    code: `RLock lock = redisson.getLock("order:123");
if (lock.tryLock(5, 10, SECONDS)) {
    try {
        processOrder();
    } finally {
        lock.unlock();
    }
}`,
    color: 'indigo',
  },
  {
    id: 'watchdog',
    icon: '\uD83D\uDC15',
    title: 'Watchdog (Auto-Renewal)',
    desc: 'Lease süresi belirtmezsen Redisson arka planda süreyi otomatik uzatır. İş bitince veya process ölürse uzatma durur.',
    code: `// lease belirtme -> watchdog aktif (default 30s, her 10s uzatır)
lock.tryLock(5, TimeUnit.SECONDS);

// lease belirt -> watchdog KAPALI, tam kontrol sende
lock.tryLock(5, 10, TimeUnit.SECONDS);`,
    color: 'amber',
  },
  {
    id: 'reentrant',
    icon: '\uD83D\uDD04',
    title: 'Reentrant Lock',
    desc: 'Aynı thread lock\'u birden fazla alabilir (hold count artar). Nested method çağrılarında deadlock olmaz.',
    code: `lock.lock();       // holdCount = 1
lock.lock();       // holdCount = 2 (aynı thread)
lock.unlock();     // holdCount = 1
lock.unlock();     // holdCount = 0 -> lock serbest`,
    color: 'emerald',
  },
  {
    id: 'lua',
    icon: '\u26A1',
    title: 'Atomik Lua Script\'leri',
    desc: 'Lock al, kontrol et, serbest bırak işlemlerini Redis\'te atomik olarak çalıştırır. Race condition imkânsız.',
    code: `-- Redisson'un arka planda kullandığı Lua (unlock):
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0  -- başkasının lock'unu silme!
end`,
    color: 'rose',
  },
]

const manualSteps = [
  { step: 'SET NX PX komutu yaz', risk: 'TTL yanlış hesaplanabilir' },
  { step: 'UUID üret, sakla', risk: 'Thread-safety sorunları' },
  { step: 'Lua script yaz (unlock)', risk: 'Script hataları, atomiklik' },
  { step: 'Lease uzatma mekanizması', risk: 'Timer leak, memory leak' },
  { step: 'Reentrant destek ekle', risk: 'Hold count yönetimi' },
  { step: 'Hata yönetimi, retry logic', risk: 'Edge case\'ler bitmez' },
]

export default function RedissonIntroSlide() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const active = features.find(f => f.id === activeFeature)

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
        Redisson: Redis Üzerinde Java Toolkit
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300 leading-relaxed">
          <span style={{ color: '#ff40a0' }} className="font-semibold">Distributed lock'u sıfırdan yazmak karmaşık ve hataya açıktır</span> — UUID üretimi,
          Lua script'leri, lease uzatma gibi birçok detayı doğru yönetmeniz gerekir.{' '}
          <span style={{ color: '#4090ff' }} className="font-semibold">Redisson</span>, Redis üzerinde{' '}
          <span className="text-white font-semibold">distributed lock, semaphore, queue</span> gibi yapıları
          hazır sunan bir <span className="text-white font-semibold">Java client kütüphanesi</span>dir.
          Watchdog, Lua script ve reentrant lock desteğini kutudan çıktığı hâliyle sağlar —
          tüm bu karmaşıklığı sizin için yönetir.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Manual vs Redisson comparison */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          {/* Manual approach - what you'd have to build */}
          <div className="glass p-3 rounded-xl" style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#ff40a0' }}>
              <span className="text-base">\u2717</span> Manuel Implementasyon
            </h3>
            <div className="space-y-1.5">
              {manualSteps.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2 text-xs"
                >
                  <span className="font-mono w-4 text-right" style={{ color: 'rgba(255,64,160,0.5)' }}>{i + 1}.</span>
                  <span className="text-gray-300 flex-1">{item.step}</span>
                  <span className="text-[10px] italic" style={{ color: 'rgba(255,64,160,0.4)' }}>{item.risk}</span>
                </motion.div>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-white/5 text-center">
              <span className="text-[10px] font-mono" style={{ color: 'rgba(255,64,160,0.5)' }}>~200+ satır kod + edge case'ler</span>
            </div>
          </div>

          {/* Redisson approach */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass p-3 rounded-xl"
            style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
          >
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: '#00f0ff' }}>
              <span className="text-base">\u2713</span> Redisson ile
            </h3>
            <pre className="text-[11px] font-mono text-gray-300 bg-black/30 rounded-lg p-2.5 overflow-x-auto">
              <code>{`RLock lock = redisson.getLock("order:123");
lock.tryLock(5, TimeUnit.SECONDS);
try {
    processOrder();
} finally {
    lock.unlock();
}`}</code>
            </pre>
            <div className="mt-2 pt-2 border-t border-white/5 text-center">
              <span className="text-[10px] font-mono" style={{ color: 'rgba(0,240,255,0.5)' }}>6 satır. Watchdog + Lua + reentrant dahil.</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Feature cards - clickable */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <p className="text-xs text-gray-500 text-center mb-1">Detay için tıklayınız</p>

          {features.map((feature, i) => {
            const isActive = activeFeature === feature.id
            const colorMap: Record<string, { border: string; bg: string; text: string; activeBg: string }> = {
              indigo:  { border: 'border-indigo-500/30', bg: 'hover:bg-indigo-500/5', text: 'text-indigo-400', activeBg: 'bg-indigo-500/10 border-indigo-500/50' },
              amber:   { border: 'border-amber-500/30', bg: 'hover:bg-amber-500/5', text: 'text-amber-400', activeBg: 'bg-amber-500/10 border-amber-500/50' },
              emerald: { border: 'border-emerald-500/30', bg: 'hover:bg-emerald-500/5', text: 'text-emerald-400', activeBg: 'bg-emerald-500/10 border-emerald-500/50' },
              rose:    { border: 'border-rose-500/30', bg: 'hover:bg-rose-500/5', text: 'text-rose-400', activeBg: 'bg-rose-500/10 border-rose-500/50' },
            }
            const c = colorMap[feature.color]

            return (
              <motion.button
                key={feature.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onClick={() => setActiveFeature(isActive ? null : feature.id)}
                className={`w-full glass p-3 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
                  isActive ? c.activeBg : `${c.border} ${c.bg}`
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl flex-shrink-0">{feature.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${c.text}`}>{feature.title}</p>
                    <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{feature.desc}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: isActive ? 180 : 0 }}
                    className="text-gray-500 text-xs flex-shrink-0"
                  >
                    \u25BC
                  </motion.span>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      </div>

      {/* Expanded code panel */}
      <AnimatePresence mode="wait">
        {active && (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-white">{active.icon} {active.title}</h4>
                <span className="text-[10px] font-mono text-gray-500 bg-white/5 px-2 py-0.5 rounded">
                  {active.id === 'lua' ? 'lua' : 'java'}
                </span>
              </div>
              <pre className="text-[11px] font-mono text-gray-300 bg-black/40 rounded-lg p-3 overflow-x-auto leading-relaxed">
                <code>{active.code}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="glass p-2.5 text-center text-xs text-gray-400 border border-white/5"
      >
        <span className="text-indigo-400 font-mono">org.redisson:redisson-spring-boot-starter:3.30.0</span>
        {' '}\u2014 Spring Boot ile tek dependency ekleyerek tüm özellikleri kullanabilirsiniz.
      </motion.div>
    </div>
  )
}
