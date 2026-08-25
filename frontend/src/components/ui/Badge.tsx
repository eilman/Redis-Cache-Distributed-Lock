import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  variant?: 'red' | 'green' | 'indigo' | 'yellow' | 'gray' | 'orange' | 'cyan'
}

const variantClasses: Record<string, string> = {
  red: 'bg-red-500/20 text-red-400 border-red-500/30',
  green: 'bg-green-500/20 text-green-400 border-green-500/30',
  indigo: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
}

export default function Badge({ children, variant = 'gray' }: Props) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}>
      {children}
    </span>
  )
}
