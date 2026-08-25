import { motion } from 'framer-motion'
import { DemoSection, useLiveDemo } from './context/LiveDemoContext'

interface SectionItem {
  id: DemoSection
  label: string
  subtitle: string
  color: string
  icon: JSX.Element
}

const sections: SectionItem[] = [
  {
    id: 'overview',
    label: 'Genel Bakış',
    subtitle: 'Sistem Mimarisi',
    color: 'cyan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    id: 'cache-patterns',
    label: "Cache Pattern'leri",
    subtitle: 'Ürün Kataloğu',
    color: 'indigo',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
  },
  {
    id: 'ttl-invalidation',
    label: 'TTL & Invalidation',
    subtitle: 'Flash Sale Fiyatları',
    color: 'amber',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'cache-problems',
    label: 'Cache Problemleri',
    subtitle: 'Black Friday Trafiği',
    color: 'red',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
  },
  {
    id: 'resilience',
    label: 'Dayanıklılık',
    subtitle: 'Redis Çökmesi',
    color: 'green',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
  },
  {
    id: 'distributed-lock',
    label: 'Dağıtık Kilit',
    subtitle: 'Son Ürün Yarışı',
    color: 'purple',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    id: 'redlock',
    label: 'Redlock',
    subtitle: 'Ödeme Güvenliği',
    color: 'rose',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33" />
      </svg>
    ),
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    subtitle: 'Ops Dashboard',
    color: 'yellow',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: 'e2e-flow',
    label: 'E2E Sipariş Akışı',
    subtitle: 'Tam Sipariş Demo',
    color: 'cyan',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
]

const colorMap: Record<string, { active: string; border: string; text: string; bg: string }> = {
  cyan: { active: 'border-cyan-400', border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  indigo: { active: 'border-indigo-400', border: 'border-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  amber: { active: 'border-amber-400', border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10' },
  red: { active: 'border-red-400', border: 'border-red-500/20', text: 'text-red-400', bg: 'bg-red-500/10' },
  green: { active: 'border-green-400', border: 'border-green-500/20', text: 'text-green-400', bg: 'bg-green-500/10' },
  purple: { active: 'border-purple-400', border: 'border-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-500/10' },
  rose: { active: 'border-rose-400', border: 'border-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10' },
  yellow: { active: 'border-yellow-400', border: 'border-yellow-500/20', text: 'text-yellow-400', bg: 'bg-yellow-500/10' },
}

export default function LiveDemoSidebar() {
  const { activeSection, setActiveSection, completedSections } = useLiveDemo()

  return (
    <div className="w-[260px] shrink-0 border-r border-white/5 overflow-y-auto py-3 px-2 space-y-1">
      {sections.map((section, i) => {
        const isActive = activeSection === section.id
        const isCompleted = completedSections.has(section.id)
        const colors = colorMap[section.color]

        return (
          <motion.button
            key={section.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            onClick={() => setActiveSection(section.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all border-l-[3px] ${
              isActive
                ? `${colors.active} ${colors.bg} shadow-lg`
                : `border-transparent hover:bg-white/[0.03] hover:border-white/10`
            }`}
          >
            <div className={`shrink-0 transition-colors ${isActive ? colors.text : 'text-gray-500'}`}>
              {section.icon}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium truncate transition-colors ${isActive ? 'text-white' : 'text-gray-300'}`}>
                {section.label}
              </p>
              <p className={`text-[10px] truncate transition-colors ${isActive ? colors.text : 'text-gray-600'}`}>
                {section.subtitle}
              </p>
            </div>
            {isCompleted && (
              <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
