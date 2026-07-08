'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadIdentity, apiFetch, getPersonLabel } from '@/lib/identity'
import { HOME_CONFIG } from '@/lib/home-config'
import EntryCard from '@/components/EntryCard'
import Link from 'next/link'

function getSeason() {
  const m = new Date().getMonth()
  if (m >= 2 && m <= 4) return { name: 'spring', icon: '🌸', window: 'from-pink-100/30 via-amber-50/20 to-sky-100/30' }
  if (m >= 5 && m <= 7) return { name: 'summer', icon: '🌻', window: 'from-amber-100/30 via-warm-50/20 to-sky-200/30' }
  if (m >= 8 && m <= 10) return { name: 'autumn', icon: '🍂', window: 'from-orange-100/30 via-amber-50/20 to-warm-100/30' }
  return { name: 'winter', icon: '❄️', window: 'from-slate-100/30 via-indigo-50/20 to-blue-100/30' }
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h >= 5 && h < 8) return { label: 'dawn', gradient: 'from-amber-50/50 to-warm-50' }
  if (h >= 8 && h < 12) return { label: 'morning', gradient: 'from-amber-50/30 to-warm-50' }
  if (h >= 12 && h < 17) return { label: 'afternoon', gradient: 'from-warm-100/20 to-warm-50' }
  if (h >= 17 && h < 20) return { label: 'golden hour', gradient: 'from-amber-100/50 to-warm-50' }
  if (h >= 20 && h < 23) return { label: 'evening', gradient: 'from-indigo-50/30 to-warm-50' }
  return { label: 'night', gradient: 'from-indigo-100/20 to-warm-50' }
}

function houseVoice(entries: any[]) {
  const weekAgo = Date.now() - 7 * 86400000
  const recent = entries.filter((e: any) => new Date(e.createdAt).getTime() > weekAgo)

  const hardWords = ['hard', 'sad', 'heavy', 'tired', 'lonely', 'hurt', 'pain', 'cry', 'anxious', 'overwhelmed']
  const heavyCount = recent.filter((e: any) =>
    hardWords.some((w) => e.content.toLowerCase().includes(w))
  ).length

  if (recent.length === 0) {
    const voices = [
      'The house has been quiet. Peacefully so.',
      'Everything is still. In a good way.',
      'The walls are resting. So should you.',
      'Not a sound. Just the soft hum of being together.',
    ]
    return voices[Math.floor(Math.random() * voices.length)]
  }

  if (heavyCount >= 3) {
    const voices = [
      'It\'s been a lot lately. Take your time today.',
      'The house knows. You don\'t have to say anything more.',
      'Some seasons ask more of us. This space can hold it.',
      'Be gentle with yourself today. The home is.',
    ]
    return voices[Math.floor(Math.random() * voices.length)]
  }

  if (recent.length >= 5) {
    const voices = [
      'There\'s been a lot of life here lately. It\'s beautiful.',
      'The walls are warm from all the words shared this week.',
      'This home is full. Not of things. Of moments.',
    ]
    return voices[Math.floor(Math.random() * voices.length)]
  }

  const voices = [
    'Welcome home. The kettle just boiled.',
    'The door is always unlocked.',
    'Come in. There\'s no rush.',
    'The house has been waiting. Quietly. Patiently.',
  ]
  return voices[Math.floor(Math.random() * voices.length)]
}

export default function HomePage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [partnerPresent, setPartnerPresent] = useState(false)
  const [partnerName, setPartnerName] = useState('')

  const season = getSeason()
  const time = getTimeOfDay()

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

  const todayEntries = entries.filter((e: any) => {
    const d = new Date(e.createdAt)
    return d.toDateString() === new Date().toDateString()
  })

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  const voice = houseVoice(entries)

  return (
    <div className={`space-y-10 transition-all duration-1000 bg-gradient-to-b ${time.gradient}`}>
      <section className="fade-in pt-8 relative">
        <div className={`mx-auto mb-6 h-28 w-full max-w-[200px] rounded-2xl bg-gradient-to-b ${season.window} shadow-inner flex items-center justify-center`}>
          <span className="text-3xl opacity-60">{season.icon}</span>
        </div>

        <div className="text-center">
          <p className="mb-1 text-[10px] uppercase tracking-widest text-warm-300">{time.label}</p>
          <h1 className="font-serif text-2xl text-warm-800">
            Welcome home.
          </h1>
          <p className="mt-3 text-sm italic leading-relaxed text-warm-400">{voice}</p>

          {partnerPresent && (
            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-warm-400">
              <span className="flex h-2 w-2 rounded-full bg-warm-400 shadow-[0_0_8px_rgba(168,115,70,0.5)]" />
              {HOME_CONFIG.personalMode ? 'You\'re both home' : `${partnerName} is home`}
            </div>
          )}
        </div>
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

      <footer className="pb-4 text-center">
        <p className="text-[10px] text-warm-300">
          Take your time. Nothing here is urgent.
        </p>
      </footer>
    </div>
  )
}
