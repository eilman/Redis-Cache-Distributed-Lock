import { motion } from 'framer-motion'
import { e2eSteps } from '../data/mockData'

interface Props {
  currentStep: number
  onStepClick: (step: number) => void
}

const stepIcons: Record<string, string> = {
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  eye: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
  cart: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
  'credit-card': 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z',
  check: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

const redisColors: Record<string, string> = {
  'Cache-Aside': '#06b6d4',
  'Read-Through': '#3b82f6',
  'Session Cache': '#8b5cf6',
  'SET NX PX': '#a855f7',
  'Redlock': '#DC382D',
  'Write-Through': '#22c55e',
}

export default function OrderFlowDiagram({ currentStep, onStepClick }: Props) {
  return (
    <div className="glass p-3">
      <h4 className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-3">Sipariş Akışı</h4>
      <div className="flex items-start gap-1 max-w-4xl mx-auto">
        {e2eSteps.map((step, i) => {
          const isCompleted = i < currentStep
          const isCurrent = i === currentStep
          const isUpcoming = i > currentStep
          const color = redisColors[step.redis] || '#06b6d4'

          return (
            <div key={i} className="flex items-start flex-1">
              {/* Step */}
              <button onClick={() => onStepClick(i)} className="flex flex-col items-center w-full group">
                {/* Circle */}
                <motion.div
                  animate={isCurrent ? { boxShadow: [`0 0 0px ${color}`, `0 0 12px ${color}`, `0 0 0px ${color}`] } : {}}
                  transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                    isCompleted ? 'bg-green-500/20 border-green-500' :
                    isCurrent ? 'border-current bg-white/5' :
                    'border-gray-700 bg-gray-900/50'
                  }`}
                  style={isCurrent ? { borderColor: color } : {}}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    <svg className={`w-4 h-4 ${isCurrent ? '' : 'text-gray-600'}`} style={isCurrent ? { color } : {}} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stepIcons[step.icon]} />
                    </svg>
                  )}
                </motion.div>

                {/* Label */}
                <p className={`text-[10px] font-semibold mt-1.5 text-center ${
                  isCompleted ? 'text-green-400' : isCurrent ? 'text-white' : 'text-gray-600'
                }`}>
                  {step.label}
                </p>

                {/* Redis badge */}
                <span
                  className={`text-[8px] px-1.5 py-0.5 rounded-full mt-1 font-medium ${
                    isUpcoming ? 'bg-gray-800 text-gray-600' : 'text-white'
                  }`}
                  style={!isUpcoming ? { backgroundColor: color + '25', color } : {}}
                >
                  {step.redis}
                </span>
              </button>

              {/* Connector line */}
              {i < e2eSteps.length - 1 && (
                <div className={`h-0.5 flex-1 mt-5 mx-1 rounded ${isCompleted ? 'bg-green-500' : 'bg-gray-800'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
