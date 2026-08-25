interface Props {
  code: string
  language?: string
}

export default function MiniCodeBlock({ code, language = 'redis' }: Props) {
  return (
    <div className="rounded-lg bg-black/40 border border-cyan-500/10 px-3 py-2 font-mono text-[11px] leading-relaxed overflow-x-auto">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] text-gray-600 uppercase">{language}</span>
      </div>
      <pre className="text-gray-300 whitespace-pre-wrap">{code}</pre>
    </div>
  )
}
