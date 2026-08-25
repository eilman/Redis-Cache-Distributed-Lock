import { useState } from 'react'
import { motion } from 'framer-motion'
import DemoPanel from '../../components/demo/DemoPanel'
import { patternApi } from '../../api/cacheApi'

export default function SpeedDemoSlide() {
  const [productId, setProductId] = useState(1)

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Canlı Demo: Hız Farkını Görün
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-4 max-w-2xl mx-auto text-center border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          İlk istekte veri <span className="text-red-400 font-semibold">veritabanından</span> gelir (yavaş).
          İkinci istekte <span className="text-green-400 font-semibold">cache'den</span> gelir (hızlı).
          Farkı görün!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-center gap-3"
      >
        <label className="text-sm text-gray-400">Product ID:</label>
        <input
          type="number"
          value={productId}
          onChange={(e) => setProductId(Number(e.target.value))}
          min={1}
          max={5}
          className="w-20 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-red-500/50"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <DemoPanel
          title="Cache-Aside Hız Testi"
          description="İlk çalıştırmada DB'ye gider (MISS), ikincisinde cache'den döner (HIT). Farkı karşılaştırın!"
          onRun={() => patternApi.cacheAside(productId)}
          renderResult={(data) => {
            const d = data as { source?: string; executionTime?: number; product?: any }
            return (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Kaynak:</span>
                  <span className={`font-mono font-bold ${d.source === 'CACHE' ? 'text-green-400' : 'text-red-400'}`}>
                    {d.source || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Süre:</span>
                  <span className="text-white font-mono font-bold">{d.executionTime || 0}ms</span>
                </div>
                {d.product && (
                  <pre className="text-xs text-gray-400 font-mono bg-black/20 p-2 rounded">
                    {JSON.stringify(d.product, null, 2)}
                  </pre>
                )}
              </div>
            )
          }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="glass p-3 text-center text-xs text-gray-500"
      >
        İpucu: "Çalıştır" butonuna iki kez basın. İlk seferde DB'den, ikincisinde cache'den gelecek.
      </motion.div>
    </div>
  )
}
