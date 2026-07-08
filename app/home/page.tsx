'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadIdentity, apiFetch } from '@/lib/identity'
import { getDailySentence } from '@/lib/sentences'
import EntryCard from '@/components/EntryCard'
import Link from 'next/link'

function getAtmosphere() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return { gradient: 'from-amber-50/40 to-warm-50', icon: '🌅', label: 'morning' }
  if (h >= 12 && h < 17) return { gradient: 'from-warm-100/30 to-warm-50', icon: '☀️', label: 'afternoon' }
  if (h >= 17 && h < 21) return { gradient: 'from-amber-100/40 to-warm-50', icon: '🌇', label: 'evening' }
  return { gradient: 'from-indigo-50/40 to-warm-50', icon: '🌙', label: 'night' }
}

function getMilestones(entries: any[]) {
  const m: string[] = []
  const uniqueDays = new Set(entries.map((e: any) => new Date(e.createdAt).toDateString())).size
  if (uniqueDays >= 1) m.push('🌱')
  if (uniqueDays >= 3) m.push('📚')
  if (uniqueDays >= 7) m.push('🪴')
  if (uniqueDays >= 14) m.push('🕯️')
  if (uniqueDays >= 30) m.push('🖼️')
  if (entries.length >= 10) m.push('🧸')
  return m
}

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerPresent, setPartnerPresent] = useState(false)
  const [partnerName, setPartnerName] = useState('')

  const atmosphere = getAtmosphere()

  useEffect(() => {
    const { homeId, name: n } = loadIdentity()
    if (!homeId || !n) { router.replace('/'); return }
    setName(n)

    const fetchAll = async () => {
      try {
        const [entriesRes, presenceRes] = await Promise.all([
          apiFetch('/api/entries'),
          apiFetch('/api/presence'),
        ])
        if (entriesRes.ok) setEntries(await entriesRes.json())
        if (presenceRes.ok) {
          const p = await presenceRes.json()
          setPartnerPresent(p.present)
          setPartnerName(p.partnerName || '')
        }
      } catch {} finally { setLoading(false) }
    }

    fetchAll()
    const interval = setInterval(async () => {
      try {
        await apiFetch('/api/presence', { method: 'POST' })
        const res = await apiFetch('/api/presence')
        if (res.ok) {
          const p = await res.json()
          setPartnerPresent(p.present)
          setPartnerName(p.partnerName || '')
        }
      } catch {}
    }, 15000)

    return () => clearInterval(interval)
  }, [router])

  const sentence = getDailySentence()
  const todayEntries = entries.filter((e: any) => {
    const d = new Date(e.createdAt)
    return d.toDateString() === new Date().toDateString()
  })
  const milestones = getMilestones(entries)
  const roomsCount = entries.filter((e: any) => e.corners?.length > 0).length

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  return (
    <div className={`space-y-10 transition-all duration-1000 bg-gradient-to-b ${atmosphere.gradient}`}>
      <section className="fade-in text-center pt-8 relative">
        <div className="mb-2 text-3xl">{atmosphere.icon}</div>
        <h1 className="font-serif text-2xl text-warm-800">
          Welcome Home, {name}.
        </h1>
        <p className="mt-2 text-sm italic text-warm-400">{sentence}</p>

        {partnerPresent && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-warm-400">
            <span className="flex h-2 w-2 rounded-full bg-warm-400 shadow-[0_0_6px_rgba(168,115,70,0.4)]" />
            {partnerName} is home
          </div>
        )}

        {milestones.length > 0 && (
          <div className="mt-4 flex justify-center gap-2 text-lg">
            {milestones.map((m, i) => (
              <span key={i} className="fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{m}</span>
            ))}
          </div>
        )}
      </section>

      <Link
        href="/home/write"
        className="card-hover group flex items-center gap-3 border-2 border-dashed border-warm-200 bg-warm-50/50 py-4"
      >
        <span className="text-xl">✍️</span>
        <span className="text-sm text-warm-500 group-hover:text-warm-700 transition-colors">
          Leave something here
        </span>
      </Link>

      {todayEntries.length === 0 && entries.length === 0 && (
        <div className="py-8 text-center fade-in">
          <div className="mb-3 text-3xl">🌿</div>
          <p className="font-serif text-base text-warm-400">Nothing new today.</p>
          <p className="mt-1 text-xs text-warm-300">Sometimes love looks like giving each other space.</p>
        </div>
      )}

      {todayEntries.length === 0 && entries.length > 0 && (
        <div className="py-8 text-center fade-in">
          <div className="mb-3 text-3xl">🌙</div>
          <p className="font-serif text-base text-warm-400">Nothing new today.</p>
          <p className="mt-1 text-xs text-warm-300">Your Home is waiting.</p>
        </div>
      )}

      {entries.length > 0 && (
        <section className="space-y-3">
          {entries.slice(0, 5).map((entry: any) => (
            <EntryCard key={entry.id} entry={entry} isOwn={entry.authorName === name} />
          ))}
        </section>
      )}

      <footer className="pb-4 text-center space-y-2">
        {roomsCount > 0 && (
          <Link href="/home/rooms" className="block text-[10px] text-warm-300 hover:text-warm-500 transition-colors">
            🚪 Rooms
          </Link>
        )}
        <p className="text-[10px] text-warm-300">
          Take your time. Nothing here is urgent.
        </p>
      </footer>
    </div>
  )
}
