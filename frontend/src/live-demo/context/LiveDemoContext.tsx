import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export type DemoSection =
  | 'overview'
  | 'cache-patterns'
  | 'ttl-invalidation'
  | 'cache-problems'
  | 'resilience'
  | 'distributed-lock'
  | 'redlock'
  | 'monitoring'
  | 'e2e-flow'

export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
}

export interface LogEvent {
  id: string
  timestamp: Date
  section: DemoSection
  type: 'hit' | 'miss' | 'error' | 'lock' | 'info' | 'success'
  message: string
  latencyMs?: number
}

interface GlobalMetrics {
  totalRequests: number
  cacheHits: number
  cacheMisses: number
  avgLatencyMs: number
  ordersProcessed: number
}

interface LiveDemoContextValue {
  isOpen: boolean
  toggle: () => void
  close: () => void
  activeSection: DemoSection
  setActiveSection: (s: DemoSection) => void
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'>) => void
  clearCart: () => void
  globalMetrics: GlobalMetrics
  updateMetrics: (update: Partial<GlobalMetrics>) => void
  incrementMetric: (key: 'totalRequests' | 'cacheHits' | 'cacheMisses' | 'ordersProcessed', amount?: number) => void
  eventLog: LogEvent[]
  addLog: (section: DemoSection, type: LogEvent['type'], message: string, latencyMs?: number) => void
  clearLog: () => void
  completedSections: Set<DemoSection>
  markCompleted: (s: DemoSection) => void
  e2eProgress: number
  setE2eProgress: (step: number) => void
}

const LiveDemoContext = createContext<LiveDemoContextValue | null>(null)

export function useLiveDemo() {
  const ctx = useContext(LiveDemoContext)
  if (!ctx) throw new Error('useLiveDemo must be used within LiveDemoProvider')
  return ctx
}

export function LiveDemoProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<DemoSection>('overview')
  const [cart, setCart] = useState<CartItem[]>([])
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics>({
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    avgLatencyMs: 0,
    ordersProcessed: 0,
  })
  const [eventLog, setEventLog] = useState<LogEvent[]>([])
  const [completedSections, setCompletedSections] = useState<Set<DemoSection>>(new Set())
  const [e2eProgress, setE2eProgress] = useState(0)

  const toggle = useCallback(() => setIsOpen(p => !p), [])
  const close = useCallback(() => setIsOpen(false), [])

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const updateMetrics = useCallback((update: Partial<GlobalMetrics>) => {
    setGlobalMetrics(prev => ({ ...prev, ...update }))
  }, [])

  const incrementMetric = useCallback((key: 'totalRequests' | 'cacheHits' | 'cacheMisses' | 'ordersProcessed', amount = 1) => {
    setGlobalMetrics(prev => ({ ...prev, [key]: prev[key] + amount }))
  }, [])

  const addLog = useCallback((section: DemoSection, type: LogEvent['type'], message: string, latencyMs?: number) => {
    setEventLog(prev => {
      const entry: LogEvent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date(),
        section,
        type,
        message,
        latencyMs,
      }
      const next = [entry, ...prev]
      return next.length > 100 ? next.slice(0, 100) : next
    })
  }, [])

  const clearLog = useCallback(() => setEventLog([]), [])

  const markCompleted = useCallback((s: DemoSection) => {
    setCompletedSections(prev => new Set(prev).add(s))
  }, [])

  return (
    <LiveDemoContext.Provider
      value={{
        isOpen, toggle, close,
        activeSection, setActiveSection,
        cart, addToCart, clearCart,
        globalMetrics, updateMetrics, incrementMetric,
        eventLog, addLog, clearLog,
        completedSections, markCompleted,
        e2eProgress, setE2eProgress,
      }}
    >
      {children}
    </LiveDemoContext.Provider>
  )
}
