import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md'
}

const variants: Record<string, string> = {
  primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
  secondary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
  danger: 'bg-red-700 hover:bg-red-600 text-white shadow-lg shadow-red-500/20',
  ghost: 'bg-white/5 hover:bg-white/10 text-cyan-200 border border-cyan-500/20',
}

export default function Button({ children, onClick, variant = 'primary', disabled, loading, size = 'md' }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variants[variant]} ${size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
      )}
      {children}
    </button>
  )
}
