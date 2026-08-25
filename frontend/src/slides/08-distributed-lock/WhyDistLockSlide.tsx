import { motion } from 'framer-motion'

const instances = [
  { name: 'Instance 1', color: '#00f0ff' },
  { name: 'Instance 2', color: '#4090ff' },
  { name: 'Instance 3', color: '#b040ff' },
]

export default function WhyDistLockSlide() {
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
        Problem: Race Condition in Distributed Systems
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3"
        style={{ borderColor: 'rgba(64,144,255,0.2)', borderWidth: 1 }}
      >
        <p className="text-sm text-gray-300">
          <span style={{ color: '#4090ff' }} className="font-semibold">Uber'de 3 farklı Kubernetes pod'u aynı ödeme işlemini aynı anda işliyor.</span>{' '}
          Müşteri hesabından 3 kez para çekilir! Dağıtık sistemlerde mutual exclusion olmadan data corruption kaçınılmaz.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Without lock */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(255,64,160,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #ff40a0, transparent)' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#ff40a0' }}>Kilit Olmadan</h3>
          <div className="space-y-3 overflow-hidden">
            {instances.map((inst, i) => (
              <div key={inst.name} className="relative flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: inst.color, boxShadow: `0 0 6px ${inst.color}40` }} />
                <span className="text-sm text-gray-300 flex-shrink-0">{inst.name}</span>
                <div className="flex-1 h-0.5 rounded relative" style={{ background: inst.color + '30' }}>
                  <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                    style={{ background: inst.color, boxShadow: `0 0 6px ${inst.color}60` }}
                    animate={{ left: ['0%', '100%', '100%'] }}
                    transition={{ delay: 0.5 + i * 0.2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: '#ff40a0' }}>Process Job</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-3 text-xs text-center" style={{ background: 'rgba(255,64,160,0.06)', color: '#ff40a0', border: '1px solid rgba(255,64,160,0.15)' }}>
            3 instance aynı job'u aynı anda çalıştırıyor! Double processing!
          </div>
        </motion.div>

        {/* With lock */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass p-4 space-y-3 relative overflow-hidden"
          style={{ borderColor: 'rgba(0,240,255,0.2)', borderWidth: 1 }}
        >
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00f0ff, transparent)' }} />
          <h3 className="text-lg font-semibold" style={{ color: '#00f0ff' }}>Kilit ile</h3>
          <div className="space-y-3">
            {instances.map((inst, i) => (
              <div key={inst.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ background: inst.color, boxShadow: `0 0 6px ${inst.color}40` }} />
                <span className="text-sm text-gray-300">{inst.name}</span>
                <div className="flex-1 h-0.5 rounded bg-white/5" />
                <span className={`text-xs ${i === 0 ? '' : 'text-gray-600'}`} style={i === 0 ? { color: '#00f0ff' } : undefined}>
                  {i === 0 ? 'LOCKED - Processing' : 'Waiting...'}
                </span>
              </div>
            ))}
          </div>
          <div className="rounded-lg p-3 text-xs text-center" style={{ background: 'rgba(0,240,255,0.06)', color: '#00f0ff', border: '1px solid rgba(0,240,255,0.15)' }}>
            Sadece 1 instance job'u çalıştırıyor. Diğer ikisi bekliyor.
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 justify-center"
      >
        {[
          { label: 'Double Processing', color: '#ff40a0' },
          { label: 'Race Condition', color: '#b040ff' },
          { label: 'Data Corruption', color: '#4090ff' },
        ].map((problem) => (
          <div
            key={problem.label}
            className="glass px-4 py-2 text-xs"
            style={{ color: problem.color, borderColor: `${problem.color}25`, borderWidth: 1 }}
          >
            {problem.label}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
