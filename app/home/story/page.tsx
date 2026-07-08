'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import EntryCard from '@/components/EntryCard'

export default function StoryPage() {
  const { data: session } = useSession()
  const [entries, setEntries] = useState<any[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/entries').then(async (res) => {
      if (res.ok) {
        const data = await res.json()
        setEntries(data)
        if (data.length > 0) setIndex(Math.floor(Math.random() * data.length))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  if (entries.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <div className="mb-4 text-4xl">🔥</div>
        <p className="font-serif text-base text-warm-400">The fireplace is waiting</p>
        <p className="mt-1 text-xs text-warm-300">for stories to warm it.</p>
      </div>
    )
  }

  const entry = entries[index]

  function next() {
    let i: number
    do { i = Math.floor(Math.random() * entries.length) } while (i === index && entries.length > 1)
    setIndex(i)
  }

  return (
    <div className="flex flex-col items-center pt-8">
      <div className="mb-6 text-center">
        <span className="text-3xl">🔥</span>
        <h1 className="mt-2 font-serif text-lg text-warm-700">Do you remember this?</h1>
      </div>
      <div key={entry.id} className="w-full fade-in">
        <EntryCard entry={entry} isOwn={entry.authorId === session?.user?.id} />
      </div>
      <div className="mt-8 flex gap-4">
        <button onClick={next} className="btn-ghost text-xs">Another log</button>
      </div>
    </div>
  )
}
