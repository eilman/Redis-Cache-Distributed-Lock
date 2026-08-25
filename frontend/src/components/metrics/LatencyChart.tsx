import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts'

interface DataPoint {
  timestamp: number
  latencyMs: number
  type: string
}

interface Props {
  data: DataPoint[]
}

export default function LatencyChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
        Henuz veri yok. Demo çalıştırin.
      </div>
    )
  }

  const formatted = data.map(d => ({
    time: new Date(d.timestamp).toLocaleTimeString(),
    latency: d.latencyMs,
    type: d.type,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 10 }} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} unit="ms" />
        <Tooltip
          contentStyle={{ background: '#0f172a', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '8px' }}
        />
        <Area type="monotone" dataKey="latency" stroke="#00d4ff" fill="url(#latencyGradient)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
