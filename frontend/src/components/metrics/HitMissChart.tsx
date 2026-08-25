import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Props {
  hits: number
  misses: number
}

export default function HitMissChart({ hits, misses }: Props) {
  const data = [
    { name: 'Cache Hit', value: hits, color: '#00e68a' },
    { name: 'Cache Miss', value: misses, color: '#f87171' },
  ]

  if (hits === 0 && misses === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Henuz veri yok. Demo çalıştırin.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px' }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Legend
          formatter={(value: string) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
