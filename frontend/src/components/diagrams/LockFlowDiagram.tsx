import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function LockFlowDiagram() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setStep(s => (s + 1) % 6), 1200)
    return () => clearInterval(timer)
  }, [])

  const steps = [
    { label: 'SET lock NX PX 10000', desc: 'Kilit alma istegi', color: '#00d4ff' },
    { label: 'OK (acquired)', desc: 'Kilit alindi', color: '#00e68a' },
    { label: 'Do work...', desc: 'Is yapiliyor', color: '#a855f7' },
    { label: 'GET lock (verify owner)', desc: 'Sahiplik dogrulama', color: '#3b82f6' },
    { label: 'DEL lock (if owner)', desc: 'Kilidi serbest bırak', color: '#f87171' },
    { label: 'Released', desc: 'Kilit serbest', color: '#00e68a' },
  ]

  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <motion.div
          key={i}
          initial={false}
          animate={{
            opacity: i <= step ? 1 : 0.3,
            x: i === step ? 10 : 0,
            scale: i === step ? 1.02 : 1,
          }}
          className="flex items-center gap-4 py-2 px-4 rounded-lg"
          style={{ background: i === step ? s.color + '15' : 'transparent' }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: i <= step ? s.color + '30' : 'rgba(255,255,255,0.05)', color: i <= step ? s.color : 'rgba(255,255,255,0.3)' }}
          >
            {i + 1}
          </div>
          <div>
            <div className="font-mono text-sm" style={{ color: i <= step ? 'white' : 'rgba(255,255,255,0.3)' }}>
              {s.label}
            </div>
            <div className="text-xs text-gray-500">{s.desc}</div>
          </div>
          {i === step && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-auto w-2 h-2 rounded-full"
              style={{ background: s.color }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
