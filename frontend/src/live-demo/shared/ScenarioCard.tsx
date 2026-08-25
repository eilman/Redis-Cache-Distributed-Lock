import { motion } from 'framer-motion'

interface Props {
  title: string
  description: string
  icon: string
  color: string
  isActive?: boolean
  onClick: () => void
}

const colorMap: Record<string, string> = {
  cyan: 'border-cyan-500/30 hover:border-cyan-400/50',
  amber: 'border-amber-500/30 hover:border-amber-400/50',
  green: 'border-green-500/30 hover:border-green-400/50',
  red: 'border-red-500/30 hover:border-red-400/50',
  purple: 'border-purple-500/30 hover:border-purple-400/50',
}

const activeColorMap: Record<string, string> = {
  cyan: 'border-cyan-400 bg-cyan-500/10',
  amber: 'border-amber-400 bg-amber-500/10',
  green: 'border-green-400 bg-green-500/10',
  red: 'border-red-400 bg-red-500/10',
  purple: 'border-purple-400 bg-purple-500/10',
}

const textColorMap: Record<string, string> = {
  cyan: 'text-cyan-400',
  amber: 'text-amber-400',
  green: 'text-green-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
}

export default function ScenarioCard({ title, description, icon, color, isActive, onClick }: Props) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isActive ? activeColorMap[color] || activeColorMap.cyan : `bg-white/[0.02] ${colorMap[color] || colorMap.cyan}`
      }`}
    >
      <div className="flex items-start gap-3">
        <span className={`text-xl ${textColorMap[color] || textColorMap.cyan}`}>{icon}</span>
        <div>
          <p className={`text-sm font-semibold ${isActive ? 'text-white' : 'text-gray-200'}`}>{title}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
    </motion.button>
  )
}
