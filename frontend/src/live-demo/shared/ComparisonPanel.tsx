import { motion } from 'framer-motion'

interface MetricItem {
  label: string
  value: string | number
}

interface Props {
  leftTitle: string
  rightTitle: string
  leftMetrics: MetricItem[]
  rightMetrics: MetricItem[]
}

export default function ComparisonPanel({ leftTitle, rightTitle, leftMetrics, rightMetrics }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Left - Before/Unprotected (red theme) */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 rounded-xl border border-red-500/20 bg-red-500/5"
      >
        <h4 className="text-xs font-semibold text-red-400 mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          {leftTitle}
        </h4>
        <div className="space-y-1.5">
          {leftMetrics.map((m, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[11px] text-gray-500">{m.label}</span>
              <span className="text-sm font-bold font-mono text-red-400">{m.value}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Right - After/Protected (green theme) */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="p-3 rounded-xl border border-green-500/20 bg-green-500/5"
      >
        <h4 className="text-xs font-semibold text-green-400 mb-2 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          {rightTitle}
        </h4>
        <div className="space-y-1.5">
          {rightMetrics.map((m, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="text-[11px] text-gray-500">{m.label}</span>
              <span className="text-sm font-bold font-mono text-green-400">{m.value}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
