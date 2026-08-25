import { useEffect, useRef, memo } from 'react'

interface Props {
  /** Overall opacity of the rain effect (0-1) */
  opacity?: number
  /** Characters per column density. Lower = more columns */
  density?: number
  /** Use only cyan/blue/purple palette (no green) */
  neonOnly?: boolean
}

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFREDISCACHELOCK{}[]<>/\\|'

function MatrixRainCanvas({ opacity = 0.06, density = 22, neonOnly = true }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const fontSize = 14
    const columns = Math.floor(canvas.width / density)
    const drops: number[] = Array.from({ length: columns }, () => Math.random() * -100)
    const speeds: number[] = Array.from({ length: columns }, () => 0.3 + Math.random() * 0.7)

    const neonColors = [
      'rgba(0,240,255,',   // cyan
      'rgba(64,144,255,',  // blue
      'rgba(176,64,255,',  // purple
      'rgba(255,64,160,',  // pink
    ]

    const allColors = [
      ...neonColors,
      'rgba(0,255,136,',   // green (for non-neon mode)
    ]

    const palette = neonOnly ? neonColors : allColors

    const animate = () => {
      // Fade trail
      ctx.fillStyle = `rgba(5,10,24,0.08)`
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.font = `${fontSize}px monospace`

      for (let i = 0; i < columns; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const x = i * density
        const y = drops[i] * fontSize

        // Head character (bright)
        const color = palette[i % palette.length]
        ctx.fillStyle = color + '0.9)'
        ctx.fillText(char, x, y)

        // Glow effect for head
        ctx.shadowColor = color + '0.5)'
        ctx.shadowBlur = 8
        ctx.fillText(char, x, y)
        ctx.shadowBlur = 0

        // Trail characters (dimmer)
        for (let j = 1; j < 6; j++) {
          const trailY = y - j * fontSize
          if (trailY > 0) {
            const trailAlpha = Math.max(0.05, 0.3 - j * 0.05)
            ctx.fillStyle = color + trailAlpha + ')'
            const trailChar = CHARS[Math.floor(Math.random() * CHARS.length)]
            ctx.fillText(trailChar, x, trailY)
          }
        }

        drops[i] += speeds[i]

        // Reset with randomness
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = Math.random() * -20
          speeds[i] = 0.3 + Math.random() * 0.7
        }
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [opacity, density, neonOnly])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity }}
    />
  )
}

export default memo(MatrixRainCanvas)
