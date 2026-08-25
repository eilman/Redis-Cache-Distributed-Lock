import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface TerminalLine {
  type: 'command' | 'output' | 'error' | 'success'
  text: string
}

interface Props {
  lines: TerminalLine[]
  autoPlay?: boolean
  speed?: number
  title?: string
}

export default function TerminalAnimation({ lines, autoPlay = true, speed = 30, title = 'redis-cli' }: Props) {
  const [displayedLines, setDisplayedLines] = useState<TerminalLine[]>([])
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!autoPlay || currentLineIndex >= lines.length) return

    const line = lines[currentLineIndex]
    if (line.type === 'command' && currentCharIndex === 0) {
      setIsTyping(true)
    }

    if (line.type === 'command') {
      if (currentCharIndex < line.text.length) {
        const timer = setTimeout(() => {
          setDisplayedLines(prev => {
            const updated = [...prev]
            if (updated.length <= currentLineIndex) {
              updated.push({ ...line, text: line.text.slice(0, currentCharIndex + 1) })
            } else {
              updated[currentLineIndex] = { ...line, text: line.text.slice(0, currentCharIndex + 1) }
            }
            return updated
          })
          setCurrentCharIndex(c => c + 1)
        }, speed)
        return () => clearTimeout(timer)
      } else {
        const timer = setTimeout(() => {
          setIsTyping(false)
          setCurrentLineIndex(i => i + 1)
          setCurrentCharIndex(0)
        }, 400)
        return () => clearTimeout(timer)
      }
    } else {
      setDisplayedLines(prev => [...prev, line])
      const timer = setTimeout(() => {
        setCurrentLineIndex(i => i + 1)
        setCurrentCharIndex(0)
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [autoPlay, currentLineIndex, currentCharIndex, lines, speed])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [displayedLines])

  const colorMap: Record<string, string> = {
    command: 'text-green-400',
    output: 'text-gray-300',
    error: 'text-red-400',
    success: 'text-cyan-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-cyan-500/15"
    >
      <div className="bg-slate-800/90 px-4 py-2 flex items-center gap-2 border-b border-cyan-500/10">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-cyan-400/60 ml-2">{title}</span>
      </div>
      <div ref={containerRef} className="bg-slate-950/90 p-4 font-mono text-sm max-h-64 overflow-y-auto">
        {displayedLines.map((line, i) => (
          <div key={i} className={`${colorMap[line.type]} leading-relaxed`}>
            {line.type === 'command' ? (
              <span>
                <span className="text-cyan-500">127.0.0.1:6379&gt;</span>{' '}
                {line.text}
                {i === displayedLines.length - 1 && isTyping && (
                  <span className="animate-pulse">|</span>
                )}
              </span>
            ) : (
              <span>{line.text}</span>
            )}
          </div>
        ))}
        {!isTyping && currentLineIndex < lines.length && (
          <div className="text-red-400">
            127.0.0.1:6379&gt; <span className="animate-pulse">|</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
