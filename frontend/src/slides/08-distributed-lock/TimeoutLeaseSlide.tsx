import { motion } from 'framer-motion'

export default function TimeoutLeaseSlide() {
  return (
    <div className="space-y-4">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Timeout & Lease Time Stratejileri
      </motion.h2>

      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-3 border border-orange-500/20 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">⏳</span>
            <h4 className="text-sm font-bold text-orange-400">Wait Timeout</h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Lock almak için <span className="text-orange-300 font-semibold">maksimum bekleme süresi</span>.
            Bu süre içinde kilit alınamazsa istek başarısız sayılır ve client'a hata döner.
            Böylece sistemde sonsuz bekleme (deadlock) oluşmaz.
          </p>
          <p className="text-xs text-orange-400/60 font-mono">Örnek: max 5 saniye bekle</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-3 border border-cyan-500/20 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🔐</span>
            <h4 className="text-sm font-bold text-cyan-400">Lease Time</h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Kilidin <span className="text-cyan-300 font-semibold">otomatik sona erme süresi</span>.
            Lock'u tutan process crash olursa veya unlock yapmayı unutursa,
            bu süre dolunca kilit kendiliğinden serbest kalır.
          </p>
          <p className="text-xs text-cyan-400/60 font-mono">Örnek: 10s sonra otomatik release</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-3 border border-indigo-500/20 space-y-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl">🐕</span>
            <h4 className="text-sm font-bold text-indigo-400">Watchdog</h4>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Redisson'un <span className="text-indigo-300 font-semibold">akıllı uzatma mekanizması</span>.
            İş hâlâ devam ediyorsa lease süresini otomatik olarak yeniler.
            İş bittiğinde veya process öldüğünde uzatma durur.
          </p>
          <p className="text-xs text-indigo-400/60 font-mono">Her 10s'de bir lease'i yeniler</p>
        </motion.div>
      </div>

      {/* Timeline */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-400">Lease Timeline</h3>
        <div className="relative h-12">
          <div className="absolute top-6 left-0 right-0 h-2 bg-white/5 rounded-full" />
          <motion.div
            className="absolute top-6 left-0 h-2 bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: '70%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
          <div className="absolute top-0 left-0 text-xs text-green-400">ACQUIRE</div>
          <div className="absolute top-0 left-[70%] text-xs text-yellow-400">WATCHDOG RENEW</div>
          <div className="absolute top-0 right-0 text-xs text-red-400">EXPIRE</div>
          <motion.div
            className="absolute top-5 w-4 h-4 rounded-full bg-indigo-500"
            initial={{ left: '0%' }}
            animate={{ left: '70%' }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
          />
        </div>
      </motion.div>

      {/* Redisson Info + Code Example */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass p-3 space-y-2">
        <h3 className="text-sm font-semibold text-gray-400">Redisson Kullanımı</h3>
        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2">
          <p className="text-xs text-gray-300 leading-relaxed">
            <span className="text-indigo-400 font-bold">Redisson</span>, Redis üzerine kurulu bir{' '}
            <span className="text-white font-semibold">Java client kütüphanesi</span>dir.
            Distributed lock, semaphore, queue gibi yapıları hazır sunar.
            Lock işlemlerinde Lua script'leri, watchdog mekanizması ve reentrant lock desteğini{' '}
            <span className="text-indigo-300">kutudan çıktığı haliyle</span> sağlar —
            bu karmaşıklığı kendiniz yazmak zorunda kalmazsınız.
          </p>
        </div>
        <pre className="text-xs font-mono bg-black/30 rounded-lg p-3 overflow-x-auto">
          <code>{`RLock lock = redisson.getLock("order:123");

// Manuel: 5s bekle, 10s lease
lock.tryLock(5, 10, TimeUnit.SECONDS);

// Watchdog ile: lease belirtme → otomatik uzatır
lock.tryLock(5, TimeUnit.SECONDS);`}</code>
        </pre>
      </motion.div>

      {/* Risks */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="grid grid-cols-3 gap-3">
        <div className="glass p-3 border border-red-500/20 space-y-1">
          <h4 className="text-xs font-bold text-red-400">Kısa Lease Riski</h4>
          <p className="text-xs text-gray-400">İş bitmeden kilit düşer → başka thread girer → data corruption</p>
        </div>
        <div className="glass p-3 border border-yellow-500/20 space-y-1">
          <h4 className="text-xs font-bold text-yellow-400">Uzun Lease Riski</h4>
          <p className="text-xs text-gray-400">Crash olursa kilit uzun süre asılı kalır → deadlock benzeri durum</p>
        </div>
        <div className="glass p-3 border border-green-500/20 space-y-1">
          <h4 className="text-xs font-bold text-green-400">Watchdog Çözümü</h4>
          <p className="text-xs text-gray-400">Lease'i 30s ayarlar, 10s'de bir uzatır. İş bitince unlock yapar.</p>
        </div>
      </motion.div>
    </div>
  )
}
