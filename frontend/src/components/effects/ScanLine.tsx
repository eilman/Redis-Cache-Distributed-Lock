import { memo } from 'react'

/** Horizontal scan line that continuously sweeps down the screen */
function ScanLine() {
  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Moving scan line */}
      <div
        className="absolute left-0 right-0 h-[2px] animate-scan-line"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.15), rgba(176,64,255,0.1), transparent)',
          boxShadow: '0 0 20px rgba(0,240,255,0.1), 0 0 60px rgba(0,240,255,0.05)',
        }}
      />
      {/* Subtle horizontal line pattern (CRT effect) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.008) 2px, rgba(0,240,255,0.008) 4px)',
        }}
      />
    </div>
  )
}

export default memo(ScanLine)
