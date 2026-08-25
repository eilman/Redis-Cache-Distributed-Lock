import { motion } from 'framer-motion'

const companyExamples = [
  {
    company: 'Twitter',
    pattern: 'timeline:{userId}:home',
    real: 'timeline:928374:home',
    why: 'Home feed cache — her kullanıcı için ayrı, invalidate edilmesi kolay',
    color: 'text-sky-400',
    border: 'border-sky-500/30',
  },
  {
    company: 'Stripe',
    pattern: 'api:customer:{custId}:pm',
    real: 'api:customer:cus_9x2k:pm',
    why: 'Payment methods — servis prefix\'i ile multi-tenant izolasyon',
    color: 'text-purple-400',
    border: 'border-purple-500/30',
  },
  {
    company: 'Netflix',
    pattern: 'catalog:{region}:trending',
    real: 'catalog:TR:trending',
    why: 'Region-based cache — CDN ve edge cache ile uyumlu partition',
    color: 'text-red-400',
    border: 'border-red-500/30',
  },
  {
    company: 'Uber',
    pattern: 'surge:{cityId}:zone:{zoneId}',
    real: 'surge:istanbul:zone:kadikoy',
    why: 'Surge priçing — coğrafi partition ile hızlı lookup, kısa TTL',
    color: 'text-green-400',
    border: 'border-green-500/30',
  },
  {
    company: 'GitHub',
    pattern: 'repo:{owner}:{repo}:issues:count',
    real: 'repo:torvalds:linux:issues:count',
    why: 'Hierarchical key — owner/repo scope\'u REST API path\'i ile birebir eşleşir',
    color: 'text-gray-300',
    border: 'border-gray-500/30',
  },
]

const antiPatterns = [
  { bad: 'user12345',             fix: 'user-svc:user:12345',         problem: 'Delimiter yok, entity belirsiz' },
  { bad: 'data_cache_1',          fix: 'order-svc:order:1:summary',   problem: 'Generic isim, çakışma riski' },
  { bad: 'temp',                  fix: 'session:a1b2c3d4',            problem: 'Anlamsız, debug imkânsız' },
  { bad: 'getUserById_42',        fix: 'user-svc:user:42',            problem: 'Method ismi, key değil' },
]

const stagger = {
  container: { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.2 } } },
  item: { hidden: { opacity: 0, x: -15 }, show: { opacity: 1, x: 0 } },
}

export default function KeyStandardsSlide() {
  return (
    <div className="space-y-3">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient"
      >
        Cache Key Standartları
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-2 border border-amber-500/15"
      >
        <p className="text-xs text-gray-300">
          <span className="text-amber-400 font-semibold">REST API path'leri gibi düşünün:</span>{' '}
          <code className="text-cyan-400 text-[11px]">/api/v1/users/123/orders</code> nasıl hiyerarşik ve okunabilir ise,
          cache key'leri de <code className="text-cyan-400 text-[11px]">user-svc:user:123:orders</code> şeklinde yapılandırılmalı.
          Büyük ölçekli sistemlerde key convention'i yoksa debug ve invalidation kâbus olur.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {/* Left: Real-world company examples */}
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-1.5">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Production Örnekleri</h3>
          {companyExamples.map((ex) => (
            <motion.div
              key={ex.company}
              variants={stagger.item}
              className={`glass p-2 border ${ex.border} rounded-lg`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${ex.color}`}>{ex.company}</span>
                <code className="text-[10px] text-gray-500 font-mono">{ex.pattern}</code>
              </div>
              <code className="block text-[11px] font-mono text-emerald-400 bg-black/30 px-2 py-0.5 rounded mb-1">
                {ex.real}
              </code>
              <p className="text-[10px] text-gray-500">{ex.why}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Right: Anti-patterns + Rules */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {/* Anti-patterns table */}
          <div className="glass p-3 space-y-2">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wide">Anti-Pattern → Doğru Kullanım</h3>
            {antiPatterns.map((ap, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-red-400 line-through opacity-60 min-w-[120px]">{ap.bad}</span>
                <span className="text-gray-600">→</span>
                <span className="text-green-400 min-w-[160px]">{ap.fix}</span>
                <span className="text-gray-600 text-[10px] font-sans truncate">{ap.problem}</span>
              </div>
            ))}
          </div>

          {/* Naming Convention Rules */}
          <div className="glass p-3 space-y-1.5">
            <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">Key Convention Kuralları</h3>
            {[
              { rule: 'Delimiter: ":"', desc: 'Hiyerarsi ayırıcı (Redis Cluster slot uyumlu)' },
              { rule: 'Kelime: kebab-case', desc: 'user-service (camelCase değil)' },
              { rule: 'Prefix: {service-name}', desc: 'Multi-service izolasyon & SCAN kolaylığı' },
              { rule: 'ID: sonda', desc: 'Pattern-based invalidation için (user-svc:user:*)' },
              { rule: 'Boyut: <128 byte', desc: 'Milyon key\'de memory overhead düşer' },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px]">
                <code className="text-cyan-400 font-mono font-bold min-w-[130px] shrink-0">{r.rule}</code>
                <span className="text-gray-500">{r.desc}</span>
              </div>
            ))}
          </div>

          {/* Key structure visual */}
          <div className="glass p-2 border border-indigo-500/20 text-center">
            <div className="font-mono text-xs space-x-0.5">
              <span className="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded">service</span>
              <span className="text-gray-600">:</span>
              <span className="bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded">entity</span>
              <span className="text-gray-600">:</span>
              <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">id</span>
              <span className="text-gray-600">:</span>
              <span className="bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">field</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">order-svc:order:789:status</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
