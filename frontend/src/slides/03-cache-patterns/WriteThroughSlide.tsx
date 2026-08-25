import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'
import CodeBlock from '../../components/code/CodeBlock'

const writeThroughCode = `@CachePut(value = "products", key = "#product.id")
public Product updateProduct(Product product) {
    return repository.save(product); // Cache+DB sync
}`

const writeBehindCode = `redis.opsForValue().set(key, product); // Cache hemen
asyncWriter.scheduleWrite(product);    // DB async`

const patterns = [
  {
    title: 'Write-Through',
    description: 'Her yazma işleminde cache ve DB aynı anda güncellenir',
    pros: ['Güçlü consistency', 'Veri kaybı riski düşük', 'Okuma performansı yüksek'],
    cons: ['Yazma latency\'si yüksek', 'DB ve cache sync bekler', 'Her yazma 2x maliyet'],
    color: 'border-red-500/40',
    headerColor: 'bg-red-500/10',
    textColor: 'text-red-400',
  },
  {
    title: 'Write-Behind (Write-Back)',
    description: 'Cache önce güncellenir, DB async olarak güncellenir',
    pros: ['Düşük yazma latency', 'Batch write imkanı', 'DB yükü azalır'],
    cons: ['Veri kaybı riski', 'Eventual consistency', 'Hata yönetimi zor'],
    color: 'border-indigo-500/40',
    headerColor: 'bg-indigo-500/10',
    textColor: 'text-indigo-400',
  },
]

export default function WriteThroughSlide() {
  return (
    <div className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Write-Through & Write-Behind
      </motion.h2>

      {/* Analogy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Write-Through:</span> Amazon sipariş sistemi gibi — cache ve DB sync olarak aynı anda güncellenir. Strong consistency.
          <span className="text-amber-400 font-semibold"> Write-Behind:</span> Analytics pipeline gibi — önce cache güncellenir, DB'ye batch olarak async yazılır. Yüksek throughput.
        </p>
      </motion.div>

      {/* Two-column comparison */}
      <motion.div
        variants={stagger.container}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-4"
      >
        {patterns.map((pattern, idx) => (
          <motion.div
            key={pattern.title}
            variants={stagger.item}
            className={`glass border ${pattern.color} rounded-xl overflow-hidden`}
          >
            <div className={`${pattern.headerColor} px-3 py-2 border-b ${pattern.color}`}>
              <h3 className={`text-sm font-bold ${pattern.textColor}`}>{pattern.title}</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">{pattern.description}</p>
            </div>

            <div className="p-3 space-y-2">
              <div>
                <h4 className="text-xs text-green-400 font-semibold uppercase tracking-wide mb-1.5">
                  Avantajlar
                </h4>
                <ul className="space-y-1">
                  {pattern.pros.map((pro, j) => (
                    <li key={j} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">+</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs text-red-400 font-semibold uppercase tracking-wide mb-1.5">
                  Dezavantajlar
                </h4>
                <ul className="space-y-1">
                  {pattern.cons.map((con, j) => (
                    <li key={j} className="text-xs text-gray-300 flex items-start gap-2">
                      <span className="text-red-500 mt-0.5">-</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-3 pb-3">
              <CodeBlock
                code={idx === 0 ? writeThroughCode : writeBehindCode}
                language="java"
                title={idx === 0 ? '@CachePut' : 'Async Write-Behind'}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
