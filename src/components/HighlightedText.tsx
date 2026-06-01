type HighlightedTextProps = {
  text: string
  query: string
  className?: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedText({ text, query, className = '' }: HighlightedTextProps) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return <span className={className}>{text}</span>
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(trimmedQuery)})`, 'ig'))

  return (
    <span className={className}>
      {parts.map((part, index) =>
        part.toLowerCase() === trimmedQuery.toLowerCase() ? (
          <mark key={`${part}-${index}`} className='rounded bg-violet-400/20 px-0.5 text-violet-100'>
            {part}
          </mark>
        ) : (
          <span key={`${part}-${index}`}>{part}</span>
        )
      )}
    </span>
  )
}

export default HighlightedText
