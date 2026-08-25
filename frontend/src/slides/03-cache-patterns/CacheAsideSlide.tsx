import { motion } from 'framer-motion'
import { stagger } from '../../theme/animations'
import CacheFlowDiagram from '../../components/diagrams/CacheFlowDiagram'
import CodeBlock from '../../components/code/CodeBlock'

const cacheAsideCode = `public Product getProduct(Long id) {
    String key = "product:" + id;
    Product cached = redis.opsForValue().get(key);
    if (cached != null) return cached; // HIT

    // Cache MISS - DB'den oku ve cache'e yaz
    Product product = repository.findById(id).orElseThrow();
    redis.opsForValue().set(key, product, Duration.ofMinutes(30));
    return product;
}`

const steps = [
  { num: 1, text: 'Uygulama önce cache\'i kontrol eder', color: 'text-indigo-400' },
  { num: 2, text: 'Cache MISS durumunda DB\'den okur', color: 'text-red-400' },
  { num: 3, text: 'Alinan veriyi cache\'e yazar (lazy population)', color: 'text-green-400' },
]

export default function CacheAsideSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Cache-Aside Pattern
      </motion.h2>

      {/* Analogy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">GitHub API gibi düşünün:</span> Her request'te
          önce Redis'e bak (cache HIT?), yoksa PostgreSQL'den çek (cache MISS),
          sonucu Redis'e yaz ki sonraki request'ler hızlı olsun. Uygulama tamamen kontrol ediyor.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Diagram + Steps */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="glass p-2 flex justify-center">
            <CacheFlowDiagram pattern="cache-aside" />
          </div>

          <motion.div
            variants={stagger.container}
            initial="initial"
            animate="animate"
            className="space-y-2"
          >
            {steps.map((step) => (
              <motion.div
                key={step.num}
                variants={stagger.item}
                className="glass p-2 flex items-center gap-3"
              >
                <span className={`font-mono font-bold text-sm ${step.color}`}>
                  {step.num}.
                </span>
                <span className="text-sm text-gray-300">{step.text}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="glass p-3 border border-amber-500/30"
          >
            <p className="text-xs text-amber-400">
              <span className="font-bold">En yaygın pattern.</span> Uygulama cache yönetiminden
              tamamen sorumludur. İlk istek her zaman yavaş olur (cold start).
            </p>
          </motion.div>
        </motion.div>

        {/* Right: Code */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CodeBlock
            code={cacheAsideCode}
            language="java"
            title="ProductService.java"
          />
        </motion.div>
      </div>
    </div>
  )
}
