import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'

export default function StoryIntroSlide() {
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
        Production'da Neler Oluyor?
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-gray-400 text-lg"
      >
        Günde milyonlarca istek alan bir e-commerce platformu düşünün...
      </motion.p>

      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        {/* Without cache */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}
        >
          {/* Top neon line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff40a0, transparent)' }} />

          <div className="text-center">
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              ⚠
            </motion.div>
            <h3 className="text-lg font-bold mt-2" style={{ color: '#ff40a0' }}>Cache'siz Mimari</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
              Her istek doğrudan veritabanına gidiyor. Aynı ürün bilgisi her seferinde sorgulanıyor.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              Ürün detayı, stok, fiyat, yorumlar — her sayfa açılışında tekrar hesaplanıyor.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
              Response time: 150-500ms arasında değişiyor.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="font-semibold"
              style={{ color: '#ff40a0' }}
            >
              10K istek/sn = 10K DB sorgusu/sn → connection pool tükeniyor!
            </motion.p>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="h-2 rounded-full origin-left"
            style={{ background: 'linear-gradient(90deg, #b040ff, #ff40a0)' }}
          />
          <p className="text-xs text-center font-mono" style={{ color: '#ff40a0' }}>Latency: ~150-500ms</p>
        </motion.div>

        {/* With cache */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
        >
          {/* Top neon line */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />

          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-3xl"
            >
              ⚡
            </motion.div>
            <h3 className="text-lg font-bold mt-2" style={{ color: '#00f0ff' }}>Redis Cache Katmanı</h3>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
              Sık erişilen veriler (hot data) Redis'te bellekte tutuluyor.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
              API önce Redis'e bakıyor — veri varsa (cache HIT) DB'ye hiç gidilmiyor.
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
              Response time: ~1ms. Disk yerine bellekten okuma yapıldığı için çok hızlı.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="font-semibold"
              style={{ color: '#00f0ff' }}
            >
              10K istek/sn → DB'ye sadece cache MISS'ler gider. %95 istek Redis'ten döner!
            </motion.p>
          </div>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1.5, duration: 0.2 }}
            className="h-2 rounded-full origin-left"
            style={{ width: '7%', background: 'linear-gradient(90deg, #00f0ff, #4090ff)' }}
          />
          <p className="text-xs text-center font-mono" style={{ color: '#00f0ff' }}>Latency: ~1ms</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8 }}
        className="glass p-3 max-w-2xl mx-auto text-center relative overflow-hidden"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #4090ff, transparent)' }} />
        <p className="text-lg text-white font-semibold">
          Netflix, Twitter, Uber, Amazon — hepsi{' '}
          <span style={{
            background: 'linear-gradient(135deg, #00f0ff, #b040ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Cache
          </span>{' '}
          kullanır.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Sık erişilen verileri bellekte tutarak veritabanı yükünü %90+ azaltır
          ve yanıt süresini milisaniyenin altına düşürür.
        </p>
      </motion.div>
    </div>
  )
}
