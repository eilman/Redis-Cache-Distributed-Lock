import { motion } from 'framer-motion'
import CodeBlock from '../../components/code/CodeBlock'

export default function NullCachingSlide() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Çözüm: Null Value Caching
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Var olmayan key için de "NOT_FOUND" değerini cache'le.</span> Sonraki request
          aynı key'i istediğinde Redis'ten "NOT_FOUND" döner, DB'ye hiç gidilmez. Instagram bu pattern'i
          var olmayan kullanıcı profilleri için kullanıyor.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="glass p-5 border border-red-500/20 space-y-3">
            <h3 className="text-lg font-semibold text-red-400">Öncesi (Problem)</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Her istek için:</p>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-yellow-400">1. Cache MISS</p>
                <p className="text-red-400">2. DB Query → NOT FOUND</p>
                <p className="text-red-400">3. Sonraki istek → yine DB!</p>
              </div>
              <p className="text-red-300 font-semibold mt-2">5 istek = 5 DB sorgusu</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <div className="glass p-5 border border-green-500/20 space-y-3">
            <h3 className="text-lg font-semibold text-green-400">Sonrası (Çözüm)</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>Null value cache'lenir:</p>
              <div className="space-y-1 font-mono text-xs">
                <p className="text-yellow-400">1. Cache MISS</p>
                <p className="text-yellow-400">2. DB Query → NOT FOUND</p>
                <p className="text-green-400">3. Cache SET "NULL" (TTL=30s)</p>
                <p className="text-green-400">4. Sonraki istek → Cache HIT!</p>
              </div>
              <p className="text-green-300 font-semibold mt-2">5 istek = 1 DB sorgusu</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <CodeBlock
          title="Null Value Caching Pattern"
          language="java"
          code={`String cached = redis.get(key);
if (cached != null) {
    return "NULL_MARKER".equals(cached) ? null : cached;
}

String dbResult = db.findById(id);
if (dbResult == null) {
    redis.setex(key, 30, "NULL_MARKER"); // Short TTL
    return null;
}

redis.setex(key, 300, dbResult);
return dbResult;`}
        />
      </motion.div>
    </div>
  )
}
