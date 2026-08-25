import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'
import CacheFlowDiagram from '../../components/diagrams/CacheFlowDiagram'

const differences = [
  {
    label: 'Cache-Aside',
    points: [
      'Uygulama cache\'i yönetir',
      'Manuel get/set işlemleri',
      'Daha fazla kontrol',
      'Daha fazla boilerplate kod',
    ],
    color: 'border-indigo-500/40',
    textColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/5',
  },
  {
    label: 'Read-Through',
    points: [
      'Cache katmani DB\'den okuma işlemini kendisi yapar',
      '@Cacheable annotation yeterli',
      'Daha az kontrol',
      'Daha temiz uygulama kodu',
    ],
    color: 'border-cyan-500/40',
    textColor: 'text-cyan-400',
    bgColor: 'bg-cyan-500/5',
  },
]

export default function ReadThroughSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Read-Through Pattern
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Spring @Cacheable gibi düşünün:</span> Service method'unuzu çağırır,
          cache katmani <span className="text-amber-400">MISS durumunda otomatik olarak DB'ye gider</span> ve sonucu cache'e yazar. Business logic cache'den habersiz.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Diagram */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="glass p-2 flex justify-center">
            <CacheFlowDiagram pattern="read-through" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="glass p-3 border border-green-500/30"
          >
            <h4 className="text-xs font-semibold text-green-400 mb-1">Temel Fark</h4>
            <p className="text-xs text-gray-300">
              Cache katmani DB'den okuma işlemini <span className="text-white font-semibold">kendisi yapar</span>.
              Uygulama sadece cache'den okur, cache MISS durumunda arka planda DB sorgulanır.
            </p>
          </motion.div>

          {/* Annotation highlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass p-3 border border-cyan-500/20"
          >
            <p className="text-xs text-gray-400 mb-2">Tek annotation ile cache yönetimi:</p>
            <div className="bg-black/40 rounded-lg px-3 py-2 font-mono text-sm">
              <span className="text-purple-400">@Cacheable</span>
              <span className="text-gray-400">(</span>
              <span className="text-cyan-400">value</span>
              <span className="text-gray-400"> = </span>
              <span className="text-emerald-400">"products"</span>
              <span className="text-gray-400">, </span>
              <span className="text-cyan-400">key</span>
              <span className="text-gray-400"> = </span>
              <span className="text-emerald-400">"#id"</span>
              <span className="text-gray-400">)</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Comparison + Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Comparison cards */}
          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {differences.map((diff) => (
              <motion.div
                key={diff.label}
                variants={stagger.item}
                className={`glass p-3 border ${diff.color} ${diff.bgColor} rounded-xl`}
              >
                <h5 className={`text-sm font-bold ${diff.textColor} mb-2`}>
                  {diff.label}
                </h5>
                <ul className="space-y-1">
                  {diff.points.map((point, j) => (
                    <li key={j} className="text-xs text-gray-400 flex items-start gap-1.5">
                      <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${diff.textColor.replace('text', 'bg')}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>

          {/* Use cases */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass p-3 border border-amber-500/20"
          >
            <h5 className="text-xs font-bold text-amber-400 mb-2">Ne Zaman Kullanılır?</h5>
            <ul className="space-y-1 text-xs text-gray-400">
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 mt-0.5">+</span>
                <span>Read-heavy workload'lar (ürün kataloğu, profil bilgisi)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-green-400 mt-0.5">+</span>
                <span>Framework desteği varsa (Spring, Hibernate L2 Cache)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-red-400 mt-0.5">-</span>
                <span>Cache invalidation üzerinde ince kontrol gerekiyorsa Cache-Aside tercih edin</span>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
