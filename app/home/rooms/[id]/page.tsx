'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ROOMS } from '@/lib/corners'
import EntryCard from '@/components/EntryCard'
import Link from 'next/link'

export default function RoomPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [entries, setEntries] = useState<any[]>([])
  const [cornerDef, setCornerDef] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/corners').then(r => r.ok && r.json()),
      fetch('/api/entries').then(r => r.ok && r.json()),
    ]).then(([corners, allEntries]) => {
      if (!corners || !allEntries) return
      const corner = corners.find((c: any) => c.id === params.id)
      if (!corner) { router.push('/home/rooms'); return }
      const def = ROOMS.find((c: any) => c.name === corner.name)
      setCornerDef(def)
      const entryIds = new Set((corner.entries || []).map((e: any) => e.entryId))
      setEntries(allEntries.filter((e: any) => entryIds.has(e.id)))
      setLoading(false)
      setTimeout(() => setEntered(true), 200)
    }).catch(() => setLoading(false))
  }, [router, params.id])

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  const lines = cornerDef?.description?.split('\n') || []

  return (
    <div>
      <Link href="/home/rooms" className={`btn-ghost inline-flex text-xs transition-opacity duration-500 ${entered ? 'opacity-100' : 'opacity-0'}`}>← All Rooms</Link>
      {cornerDef && (
        <div className={`mb-8 transition-all duration-700 ${entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="mb-4 flex items-center gap-3">
            <span className="text-3xl">{cornerDef.icon}</span>
            <h1 className="font-serif text-2xl text-warm-700">{cornerDef.name}</h1>
          </div>
          <div className="space-y-1 border-l-2 border-warm-200 pl-4">
            {lines.map((line: string, i: number) => (
              <p key={i} className="text-sm italic leading-relaxed text-warm-400 transition-all duration-500"
                style={{ opacity: entered ? 1 : 0, transform: entered ? 'translateX(0)' : 'translateX(-8px)', transitionDelay: `${i * 300}ms` }}>
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
      <div className={`space-y-4 transition-all duration-700 delay-500 ${entered ? 'opacity-100' : 'opacity-0'}`}>
        {entries.length === 0 && (
          <p className="py-12 text-center font-serif text-sm text-warm-300 italic">This room is still waiting for its first memory.</p>
        )}
        {entries.map((entry: any) => (
          <EntryCard key={entry.id} entry={entry} isOwn={entry.authorId === session?.user?.id} />
        ))}
      </div>
    </div>
  )
}
