const badges = {
  HIT: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
  MISS: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500' },
  ERROR: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500 animate-pulse' },
  LOCKED: { bg: 'bg-purple-500/15', text: 'text-purple-400', dot: 'bg-purple-500' },
  WAITING: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500 animate-pulse' },
  OK: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500' },
  EXPIRED: { bg: 'bg-gray-500/15', text: 'text-gray-400', dot: 'bg-gray-500' },
}

interface Props {
  type: keyof typeof badges
  label?: string
}

export default function StatusBadge({ type, label }: Props) {
  const style = badges[type]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label || type}
    </span>
  )
}
