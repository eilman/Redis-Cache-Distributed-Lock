import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface FlowStep {
  label: string
  color: string
  bg: string
  border: string
}

interface Problem {
  title: string
  aka: string
  severity: string
  severityColor: string
  color: string
  textColor: string
  bg: string
  what: string
  scenario: string
  impact: string[]
  solution: string
  flow: FlowStep[]
  metrics: { label: string; value: string; color: string }[]
}

const problems: Problem[] = [
  {
    title: 'Cache Stampede',
    aka: 'Thundering Herd',
    severity: 'Kritik',
    severityColor: 'bg-red-500',
    color: 'border-orange-500/30',
    textColor: 'text-orange-400',
    bg: 'bg-orange-500/5',
    what: 'Cache TTL dolunca aynı key için gelen N concurrent request hepsi birden DB\'ye gider.',
    scenario: 'Black Friday — ürün sayfası cache\'i expire olur, 10K kullanıcı aynı anda DB\'ye sorgu atar.',
    impact: ['DB CPU %100', 'Response 10x yavaş', 'Cascading failure'],
    solution: 'Distributed Lock + Probabilistic Early Refresh',
    flow: [
      { label: 'TTL Doldu', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
      { label: 'N x MISS', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' },
      { label: 'N x DB Hit', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
      { label: 'DB Crash!', color: 'text-red-500', bg: 'bg-red-600/30', border: 'border-red-500/50' },
    ],
    metrics: [
      { label: 'Concurrent Req', value: '10K+', color: 'text-orange-400' },
      { label: 'DB Load', value: '%100', color: 'text-red-400' },
      { label: 'Downtime Risk', value: 'Yüksek', color: 'text-red-500' },
    ],
  },
  {
    title: 'Cache Penetration',
    aka: 'Cache Bypass Attack',
    severity: 'Yüksek',
    severityColor: 'bg-orange-500',
    color: 'border-red-500/30',
    textColor: 'text-red-400',
    bg: 'bg-red-500/5',
    what: 'Olmayan key\'ler için gelen istekler cache\'i bypass eder, her seferinde DB\'ye gider.',
    scenario: 'Bot/attacker rastgele product ID\'ler ile istek atar — hiçbiri cache\'de yok, tüm trafik DB\'ye.',
    impact: ['Cache koruması sıfır', 'DB load lineer artar', 'Servis yavaşlığı'],
    solution: 'Bloom Filter + Null Caching (sentinel value)',
    flow: [
      { label: 'Fake Key', color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/40' },
      { label: 'Cache MISS', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
      { label: 'DB Query', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' },
      { label: 'Not Found', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
    ],
    metrics: [
      { label: 'Hit Rate', value: '%0', color: 'text-red-400' },
      { label: 'Bypass', value: '%100', color: 'text-orange-400' },
      { label: 'Attack Surface', value: 'Geniş', color: 'text-red-500' },
    ],
  },
  {
    title: 'Stale Data',
    aka: 'Cache Inconsistency',
    severity: 'Orta',
    severityColor: 'bg-yellow-500',
    color: 'border-purple-500/30',
    textColor: 'text-purple-400',
    bg: 'bg-purple-500/5',
    what: 'DB güncellenir ama cache hâlâ eski veriyi sunar — kullanıcı yanlış bilgi görür.',
    scenario: 'Ürün fiyatı $100 → $80 olur, ama cache TTL dolana kadar $100 gösterilir.',
    impact: ['Yanlış fiyat/stok', 'Müşteri şikayeti', 'Veri tutarsızlığı'],
    solution: 'Event-driven Invalidation + Write-Through + Kısa TTL',
    flow: [
      { label: 'DB Update', color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/40' },
      { label: 'Cache Eski', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40' },
      { label: 'Stale Read', color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/40' },
      { label: 'Yanlış Veri', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/40' },
    ],
    metrics: [
      { label: 'Tutarsızlık', value: 'TTL süre', color: 'text-amber-400' },
      { label: 'Fiyat Hatası', value: '$100→$80', color: 'text-purple-400' },
      { label: 'Görüş', value: 'Silent Bug', color: 'text-red-400' },
    ],
  },
]

const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
  },
  item: {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
  },
}

function FlowArrow({ active, color }: { active: boolean; color: string }) {
  return (
    <div className="flex items-center mx-0.5 shrink-0">
      <motion.div
        className="flex items-center"
        animate={{ opacity: active ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
      >
        <div className={`h-[2px] w-3 ${active ? color : 'bg-gray-600'} transition-colors duration-300`} />
        <div
          className={`w-0 h-0 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent border-l-[5px] transition-colors duration-300 ${
            active ? color.replace('bg-', 'border-l-') : 'border-l-gray-600'
          }`}
        />
      </motion.div>
    </div>
  )
}

const arrowColors: Record<string, string> = {
  'Cache Stampede': 'bg-orange-500',
  'Cache Penetration': 'bg-red-500',
  'Stale Data': 'bg-purple-500',
}

export default function ProblemIntroSlide() {
  const [activeSteps, setActiveSteps] = useState([0, 0, 0])

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSteps((prev) => prev.map((s) => (s + 1) % 5))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="space-y-2.5">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Her Güzelliğin Bir Bedeli Var 💔
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass p-2 border border-amber-500/15 text-center"
      >
        <p className="text-xs text-gray-300 leading-relaxed">
          Cache performans kazandırırken{' '}
          <span className="text-orange-400 font-semibold">Stampede</span>,{' '}
          <span className="text-red-400 font-semibold">Penetration</span> ve{' '}
          <span className="text-purple-400 font-semibold">Stale Data</span> olmak üzere{' '}
          <span className="text-amber-400 font-semibold">3 temel problemi</span> de beraberinde getirir.
          Bu problemler production'da{' '}
          <span className="text-white font-semibold">downtime, veri tutarsızlığı ve cascading failure</span>'a yol açabilir.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-2"
      >
        <div className="glass p-2.5 border border-red-500/20 rounded-lg text-center">
          <p className="text-xs font-bold text-red-400 mb-1">Downtime</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Servisin tamamen erişilemez hale gelmesi. Veritabanı aşırı yük altında ezilir ve kullanıcı isteklerine yanıt veremez.
          </p>
        </div>
        <div className="glass p-2.5 border border-amber-500/20 rounded-lg text-center">
          <p className="text-xs font-bold text-amber-400 mb-1">Veri Tutarsızlığı</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Cache'deki veri ile DB'deki verinin farklı olması. Kullanıcı eski fiyat, yanlış stok gibi güncel olmayan bilgileri görür.
          </p>
        </div>
        <div className="glass p-2.5 border border-orange-500/20 rounded-lg text-center">
          <p className="text-xs font-bold text-orange-400 mb-1">Cascading Failure</p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            Bir bileşenin çökmesinin zincirleme reaksiyon yaratarak bağlı tüm servisleri domino etkisiyle çökertmesi.
          </p>
        </div>
      </motion.div>

      <motion.div variants={stagger.container} initial="hidden" animate="show" className="space-y-2.5">
        {problems.map((p, idx) => {
          const currentStep = activeSteps[idx]

          return (
            <motion.div
              key={p.title}
              variants={stagger.item}
              className={`glass border ${p.color} ${p.bg} rounded-xl overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-1.5 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <h3 className={`text-sm font-bold ${p.textColor}`}>{p.title}</h3>
                  <span className="text-[10px] text-gray-500 font-mono">({p.aka})</span>
                </div>
                <motion.span
                  animate={p.severity === 'Kritik' ? { scale: [1, 1.1, 1] } : undefined}
                  transition={p.severity === 'Kritik' ? { duration: 1.5, repeat: Infinity } : undefined}
                  className={`${p.severityColor} text-[10px] text-white font-bold px-2 py-0.5 rounded-full`}
                >
                  {p.severity}
                </motion.span>
              </div>

              {/* Content */}
              <div className="grid grid-cols-5 gap-3 p-3">
                {/* Left: What + Scenario (2 cols) */}
                <div className="col-span-2 space-y-1.5">
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Ne olur?</h4>
                    <p className="text-[11px] text-gray-300 leading-relaxed">{p.what}</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Senaryo</h4>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{p.scenario}</p>
                  </div>
                </div>

                {/* Right: Flow diagram + Metrics (3 cols) */}
                <div className="col-span-3 space-y-2">
                  {/* Animated flow diagram */}
                  <div>
                    <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-1.5 text-center">
                      Akış Diyagramı
                    </h4>
                    <div className="flex items-center justify-center">
                      {p.flow.map((step, j) => (
                        <div key={j} className="flex items-center">
                          <motion.div
                            animate={{
                              scale: currentStep === j ? 1.08 : 1,
                              borderWidth: currentStep === j ? 2 : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className={`px-2 py-1 rounded-lg border ${step.border} ${step.bg} relative`}
                          >
                            <span
                              className={`text-[10px] font-mono font-semibold whitespace-nowrap ${step.color}`}
                            >
                              {step.label}
                            </span>
                            {/* Pulse dot when active */}
                            <AnimatePresence>
                              {currentStep === j && (
                                <motion.span
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${step.bg.replace('/20', '').replace('/30', '')}`}
                                >
                                  <motion.span
                                    animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className={`absolute inset-0 rounded-full ${step.bg.replace('/20', '').replace('/30', '')}`}
                                  />
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </motion.div>
                          {j < p.flow.length - 1 && (
                            <FlowArrow active={currentStep > j} color={arrowColors[p.title]} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Metrics + Impact row */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Impact tags */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] text-red-400 uppercase tracking-wide font-semibold">Etki</h4>
                      <div className="flex flex-wrap gap-1">
                        {p.impact.map((item, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-1.5 py-0.5 rounded-full"
                          >
                            {item}
                          </motion.span>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="flex gap-1.5">
                      {p.metrics.map((m, i) => (
                        <div key={i} className="flex-1 bg-black/20 rounded px-1.5 py-1 text-center">
                          <p className="text-[9px] text-gray-500 leading-tight">{m.label}</p>
                          <p className={`text-[11px] font-bold font-mono ${m.color}`}>{m.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solution bar */}
              <div className="px-4 py-1.5 border-t border-white/5 bg-green-500/5 flex items-center gap-2">
                <svg
                  className="w-3.5 h-3.5 text-green-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-[10px] text-green-400 font-semibold">Çözüm:</span>
                <span className="text-[11px] text-green-300/80">{p.solution}</span>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
