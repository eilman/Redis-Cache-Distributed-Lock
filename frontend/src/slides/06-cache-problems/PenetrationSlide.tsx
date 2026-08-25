import { motion } from 'framer-motion'

const requestKeys = [
  'user:999999',
  'product:-1',
  'order:abc',
  'item:0',
  'data:nonexist',
]

export default function PenetrationSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Cache Penetration: Hayalet Müşteri Saldırısı
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass p-4 border border-amber-500/20"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Bir e-commerce API'si düşünün.</span> Bot, var olmayan product ID'lerle (product:-1, product:999999) sürekli istek atıyor.
          Redis'te bu key'ler yok → her request doğrudan DB'ye gidiyor. DB gereksiz yere %100 load'a çıkıyor.
          Bu bir DDoS attack vektörü olabilir.
        </p>
      </motion.div>

      {/* Animated Flow Diagram */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass p-6"
      >
        {/* 3-column flow: Requests → Redis → DB */}
        <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2">
          {/* Column 1: Requests */}
          <div className="space-y-2">
            <p className="text-[11px] text-gray-500 font-semibold text-center mb-2">Bot / Saldırgan</p>
            {requestKeys.map((key, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-center gap-1.5"
              >
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ delay: 1 + i * 0.2, duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
                >
                  <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                </motion.div>
                <code className="text-[11px] text-red-300 font-mono bg-red-500/10 px-1.5 py-0.5 rounded">
                  GET {key}
                </code>
              </motion.div>
            ))}
          </div>

          {/* Arrow 1: Request → Redis (flowing dots) */}
          <div className="flex items-center justify-center py-4 relative" style={{ minWidth: 100 }}>
            <div className="w-full h-[2px] bg-red-500/20 rounded-full" />
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1, delay: i * 0.35, repeat: Infinity, repeatDelay: 0.2, ease: 'linear' }}
              />
            ))}
            <svg className="absolute right-0 w-3 h-3 text-red-400" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1l8 5-8 5V1z" />
            </svg>
          </div>

          {/* Column 2: Redis Cache (MISS) */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{ borderColor: ['rgba(107,114,128,0.3)', 'rgba(234,179,8,0.4)', 'rgba(107,114,128,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-28 h-28 rounded-xl bg-gray-800/60 border-2 border-dashed flex flex-col items-center justify-center"
            >
              <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </svg>
              <span className="text-xs text-gray-500 mt-1">Redis</span>
            </motion.div>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded font-mono mt-2 font-bold"
            >
              MISS x {requestKeys.length}
            </motion.span>
          </div>

          {/* Arrow 2: Redis → DB (flowing dots — pass through) */}
          <div className="flex items-center justify-center py-4 relative" style={{ minWidth: 100 }}>
            <div className="w-full h-[2px] bg-red-500/20 rounded-full" />
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
                animate={{ left: ['0%', '100%'], opacity: [0, 1, 1, 0], scale: [0.8, 1.2, 1, 0.8] }}
                transition={{ duration: 0.8, delay: i * 0.25, repeat: Infinity, repeatDelay: 0.15, ease: 'linear' }}
              />
            ))}
            <svg className="absolute right-0 w-3 h-3 text-red-400" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1l8 5-8 5V1z" />
            </svg>
          </div>

          {/* Column 3: Database (overloaded) */}
          <div className="flex flex-col items-center">
            <motion.div
              animate={{
                boxShadow: [
                  '0 0 0px rgba(239,68,68,0)',
                  '0 0 25px rgba(239,68,68,0.6)',
                  '0 0 0px rgba(239,68,68,0)',
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-28 h-28 rounded-xl bg-red-900/30 border-2 border-red-500/40 flex flex-col items-center justify-center"
            >
              <motion.svg
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1.5 }}
                className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" />
              </motion.svg>
              <span className="text-xs text-red-400 mt-1 font-bold">PostgreSQL</span>
            </motion.div>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-xs text-red-400 font-mono mt-2 font-bold"
            >
              null x N → %100 CPU
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Problem Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="glass p-3 border-l-4 border-red-500/50"
      >
        <h3 className="text-red-400 font-semibold mb-2">Problem</h3>
        <p className="text-gray-400 text-sm leading-relaxed">
          Saldırgan veya hatalı client, var olmayan key'ler için sürekli istek gönderir.
          Cache her seferinde MISS döndürür çünkü kayıt yok. Tüm istekler DB'ye iletilir.
          Bu bir DDoS vektörü olabilir.
        </p>
      </motion.div>

      {/* Solutions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 }}
          className="glass p-5 border border-green-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <span className="text-green-400 text-sm font-bold">1</span>
            </div>
            <h4 className="text-green-400 font-semibold">Null Value Caching</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Olmayan key'ler için null/empty değeri kısa TTL ile cache'le.
            Sonraki istekler cache'den null alır, DB'ye gitmez.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6 }}
          className="glass p-5 border border-cyan-500/20"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <span className="text-cyan-400 text-sm font-bold">2</span>
            </div>
            <h4 className="text-cyan-400 font-semibold">Bloom Filter</h4>
          </div>
          <p className="text-gray-400 text-sm">
            Olasılıksal veri yapısı ile key'in var olup olmadığını hızla kontrol et.
            False positive olabilir ama false negative olmaz.
          </p>
          <div className="mt-3 space-y-1.5 text-xs">
            <div className="bg-green-500/10 rounded px-2 py-1.5">
              <span className="text-green-400 font-semibold">False Negative yok:</span>
              <span className="text-gray-400"> "Yok" dediyse kesinlikle yoktur → DB'ye sorgu gitmez</span>
            </div>
            <div className="bg-amber-500/10 rounded px-2 py-1.5">
              <span className="text-amber-400 font-semibold">False Positive olabilir:</span>
              <span className="text-gray-400"> "Var" dediyse belki yoktur → DB'ye gider, null döner (nadir)</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
