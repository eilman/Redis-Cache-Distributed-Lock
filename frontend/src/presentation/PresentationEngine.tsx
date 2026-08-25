import { useSlideNavigation } from '../hooks/useSlideNavigation'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import ParticleBackground from './ParticleBackground'
import ProgressBar from './ProgressBar'
import SlideNavigation from './SlideNavigation'
import SlideRenderer from './SlideRenderer'
import MatrixRain from '../components/effects/MatrixRain'
import ScanLine from '../components/effects/ScanLine'
import FloatingDataStream from '../components/effects/FloatingDataStream'
import { slides } from '../slides'

export default function PresentationEngine() {
  const { currentSlide, direction, goToSlide, next, prev, totalSlides } = useSlideNavigation(slides.length)
  const { showHelp, setShowHelp } = useKeyboardShortcuts(next, prev, goToSlide, totalSlides)

  return (
    <div className="relative w-full h-screen overflow-hidden" style={{ background: '#050a18' }}>
      {/* Matrix rain - subtle background layer */}
      <MatrixRain opacity={0.04} density={24} neonOnly />

      {/* Ambient neon gradient blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute animate-pulse-slow"
          style={{
            top: '-10%', left: '-5%',
            width: '50%', height: '50%',
            background: 'radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute animate-pulse-slow"
          style={{
            bottom: '-15%', right: '-10%',
            width: '55%', height: '55%',
            background: 'radial-gradient(circle, rgba(176,64,255,0.06) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDelay: '1.5s',
          }}
        />
        <div
          className="absolute animate-pulse-slow"
          style={{
            top: '30%', left: '60%',
            width: '45%', height: '45%',
            background: 'radial-gradient(circle, rgba(64,144,255,0.04) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDelay: '3s',
          }}
        />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,240,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,240,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Floating data stream keywords */}
      <FloatingDataStream />

      {/* Particle network */}
      <ParticleBackground />

      {/* Scan line overlay */}
      <ScanLine />

      <ProgressBar
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        goToSlide={goToSlide}
      />

      <SlideRenderer
        currentSlide={currentSlide}
        direction={direction}
        slides={slides}
      />

      <SlideNavigation
        currentSlide={currentSlide}
        totalSlides={totalSlides}
        next={next}
        prev={prev}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
      />
    </div>
  )
}
