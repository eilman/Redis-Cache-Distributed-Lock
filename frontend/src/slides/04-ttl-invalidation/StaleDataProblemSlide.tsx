import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function StaleDataProblemSlide() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev >= 60 ? 60 : prev + 1))
    }, 150)
    return () => clearInterval(timer)
  }, [])

  const ttl = 30
  const remaining = Math.max(0, ttl - seconds)
  const freshness = remaining > 15 ? 'fresh' : remaining > 0 ? 'warning' : 'expired'
  const dbPrice = seconds >= 10 ? '1299 TL' : '999 TL'
  const cachePrice = remaining > 0 ? '999 TL' : '999 TL (stale!)'
  const colorMap = {
    fresh: { text: 'text-green-400', bg: 'bg-green-500', label: 'FRESH' },
    warning: { text: 'text-yellow-400', bg: 'bg-yellow-500', label: 'TTL AZALIYOR' },
    expired: { text: 'text-red-400', bg: 'bg-red-500', label: 'STALE!' },
  }
  const colors = colorMap[freshness]

  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Problem: Stale Data Tehlikesi
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-5 max-w-3xl mx-auto text-center border border-amber-500/20"
      >
        <p className="text-lg text-gray-300">
          <span className="text-amber-400 font-semibold">Stale Data</span> = Cache'deki verinin, kaynaktaki (DB) güncel değerden farklı olması.
          Veri DB'de değişti ama cache hâlâ eski (stale) kopyayı sunuyor.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Cache'e yazılan her veri zamanla "bayatlar". TTL yoksa veya çok uzunsa,
          kullanıcılar <span className="text-red-400">tutarsız / yanlış veri</span> görür.
        </p>
      </motion.div>

      {/* Cache TTL animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass p-5 max-w-lg mx-auto space-y-3"
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-500 mb-1">Cache Değeri</p>
            <p className={`text-lg font-bold font-mono ${freshness === 'expired' ? 'text-red-400' : 'text-white'}`}>{cachePrice}</p>
          </div>
          <div className="bg-black/20 rounded-lg p-3">
            <p className="text-[11px] text-gray-500 mb-1">DB Değeri (gerçek)</p>
            <p className={`text-lg font-bold font-mono ${seconds >= 10 ? 'text-amber-400' : 'text-white'}`}>{dbPrice}</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <span className="text-xs text-gray-400">TTL:</span>
          <span className={`text-xl font-bold font-mono ${colors.text}`}>{remaining}s</span>
          <motion.div
            className={`w-3 h-3 rounded-full ${colors.bg}`}
            animate={freshness === 'expired' ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
          <span className={`text-xs font-bold font-mono ${colors.text}`}>{colors.label}</span>
        </div>

        <div className="w-full bg-white/5 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${colors.bg}`}
            animate={{ width: `${Math.max(0, (remaining / ttl) * 100)}%` }}
            transition={{ duration: 0.15 }}
          />
        </div>

        {seconds >= 10 && remaining > 0 && (
          <p className="text-[11px] text-amber-400 text-center">
            DB'de fiyat değişti ama cache hâlâ eski değeri dönüyor!
          </p>
        )}
        {freshness === 'expired' && (
          <div className="text-center space-y-1">
            <p className="text-[11px] text-red-400 font-semibold">
              TTL doldu — cache expire oldu, bir sonraki istek DB'den güncel veriyi çekecek.
            </p>
            <p className="text-[11px] text-gray-500">
              Peki ya TTL dolmadan DB değişirse? İşte burada <span className="text-amber-400 font-semibold">Cache Invalidation</span> devreye girer:
              veri değiştiğinde cache'i manuel olarak silmek veya güncellemek. TTL pasif bekleme, invalidation aktif temizliktir.
            </p>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-2 gap-4 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="glass p-4 border border-red-500/20 space-y-2"
        >
          <h3 className="text-sm font-bold text-red-400">E-Commerce: Stale Fiyat</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p>1. Ürün fiyatı DB'de 999 TL → 1299 TL olarak güncellendi</p>
            <p>2. Cache TTL 24 saat, henüz expire olmadı</p>
            <p>3. Kullanıcı sepette 999 TL görüyor, ödeme sayfasında 1299 TL çıkıyor</p>
            <p className="text-red-400 font-semibold">Sonuç: Müşteri şikâyeti, refund maliyeti, güven kaybı</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="glass p-4 border border-red-500/20 space-y-2"
        >
          <h3 className="text-sm font-bold text-red-400">Fintech: Stale Kur Bilgisi</h3>
          <div className="text-xs text-gray-400 space-y-1">
            <p>1. USD/TRY kuru 32.50 → 33.10 olarak değişti</p>
            <p>2. Cache hâlâ eski kuru dönüyor (stale data)</p>
            <p>3. Müşteri eski kurla işlem yapıyor, gerçek kurla settlement oluyor</p>
            <p className="text-red-400 font-semibold">Sonuç: Finansal kayıp, compliance ihlâli, regülatör riski</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid grid-cols-3 gap-3 max-w-3xl mx-auto"
      >
        <div className="glass p-3 border border-green-500/20 space-y-1.5">
          <h4 className="text-xs font-bold text-green-400">TTL (Pasif)</h4>
          <p className="text-[11px] text-gray-400">Süre dolunca Redis key'i otomatik siler. En basit stale data koruması.</p>
          <code className="block text-[10px] font-mono text-green-300 bg-black/30 px-2 py-1 rounded">EXPIRE key 3600</code>
        </div>
        <div className="glass p-3 border border-amber-500/20 space-y-1.5">
          <h4 className="text-xs font-bold text-amber-400">Invalidation (Aktif)</h4>
          <p className="text-[11px] text-gray-400">Veri değiştiğinde uygulama cache'i manuel siler. TTL beklemeden anında temizlik.</p>
          <code className="block text-[10px] font-mono text-amber-300 bg-black/30 px-2 py-1 rounded">DEL key / @CacheEvict</code>
        </div>
        <div className="glass p-3 border border-purple-500/20 space-y-1.5">
          <h4 className="text-xs font-bold text-purple-400">Eviction (Otomatik)</h4>
          <p className="text-[11px] text-gray-400">Bellek dolduğunda Redis en az kullanılan key'leri otomatik atar (LRU/LFU).</p>
          <code className="block text-[10px] font-mono text-purple-300 bg-black/30 px-2 py-1 rounded">maxmemory-policy: allkeys-lru</code>
        </div>
      </motion.div>
    </div>
  )
}
