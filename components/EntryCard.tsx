type EntryCardProps = {
  entry: { id: string; content: string; createdAt: string; authorName: string; authorId?: string | null }
  isOwn: boolean
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function EntryCard({ entry, isOwn }: EntryCardProps) {
  return (
    <div className={`card fade-in transition-all duration-300 hover:shadow-md ${isOwn ? 'ml-6' : 'mr-6'}`}>
      <p className="text-sm leading-relaxed text-warm-800 whitespace-pre-wrap">{entry.content}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-warm-400">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warm-200 text-[10px] font-medium text-warm-600">
          {isOwn ? 'Y' : (entry.authorName?.charAt(0) || '?')}
        </span>
        <span>{isOwn ? 'You' : entry.authorName}</span>
        <span className="ml-auto">{timeAgo(entry.createdAt)}</span>
      </div>
    </div>
  )
}
