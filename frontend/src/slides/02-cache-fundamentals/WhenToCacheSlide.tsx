import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'

const cacheYes = [
  { example: 'Ürün kataloğu', reason: 'Sık okunur, nadir değişir' },
  { example: 'Kullanıcı profili', reason: 'Her istekte lazım, dakikada bir değişir' },
  { example: 'Yapılandırma / ayarlar', reason: 'Neredeyse hiç değişmez' },
  { example: 'API yanıt verileri', reason: 'Aynı sorgu, aynı sonuç' },
]

const cacheNo = [
  { example: 'Hesap bakiyesi', reason: 'Her an değişir, tutarlılık kritik' },
  { example: 'Canlı stok adedi', reason: 'Gerçek zamanlı hassasiyet gerekli' },
  { example: 'OTP / doğrulama kodu', reason: 'Tek kullanımlık, cache anlamsız' },
  { example: 'Büyük dosyalar', reason: 'Bellek israfı, Redis bunun için değil' },
]

export default function WhenToCacheSlide() {
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
        Ne Zaman Cache Kullanmalıyız?
      </motion.h2>

      {/* Analogy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-4 max-w-3xl mx-auto text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300">
          <span style={{ color: '#4090ff' }} className="font-semibold">Amazon ürün kataloğu</span> saatte bir değişir — cache'leyin.
          Ama <span style={{ color: '#ff40a0' }} className="font-semibold">Binance'deki canlı coin fiyatları</span> saniyede değişir — cache'lemeyin.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        {/* Cache'le */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-5 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#00f0ff' }}>
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)' }}
            >
              ✓
            </span>
            Cache Kullanın
          </h3>
          <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-2">
            {cacheYes.map((item) => (
              <motion.div key={item.example} variants={stagger.item} className="flex items-start gap-3 text-sm">
                <span style={{ color: '#00f0ff' }} className="mt-0.5">+</span>
                <div>
                  <span className="text-white font-medium">{item.example}</span>
                  <span className="text-gray-500 ml-2">- {item.reason}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Cache'leme */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-5 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff40a0, transparent)' }} />
          <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#ff40a0' }}>
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ background: 'rgba(255,64,160,0.1)', border: '1px solid rgba(255,64,160,0.3)' }}
            >
              ✕
            </span>
            Cache Kullanmayın
          </h3>
          <motion.div variants={stagger.container} initial="initial" animate="animate" className="space-y-2">
            {cacheNo.map((item) => (
              <motion.div key={item.example} variants={stagger.item} className="flex items-start gap-3 text-sm">
                <span style={{ color: '#ff40a0' }} className="mt-0.5">-</span>
                <div>
                  <span className="text-white font-medium">{item.example}</span>
                  <span className="text-gray-500 ml-2">- {item.reason}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Decision flow */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass p-4 max-w-3xl mx-auto"
      >
        <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
          <span className="font-mono" style={{ color: '#4090ff' }}>Veri sık okunuyor mu?</span>
          <span style={{ color: '#4090ff60' }}>→ Evet →</span>
          <span className="font-mono" style={{ color: '#b040ff' }}>Sık değişiyor mu?</span>
          <span style={{ color: '#b040ff60' }}>→ Hayir →</span>
          <span className="font-mono font-bold" style={{ color: '#00f0ff', textShadow: '0 0 10px rgba(0,240,255,0.4)' }}>CACHE'LE!</span>
        </div>
      </motion.div>
    </div>
  )
}
