import { useEffect } from 'react'
import PresentationEngine from './presentation/PresentationEngine'
import { LiveDemoProvider } from './live-demo/context/LiveDemoContext'
import LiveDemoFab from './live-demo/LiveDemoFab'
import LiveDemoOverlay from './live-demo/LiveDemoOverlay'
import SimulationBadge from './mock/SimulationBadge'
import { detectAndSetMode } from './mock/mockDetector'

export default function App() {
  useEffect(() => {
    detectAndSetMode()
  }, [])

  return (
    <LiveDemoProvider>
      <PresentationEngine />
      <LiveDemoFab />
      <LiveDemoOverlay />
      <SimulationBadge />
    </LiveDemoProvider>
  )
}
