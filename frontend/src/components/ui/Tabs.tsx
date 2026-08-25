import { useState, ReactNode } from 'react'

interface Tab {
  label: string
  content: ReactNode
}

interface Props {
  tabs: Tab[]
}

export default function Tabs({ tabs }: Props) {
  const [active, setActive] = useState(0)

  return (
    <div>
      <div className="flex border-b border-cyan-500/10 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              i === active
                ? 'text-cyan-400 border-cyan-400'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  )
}
