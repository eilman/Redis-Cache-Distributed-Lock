import { useState } from 'react'
import { motion } from 'framer-motion'
import CodeBlock from '../../components/code/CodeBlock'
import DemoPanel from '../../components/demo/DemoPanel'
import { lockApi, redlockApi } from '../../api/lockApi'

const scheduledJobCode = `@Scheduled(cron = "0 0 2 * * ?") // Her gece 02:00
public void generateDailyReport() {
    RLock lock = redisson.getLock("scheduler:daily-report");
    boolean acquired = false;
    try {
        acquired = lock.tryLock(0, 300, SECONDS);
        if (acquired) {
            reportService.generateDailyReport();
        } else {
            log.info("Another instance running");
        }
    } finally {
        if (acquired && lock.isHeldByCurrentThread())
            lock.unlock();
    }
}`

export default function ScheduledJobSlide() {
  const [jobName, setJobName] = useState('daily-report')
  const [instanceCount, setInstanceCount] = useState(3)
  const [useRedlock, setUseRedlock] = useState(false)

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gradient text-center"
      >
        Distributed Scheduled Jobs
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="glass p-4 border border-amber-500/20 text-center"
      >
        <p className="text-sm text-gray-300">
          <span className="text-amber-400 font-semibold">Kubernetes'te 3 pod aynı @Scheduled job'u çalıştırıyor.</span> Gece 02:00'de
          daily report üretilmeli ama 3 pod birden üretirse 3x duplicate data! Lock ile sadece 1 pod çalışır, diğerleri skip eder.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4">
        {/* Left: Diagram + Code */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Instance Diagram */}
          <div className="glass p-4 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Multi-Pod Deployment</h3>
            <div className="flex items-center justify-around">
              {[1, 2, 3].map((inst) => (
                <motion.div
                  key={inst}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + inst * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${
                      inst === 1
                        ? 'bg-green-900/30 border-green-500 text-green-400'
                        : 'bg-gray-800/50 border-gray-600 text-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-[10px] font-mono">App</div>
                      <div className="text-sm font-bold">#{inst}</div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono ${inst === 1 ? 'text-green-400' : 'text-gray-600'}`}>
                    {inst === 1 ? 'LOCK ACQUIRED' : 'WAITING...'}
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 border border-red-500/30">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <span className="text-xs text-red-400 font-mono">Redis Lock</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
            </motion.div>
          </div>

          <CodeBlock code={scheduledJobCode} language="java" title="ReportScheduler.java" />
        </motion.div>

        {/* Right: Demo */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <DemoPanel
            title="Scheduled Job Simulasyonu"
            description={`${instanceCount} instance ile zamanlanmış görev simülasyonu`}
            onRun={() => useRedlock ? redlockApi.scheduledJob(jobName, instanceCount) : lockApi.scheduledJob(jobName, instanceCount)}
            renderResult={(data) => {
              const d = data as { winnerId?: string; totalInstances?: number; jobExecuted?: boolean }
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Kazanan Instance:</span>
                    <span className="text-green-400 font-mono font-bold">{d.winnerId || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Toplam Instance:</span>
                    <span className="text-white font-mono">{d.totalInstances || instanceCount}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 text-sm">Job Çalıştı mı:</span>
                    <span className={`font-mono font-bold ${d.jobExecuted ? 'text-green-400' : 'text-red-400'}`}>
                      {d.jobExecuted ? 'EVET - Sadece 1 kez' : 'HAYIR'}
                    </span>
                  </div>
                </div>
              )
            }}
          >
            <div className="space-y-3 mt-2">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Lock Algorithm</label>
                <div className="flex gap-1 bg-black/30 rounded-lg p-1">
                  <button
                    onClick={() => setUseRedlock(false)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-mono transition-all ${!useRedlock ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    Single Lock
                  </button>
                  <button
                    onClick={() => setUseRedlock(true)}
                    className={`flex-1 px-2 py-1.5 rounded text-xs font-mono transition-all ${useRedlock ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-gray-300'}`}
                  >
                    Redlock
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Job Name</label>
                <input
                  type="text"
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Instance Sayısı: {instanceCount}</label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={instanceCount}
                  onChange={(e) => setInstanceCount(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>2</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          </DemoPanel>

          {/* Key Points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass p-4 space-y-2"
          >
            <h3 className="text-sm font-semibold text-gray-300">Dikkat Edilecekler</h3>
            {[
              'tryLock ile waitTime=0 kullanın (beklemeyin)',
              'leaseTime, job süresi + güvenlik marjından büyük olmalı',
              'isHeldByCurrentThread() kontrolü yapmayı unutmayın',
              'Job idempotent olmalı (lock yenileme başarısızlığına karşı)',
            ].map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-start gap-2 text-sm text-gray-400"
              >
                <span className="text-yellow-500 mt-0.5 flex-shrink-0">!</span>
                <span>{point}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
