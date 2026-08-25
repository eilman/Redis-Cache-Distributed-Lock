import { motion } from 'framer-motion'
import { useLiveDemo } from '../context/LiveDemoContext'
import type { DemoSection } from '../context/LiveDemoContext'
import MetricTicker from '../shared/MetricTicker'
import EcommerceArchDiagram from '../visualizations/EcommerceArchDiagram'

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

const exploreCards: { section: DemoSection; title: string; desc: string; icon: string; color: string }[] = [
  {
    section: 'cache-patterns',
    title: 'Cache Patterns',
    desc: 'Cache-Aside, Read-Through, Write-Through stratejileri',
    icon: '\u26A1',
    color: 'cyan',
  },
  {
    section: 'cache-problems',
    title: 'Cache Problemleri',
    desc: 'Stampede, Penetration, Stale Data sorunları ve çözümleri',
    icon: '\u{1F6A8}',
    color: 'red',
  },
  {
    section: 'distributed-lock',
    title: 'Distributed Lock',
    desc: 'SET NX PX ile stok güvenliği ve race-condition önleme',
    icon: '\u{1F512}',
    color: 'purple',
  },
  {
    section: 'monitoring',
    title: 'Monitoring',
    desc: 'Redis metrikleri, Prometheus entegrasyonu ve alertler',
    icon: '\u{1F4CA}',
    color: 'green',
  },
]

const colorClasses: Record<string, { border: string; text: string; hover: string }> = {
  cyan: { border: 'border-cyan-500/30', text: 'text-cyan-400', hover: 'hover:border-cyan-400/50 hover:bg-cyan-500/10' },
  red: { border: 'border-red-500/30', text: 'text-red-400', hover: 'hover:border-red-400/50 hover:bg-red-500/10' },
  purple: { border: 'border-purple-500/30', text: 'text-purple-400', hover: 'hover:border-purple-400/50 hover:bg-purple-500/10' },
  green: { border: 'border-green-500/30', text: 'text-green-400', hover: 'hover:border-green-400/50 hover:bg-green-500/10' },
}

export default function OverviewSection() {
  const { setActiveSection } = useLiveDemo()

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title */}
      <motion.div variants={item} className="text-center">
        <h2 className="text-3xl font-bold text-gradient">TechMart E-Commerce Mimarisi</h2>
        <p className="text-sm text-gray-400 mt-2">Redis ile yüksek performansli e-ticaret altyapisi</p>
      </motion.div>

      {/* Description Card */}
      <motion.div variants={item} className="glass p-5">
        <p className="text-sm text-gray-300 leading-relaxed">
          Türkiye'nin en büyük online elektronik mağazası.
          Günlük <span className="text-cyan-400 font-semibold">500K</span> kullanıcı,
          Black Friday'de <span className="text-amber-400 font-semibold">5M</span> eş zamanlı istek.
          Redis cache, distributed lock ve session yönetimi ile
          <span className="text-green-400 font-semibold"> sub-millisecond</span> yanit süreleri sağlıyoruz.
        </p>
      </motion.div>

      {/* KPI Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricTicker value={500000} label="Günlük Kullanıcı" suffix="" color="text-cyan-400" size="md" />
        <div className="bg-black/20 rounded-xl p-3 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wide mb-1">Response Time</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-lg font-bold font-mono text-green-400">12ms</span>
            <span className="text-[10px] text-gray-600">vs</span>
            <span className="text-lg font-bold font-mono text-red-400 line-through opacity-60">340ms</span>
          </div>
        </div>
        <MetricTicker value={94.7} label="Cache Hit Rate" prefix="%" color="text-green-400" size="md" decimals={1} />
        <MetricTicker value={125000} label="Redis ops/sec" suffix="" color="text-amber-400" size="md" />
      </motion.div>

      {/* Architecture Diagram */}
      <motion.div variants={item} className="glass p-4">
        <h3 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Sistem Mimarisi</h3>
        <EcommerceArchDiagram onNodeClick={(section) => setActiveSection(section)} />
      </motion.div>

      {/* Explore Buttons */}
      <motion.div variants={item}>
        <h3 className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Keşfet</h3>
        <div className="grid grid-cols-2 gap-3">
          {exploreCards.map((card) => {
            const c = colorClasses[card.color] || colorClasses.cyan
            return (
              <motion.button
                key={card.section}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveSection(card.section)}
                className={`text-left p-4 rounded-xl border bg-white/[0.02] transition-all ${c.border} ${c.hover}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{card.icon}</span>
                  <div>
                    <p className={`text-sm font-semibold ${c.text}`}>{card.title}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{card.desc}</p>
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
