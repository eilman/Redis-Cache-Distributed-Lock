import { motion } from 'framer-motion'
import { useLiveDemo } from './context/LiveDemoContext'

export default function LiveDemoHeader() {
  const { close, cart, globalMetrics } = useLiveDemo()

  const hitRate = globalMetrics.totalRequests > 0
    ? ((globalMetrics.cacheHits / globalMetrics.totalRequests) * 100).toFixed(1)
    : '0.0'

  const hitRateNum = parseFloat(hitRate)
  const hitRateColor = hitRateNum >= 90 ? 'text-green-400' : hitRateNum >= 70 ? 'text-amber-400' : 'text-red-400'

  return (
    <div className="h-14 shrink-0 border-b border-white/5 flex items-center px-5 gap-6">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-none">TechMart</h1>
          <p className="text-[9px] text-cyan-400/60 leading-none mt-0.5">E-Commerce Redis Demo</p>
        </div>
      </motion.div>

      {/* Metrics */}
      <div className="flex-1 flex items-center justify-center gap-6">
        <MetricPill label="Request" value={globalMetrics.totalRequests.toLocaleString()} color="text-cyan-400" />
        <MetricPill label="Hit Rate" value={`%${hitRate}`} color={hitRateColor} />
        <MetricPill label="Latency" value={`${globalMetrics.avgLatencyMs.toFixed(1)}ms`} color="text-blue-400" />
        <MetricPill label="Siparis" value={globalMetrics.ordersProcessed.toString()} color="text-green-400" />
      </div>

      {/* Cart + Close */}
      <div className="flex items-center gap-3">
        {/* Mini cart */}
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-cyan-500 text-white text-[9px] font-bold flex items-center justify-center">
              {cart.reduce((sum, c) => sum + c.quantity, 0)}
            </span>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={close}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function MetricPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5">
      <span className="text-[9px] text-gray-500 uppercase tracking-wide">{label}</span>
      <span className={`text-xs font-bold font-mono ${color}`}>{value}</span>
    </div>
  )
}
