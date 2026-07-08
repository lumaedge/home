import { HOME_CONFIG } from '@/lib/home-config'
import { getPersonLabel, getOtherPerson, getPersonEmoji } from '@/lib/identity'

type EntryCardProps = {
  entry: { id: string; content: string; createdAt: string; authorName: string }
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
  const label = HOME_CONFIG.personalMode ? getPersonLabel(entry.authorName) : (isOwn ? 'You' : entry.authorName)
  const emoji = HOME_CONFIG.personalMode
    ? (isOwn ? getPersonEmoji() : getOtherPerson()?.emoji || '💛')
    : null

  return (
    <div className={`card fade-in transition-all duration-300 hover:shadow-md ${isOwn ? 'ml-6' : 'mr-6'}`}>
      <p className="text-sm leading-relaxed text-warm-800 whitespace-pre-wrap">{entry.content}</p>
      <div className="mt-3 flex items-center gap-2 text-xs text-warm-400">
        {HOME_CONFIG.personalMode ? (
          <span className="text-sm">{emoji}</span>
        ) : (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-warm-200 text-[10px] font-medium text-warm-600">
            {entry.authorName?.charAt(0) || '?'}
          </span>
        )}
        <span>{label}</span>
        <span className="ml-auto">{timeAgo(entry.createdAt)}</span>
      </div>
    </div>
  )
}
