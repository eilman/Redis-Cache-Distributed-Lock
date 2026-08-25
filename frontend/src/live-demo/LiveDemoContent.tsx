import { lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLiveDemo } from './context/LiveDemoContext'

const OverviewSection = lazy(() => import('./sections/OverviewSection'))
const CachePatternsSection = lazy(() => import('./sections/CachePatternsSection'))
const TtlInvalidationSection = lazy(() => import('./sections/TtlInvalidationSection'))
const CacheProblemsSection = lazy(() => import('./sections/CacheProblemsSection'))
const ResilienceSection = lazy(() => import('./sections/ResilienceSection'))
const DistributedLockSection = lazy(() => import('./sections/DistributedLockSection'))
const RedlockSection = lazy(() => import('./sections/RedlockSection'))
const MonitoringSection = lazy(() => import('./sections/MonitoringSection'))
const EndToEndSection = lazy(() => import('./sections/EndToEndSection'))

const sectionComponents: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
  'overview': OverviewSection,
  'cache-patterns': CachePatternsSection,
  'ttl-invalidation': TtlInvalidationSection,
  'cache-problems': CacheProblemsSection,
  'resilience': ResilienceSection,
  'distributed-lock': DistributedLockSection,
  'redlock': RedlockSection,
  'monitoring': MonitoringSection,
  'e2e-flow': EndToEndSection,
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
        <span className="text-sm text-gray-500">Yukleniyor...</span>
      </div>
    </div>
  )
}

export default function LiveDemoContent() {
  const { activeSection } = useLiveDemo()
  const ActiveComponent = sectionComponents[activeSection]

  return (
    <div className="flex-1 min-w-0 overflow-y-auto px-6 py-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="max-w-6xl mx-auto"
        >
          <Suspense fallback={<LoadingFallback />}>
            {ActiveComponent && <ActiveComponent />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
