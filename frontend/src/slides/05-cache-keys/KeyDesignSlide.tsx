import { motion } from 'framer-motion'

const principles = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.64 0 8.577 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.64 0-8.577-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Readability',
    subtitle: 'Okunabilirlik',
    description: 'Key\'i gören herkes içeriğini anlayabilmeli. Delimiter olarak ":" kullanın, kelimeler arası "-" tercih edin.',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/5',
    example: 'user-service:user:12345',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
      </svg>
    ),
    title: 'Uniqueness',
    subtitle: 'Benzersizlik',
    description: 'Her key tek bir kaynak temsil etmeli. Farklı servislerden gelen aynı isimli key\'ler çakışmamalı.',
    color: 'text-green-400',
    border: 'border-green-500/30',
    bg: 'bg-green-500/5',
    example: 'order-svc:order:789',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
    title: 'Namespace Isolation',
    subtitle: 'İsim Alanı İzolasyonu',
    description: 'Her servis kendi prefix\'ini kullanmalı. Bu sayede toplu silme (SCAN + DEL) ve izleme kolaylaşır.',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/5',
    example: 'payment-svc:tx:*',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Size Optimization',
    subtitle: 'Boyut Optimizasyonu',
    description: 'Kısa ama anlamlı key\'ler hafıza kullanımını azaltır. Milyonlarca key\'de birkaç byte bile fark yaratır.',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/5',
    example: 'u:12345 vs user-service:user:12345',
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
}

const item = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 100 } },
}

export default function KeyDesignSlide() {
  return (
    <div className="space-y-4">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Key Tasarım İlkeleri
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-400 text-lg"
      >
        İyi tasarlanmış key yapısı, ölçeklenebilir ve yönetilebilir cache sistemi demektir
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-5"
      >
        {principles.map((p, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`glass p-5 border ${p.border} ${p.bg} space-y-3`}
          >
            <div className="flex items-center gap-3">
              <div className={p.color}>{p.icon}</div>
              <div>
                <h3 className={`text-lg font-semibold ${p.color}`}>{p.title}</h3>
                <p className="text-xs text-gray-500">{p.subtitle}</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">{p.description}</p>
            <code className="block text-xs font-mono text-gray-500 bg-black/30 px-3 py-1.5 rounded">
              {p.example}
            </code>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-center justify-center gap-8 text-sm text-gray-500"
      >
        <span>Tutarlılık</span>
        <span className="w-1 h-1 rounded-full bg-red-500" />
        <span>Performans</span>
        <span className="w-1 h-1 rounded-full bg-red-500" />
        <span>Ölçeklenebilirlik</span>
        <span className="w-1 h-1 rounded-full bg-red-500" />
        <span>Debug Kolaylığı</span>
      </motion.div>
    </div>
  )
}
