import { motion } from 'framer-motion'

export default function FailOpenCloseSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold"
        style={{
          background: 'linear-gradient(135deg, #00f0ff, #4090ff, #b040ff)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Fail-Open vs Fail-Close
      </motion.h2>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,240,255,0.1)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: '#00f0ff' }} fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 20V10M12 20V4M6 20v-6" />
              </svg>
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#00f0ff' }}>Fail-Open</h3>
          </div>
          <p className="text-sm text-gray-300">Redis timeout → fallback olarak doğrudan DB'den oku. Response yavaşlar ama kullanıcı işlemi tamamlar.</p>
          <div className="space-y-2 text-xs">
            <p style={{ color: '#00f0ff' }} className="font-semibold">Avantajlar:</p>
            <p className="text-gray-400">+ Servis kesintisiz çalışır</p>
            <p className="text-gray-400">+ Kullanıcı etkilenmez</p>
            <p style={{ color: '#ff40a0' }} className="font-semibold mt-2">Dezavantajlar:</p>
            <p className="text-gray-400">- DB yuku aniden artar</p>
            <p className="text-gray-400">- Latency yükselebilir</p>
          </div>
          <div className="rounded-lg p-3 text-xs font-mono" style={{ background: 'rgba(0,240,255,0.06)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.15)' }}>
            try {'{'} return cache.get(key); {'}'}<br/>
            catch {'{'} return db.findById(id); {'}'}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff40a0, transparent)' }} />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,64,160,0.1)' }}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: '#ff40a0' }} fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold" style={{ color: '#ff40a0' }}>Fail-Close</h3>
          </div>
          <p className="text-sm text-gray-300">Redis timeout → 503 döndür. Tutarsız veya stale data ile işlem yapmaktansa servisi durdur.</p>
          <div className="space-y-2 text-xs">
            <p style={{ color: '#00f0ff' }} className="font-semibold">Avantajlar:</p>
            <p className="text-gray-400">+ Tutarsız veri yok</p>
            <p className="text-gray-400">+ DB korunur</p>
            <p style={{ color: '#ff40a0' }} className="font-semibold mt-2">Dezavantajlar:</p>
            <p className="text-gray-400">- Servis kesintisi</p>
            <p className="text-gray-400">- Kullanıcı etkilenir</p>
          </div>
          <div className="rounded-lg p-3 text-xs font-mono" style={{ background: 'rgba(255,64,160,0.06)', color: '#ff40a0', border: '1px solid rgba(255,64,160,0.15)' }}>
            try {'{'} return cache.get(key); {'}'}<br/>
            catch {'{'} throw new ServiceUnavailable(); {'}'}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass p-4 text-center text-sm text-gray-400">
        Çoğu durumda <span style={{ color: '#00f0ff' }} className="font-bold">Fail-Open</span> tercih edilir. Circuit Breaker pattern ile birlikte kullanılır.
      </motion.div>
    </div>
  )
}
