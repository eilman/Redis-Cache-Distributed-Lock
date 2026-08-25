import { motion } from 'framer-motion'

const sections = [
  { name: 'Giris', slides: [0, 1] },
  { name: 'Cache Temelleri', slides: [2, 3] },
  { name: 'Cache Patterns', slides: [4, 5, 6, 7, 8] },
  { name: 'TTL & Invalidation', slides: [9, 10, 11] },
  { name: 'Cache Keys', slides: [12, 13] },
  { name: 'Cache Problemleri', slides: [14, 15, 16, 17] },
  { name: 'Dayanıklılık', slides: [18, 19, 20] },
  { name: 'Distributed Lock', slides: [21, 22, 23, 24, 25] },
  { name: 'Redlock', slides: [26, 27, 28] },
  { name: 'Monitoring', slides: [29, 30] },
  { name: 'Test', slides: [31, 32] },
  { name: 'Sonuc', slides: [33, 34] },
]

interface Props {
  currentSlide: number
  totalSlides: number
  goToSlide: (i: number) => void
}

export default function ProgressBar({ currentSlide, totalSlides, goToSlide }: Props) {
  const progress = ((currentSlide + 1) / totalSlides) * 100

  const currentSection = sections.findIndex(s => s.slides.includes(currentSlide))

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Progress bar */}
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full"
          style={{ background: 'linear-gradient(90deg, #00f0ff, #4090ff, #b040ff, #ff40a0)' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Section dots */}
      <div className="flex justify-center gap-3 py-2">
        {sections.map((section, i) => (
          <div key={i} className="relative group">
            <button
              onClick={() => goToSlide(section.slides[0])}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === currentSection
                  ? 'scale-125 ring-2 ring-[#00f0ff]/40'
                  : i < currentSection
                  ? 'opacity-80'
                  : 'bg-white/15 hover:bg-white/30'
              }`}
              style={
                i === currentSection
                  ? { background: '#00f0ff', boxShadow: '0 0 8px rgba(0,240,255,0.5)' }
                  : i < currentSection
                  ? { background: '#00ff88' }
                  : undefined
              }
            />
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {section.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
