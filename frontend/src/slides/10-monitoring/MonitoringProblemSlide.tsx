import { motion } from 'framer-motion'

const gauges = [
  { label: 'Hit Rate', value: '??%', icon: '⛽', analogy: 'Yakıt verimi', color: '#00f0ff' },
  { label: 'Latency', value: '??ms', icon: '🏎', analogy: 'Motor tepki süresi', color: '#4090ff' },
  { label: 'Memory', value: '??MB', icon: '🛢', analogy: 'Depo doluluğu', color: '#b040ff' },
  { label: 'Eviction', value: '??', icon: '🌡', analogy: 'Motor sıcaklığı', color: '#ff40a0' },
]

export default function MonitoringProblemSlide() {
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
        Problem: Kör Uçuş Yapmayın!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-5 max-w-3xl mx-auto text-center"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-lg text-gray-300">
          Arabanizda <span style={{ color: '#4090ff' }} className="font-semibold">benzin göstergesi, hız göstergesi, motor sıcaklığı</span> olmasaydi
          ne olurdu?
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Cache sisteminiz de ayni: hit rate düşüyorsa, eviction artıyorsa, latency çıkıyorsa... bilmeniz lazim!
        </p>
      </motion.div>

      {/* Dashboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="glass p-4 max-w-3xl mx-auto"
      >
        <h3 className="text-sm text-gray-400 text-center mb-4 tracking-wide font-mono">// REDIS GÖSTERGE PANELİ</h3>
        <div className="grid grid-cols-4 gap-4">
          {gauges.map((gauge, i) => (
            <motion.div
              key={gauge.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="rounded-xl p-3 text-center space-y-1.5 relative overflow-hidden"
              style={{
                background: `${gauge.color}08`,
                border: `1px solid ${gauge.color}20`,
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${gauge.color}, transparent)` }} />
              <span className="text-2xl">{gauge.icon}</span>
              <motion.div
                className="text-xl font-bold font-mono"
                style={{ color: gauge.color, textShadow: `0 0 10px ${gauge.color}40` }}
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ delay: 1 + i * 0.2, duration: 1.5, repeat: Infinity }}
              >
                {gauge.value}
              </motion.div>
              <p className="text-xs font-semibold" style={{ color: gauge.color }}>{gauge.label}</p>
              <p className="text-[10px] text-gray-500">{gauge.analogy}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid grid-cols-2 gap-4 max-w-2xl mx-auto"
      >
        <div className="glass p-3 text-center" style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}>
          <p className="text-xs font-bold" style={{ color: '#ff40a0' }}>Göstergesiz Araba</p>
          <p className="text-xs text-gray-400 mt-1">Benzin bitene kadar sürersen, yolda kalırsın</p>
        </div>
        <div className="glass p-3 text-center" style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}>
          <p className="text-xs font-bold" style={{ color: '#00f0ff' }}>Göstergeli Araba</p>
          <p className="text-xs text-gray-400 mt-1">Benzin azalınca uyarı alırsın, zamanında doldurursun</p>
        </div>
      </motion.div>
    </div>
  )
}
