import { motion } from 'framer-motion'

export default function ResilienceProblemSlide() {
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
        Problem: Redis Cluster Down Olursa?
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-4 max-w-3xl mx-auto text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-lg text-gray-300">
          Production'da Redis cluster down oldu. Servisiniz için
          <span style={{ color: '#4090ff' }} className="font-semibold"> iki strateji</span> var:
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: 'spring' }}
          whileHover={{ scale: 1.03 }}
          className="glass p-4 space-y-3 cursor-default relative overflow-hidden"
          style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
          <div className="text-center">
            <motion.span
              className="text-3xl inline-block"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              🔄
            </motion.span>
            <h3 className="text-xl font-bold mt-3" style={{ color: '#00f0ff' }}>Fail-Open</h3>
            <p className="text-sm text-gray-400 mt-1">(Graceful Degradation) — Netflix yaklaşımı</p>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p>Redis down → doğrudan DB'den oku. Latency artar ama servis ayakta kalır.</p>
            <p>Kullanıcı <span style={{ color: '#fbbf24' }}>biraz yavaş</span> deneyim yaşar ama işlem tamamlanır.</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)' }}>
            <p className="text-xs" style={{ color: '#00f0ff' }}>Availability öncelikli — servis hiç durmuyor</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, type: 'spring' }}
          whileHover={{ scale: 1.03 }}
          className="glass p-4 space-y-3 cursor-default relative overflow-hidden"
          style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff40a0, transparent)' }} />
          <div className="text-center">
            <span className="text-3xl">🛑</span>
            <h3 className="text-xl font-bold mt-3" style={{ color: '#ff40a0' }}>Fail-Close</h3>
            <p className="text-sm text-gray-400 mt-1">(Fast Fail) — Stripe/ödeme sistemleri yaklaşımı</p>
          </div>
          <div className="space-y-2 text-sm text-gray-300">
            <p>Redis down → hata döndür. Tutarsız veri ile işlem yapmaktansa servisi durdur.</p>
            <p>Yanlış fiyatla satış yapmaktansa <span style={{ color: '#ff40a0' }}>503 Service Unavailable</span> döndür.</p>
          </div>
          <div className="rounded-lg p-3 text-center" style={{ background: 'rgba(255,64,160,0.06)', border: '1px solid rgba(255,64,160,0.15)' }}>
            <p className="text-xs" style={{ color: '#ff40a0' }}>Consistency öncelikli — yanlış veri asla servis edilmez</p>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="glass p-3 max-w-2xl mx-auto text-center"
      >
        <p className="text-sm text-gray-400">
          Redis çökerse uygulamanız ne yapmalı?
          <span className="text-white font-semibold"> Cevap: Duruma göre.</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Şimdi bu iki stratejiyi ve ne zaman hangisini seçmeniz gerektiğini inceleyelim.
        </p>
      </motion.div>
    </div>
  )
}
