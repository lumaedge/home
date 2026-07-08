'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadIdentity, apiFetch } from '@/lib/identity'
import { ROOMS } from '@/lib/corners'
import EntryCard from '@/components/EntryCard'
import Link from 'next/link'

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [cornerDef, setCornerDef] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { homeId, name: n } = loadIdentity()
    if (!homeId || !n) { router.replace('/'); return }
    setName(n)

    Promise.all([
      apiFetch('/api/corners').then(r => r.ok && r.json()),
      apiFetch('/api/entries').then(r => r.ok && r.json()),
    ]).then(([corners, allEntries]) => {
      if (!corners || !allEntries) return
      const corner = corners.find((c: any) => c.id === params.id)
      if (!corner) { router.push('/home/rooms'); return }
      const def = ROOMS.find((c: any) => c.name === corner.name)
      setCornerDef(def)
      const entryIds = new Set((corner.entries || []).map((e: any) => e.entryId))
      setEntries(allEntries.filter((e: any) => entryIds.has(e.id)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router, params.id])

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  return (
    <div>
      <Link href="/home/rooms" className="btn-ghost mb-4 inline-flex text-xs">← All Rooms</Link>
      {cornerDef && (
        <div className="mb-6 flex items-center gap-3">
          <span className="text-2xl">{cornerDef.icon}</span>
          <h1 className="font-serif text-xl text-warm-700">{cornerDef.name}</h1>
        </div>
      )}
      <div className="space-y-4">
        {entries.map((entry: any) => (
          <EntryCard key={entry.id} entry={entry} isOwn={entry.authorName === name} />
        ))}
      </div>
    </div>
  )
}
