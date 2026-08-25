import { motion } from 'framer-motion'
import CodeBlock from '../../components/code/CodeBlock'

export default function OwnerVerificationSlide() {
  return (
    <div className="space-y-6">
      <motion.h2 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-gradient">
        Başkasının Kilidini Açma!
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Thread-A'nın lock'u expire oldu, Thread-B lock'u aldı.</span> Thread-A işini bitirip
          DEL yaparsa Thread-B'nin lock'unu siler! Bu yüzden lock release'de mutlaka owner verification (UUID check) yapılmalı.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="glass p-5 border border-red-500/20 space-y-3">
            <h3 className="text-sm font-bold text-red-400">Tehlikeli: Basit DEL</h3>

            <CodeBlock language="redis" code={`DEL lock:resource
// Sorun: Başkasının kilidini silebilirsin!`} />
            <div className="text-xs text-gray-400 space-y-1">
              <p>1. Thread-A kilidi alır (lease=10s)</p>
              <p>2. Thread-A yavaştı, 10s geçti, kilit düştü</p>
              <p>3. Thread-B kilidi alır</p>
              <p className="text-red-400 font-bold">4. Thread-A DEL yapar → Thread-B'nin kilidini siler!</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-4">
          <div className="glass p-5 border border-green-500/20 space-y-3">
            <h3 className="text-sm font-bold text-green-400">Güvenli: Lua Script</h3>
            <CodeBlock
              language="lua"
              code={`-- Atomic check-and-delete
if redis.call("GET", KEYS[1]) == ARGV[1]
then
    return redis.call("DEL", KEYS[1])
else
    return 0
end`}
            />
            <div className="text-xs text-gray-400 space-y-1">
              <p>1. Kilit değerini kontrol et</p>
              <p>2. Sadece kendi UUID'in ise sil</p>
              <p className="text-green-400 font-bold">3. Atomic işlem - race condition yok!</p>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="glass p-4 text-center text-sm text-gray-400">
        Bu Lua script'ini her seferinde kendiniz yazmak zorunda değilsiniz — <span className="text-indigo-400 font-semibold">Redisson</span>, <span className="text-indigo-400 font-mono">lock.unlock()</span> çağrısında bu kontrolü otomatik uygular ve başkasının kilidini silme riskini ortadan kaldırır.
      </motion.div>
    </div>
  )
}
