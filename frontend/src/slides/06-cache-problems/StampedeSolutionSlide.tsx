import { motion } from 'framer-motion'
import CodeBlock from '../../components/code/CodeBlock'

const solutionCode = `public Product getProductSafe(Long id) {
    String key = "product:" + id;
    Product cached = redis.get(key);
    if (cached != null) return cached;

    RLock lock = redisson.getLock("load:" + key);
    try {
        if (lock.tryLock(5, 10, SECONDS)) {
            cached = redis.get(key); // Double-check
            if (cached != null) return cached;
            Product p = db.findById(id);
            redis.setex(key, 300, p);
            return p;
        }
    } finally {
        if (lock.isHeldByCurrentThread()) lock.unlock();
    }
    return redis.get(key);
}`

export default function StampedeSolutionSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Çözüm: Distributed Lock ile Stampede Önleme
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-5 max-w-3xl mx-auto text-center border border-green-500/20"
      >
        <p className="text-sm text-gray-300">
          Cache MISS olduğunda <span className="text-green-400 font-semibold">sadece bir thread</span> Redis lock alır ve DB'den veriyi çeker.
          <span className="text-green-400 font-semibold"> Diğer thread'ler lock bekler</span>, cache dolunca hepsi Redis'ten okur.
          Facebook bu pattern'i News Feed cache rebuild için kullanıyor.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Visual */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Solution diagram */}
          <div className="glass p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-400">Lock ile Stampede Önleme</h3>
            <div className="space-y-2">
              {[
                { step: '1', text: 'Cache MISS - kilit al', color: 'text-yellow-400', icon: '🔒' },
                { step: '2', text: 'Sadece 1 istek DB\'ye gider', color: 'text-indigo-400', icon: '📦' },
                { step: '3', text: 'Sonucu cache\'e yaz', color: 'text-green-400', icon: '💾' },
                { step: '4', text: 'Kilidi bırak, diğerleri cache\'den okur', color: 'text-cyan-400', icon: '🔓' },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="glass p-3 flex items-center gap-3"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className={`font-mono text-sm font-bold ${item.color}`}>{item.step}.</span>
                  <span className="text-sm text-gray-300">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Result comparison */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="grid grid-cols-2 gap-3"
          >
            <div className="glass p-3 border border-red-500/20 text-center">
              <p className="text-xs text-red-400 font-bold">Öncesi</p>
              <p className="text-lg font-bold text-red-400">100 DB sorgusu</p>
            </div>
            <div className="glass p-3 border border-green-500/20 text-center">
              <p className="text-xs text-green-400 font-bold">Sonrası</p>
              <p className="text-lg font-bold text-green-400">1 DB sorgusu</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Code */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CodeBlock
            code={solutionCode}
            language="java"
            title="Lock ile Stampede Önleme"
          />
        </motion.div>
      </div>
    </div>
  )
}
