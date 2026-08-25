import { motion } from 'framer-motion'

interface Props {
  code: string
  language?: string
  title?: string
}

const tokenRegex = /(\/\/.*$|\/\*[\s\S]*?\*\/)|(["'`])(?:(?=(\\?))\3.)*?\2|(@\w+)|\b(public|private|protected|class|interface|return|if|else|new|try|catch|finally|throw|throws|void|static|final|import|package|extends|implements|boolean|int|long|String|var|let|const|function|async|await|for|while|do)\b|\b(\d+\.?\d*)\b/gm

function highlight(code: string): string {
  const escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return escaped.replace(tokenRegex, (match, comment, _quote, _esc, annotation, keyword, number) => {
    if (comment) return `<span class="text-slate-500">${match}</span>`
    if (_quote) return `<span class="text-emerald-400">${match}</span>`
    if (annotation) return `<span class="text-amber-400">${match}</span>`
    if (keyword) return `<span class="text-cyan-400">${match}</span>`
    if (number) return `<span class="text-purple-400">${match}</span>`
    return match
  })
}

export default function CodeBlock({ code, language = 'java', title }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden border border-cyan-500/15"
    >
      {title && (
        <div className="bg-slate-800/60 px-4 py-2 text-xs text-slate-400 flex items-center justify-between border-b border-cyan-500/10">
          <span>{title}</span>
          <span className="text-cyan-500/40">{language}</span>
        </div>
      )}
      <pre className="bg-slate-950/60 p-3 overflow-x-auto text-xs leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlight(code) }} />
      </pre>
    </motion.div>
  )
}
