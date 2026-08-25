import { useEffect, useRef } from 'react'

interface Props {
  type: 'hit' | 'miss' | 'write'
  width?: number
  height?: number
}

export default function DataFlowParticles({ type, width = 400, height = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    canvas.width = width
    canvas.height = height

    const colors = { hit: '#00e68a', miss: '#f97316', write: '#a855f7' }
    const color = colors[type]

    interface Particle {
      x: number; y: number; progress: number; speed: number; size: number
    }

    const particles: Particle[] = []
    let animId: number

    const paths = {
      hit: [
        { x: 50, y: 100 }, { x: 200, y: 60 }, { x: 350, y: 100 },
      ],
      miss: [
        { x: 50, y: 100 }, { x: 200, y: 60 }, { x: 200, y: 140 }, { x: 350, y: 100 },
      ],
      write: [
        { x: 50, y: 100 }, { x: 200, y: 100 }, { x: 350, y: 60 }, { x: 350, y: 140 },
      ],
    }

    const path = paths[type]

    const spawnParticle = () => {
      particles.push({
        x: path[0].x,
        y: path[0].y,
        progress: 0,
        speed: 0.005 + Math.random() * 0.005,
        size: 3 + Math.random() * 3,
      })
    }

    const getPointOnPath = (progress: number) => {
      const totalSegments = path.length - 1
      const segment = Math.floor(progress * totalSegments)
      const t = (progress * totalSegments) - segment
      const p0 = path[Math.min(segment, path.length - 1)]
      const p1 = path[Math.min(segment + 1, path.length - 1)]
      return {
        x: p0.x + (p1.x - p0.x) * t,
        y: p0.y + (p1.y - p0.y) * t,
      }
    }

    let spawnTimer = 0
    const animate = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw path
      ctx.beginPath()
      ctx.moveTo(path[0].x, path[0].y)
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y)
      }
      ctx.strokeStyle = color + '30'
      ctx.lineWidth = 2
      ctx.setLineDash([5, 5])
      ctx.stroke()
      ctx.setLineDash([])

      // Labels
      ctx.font = '11px Inter, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.textAlign = 'center'
      ctx.fillText('App', path[0].x, path[0].y + 25)
      ctx.fillText('Cache', 200, 40)
      if (type === 'miss') ctx.fillText('DB', 200, height - 20)
      if (type === 'write') {
        ctx.fillText('Cache', 350, 45)
        ctx.fillText('DB', 350, height - 20)
      } else {
        ctx.fillText('Response', path[path.length - 1].x, path[path.length - 1].y + 25)
      }

      // Nodes
      for (const p of path) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
        ctx.fillStyle = color + '40'
        ctx.fill()
        ctx.strokeStyle = color
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.progress += p.speed
        if (p.progress >= 1) {
          particles.splice(i, 1)
          continue
        }
        const pos = getPointOnPath(p.progress)
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 10
        ctx.fill()
        ctx.shadowBlur = 0
      }

      spawnTimer++
      if (spawnTimer % 30 === 0) spawnParticle()

      animId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animId)
  }, [type, width, height])

  return <canvas ref={canvasRef} width={width} height={height} className="w-full" />
}
