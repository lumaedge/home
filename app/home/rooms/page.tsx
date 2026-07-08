'use client'

import { useState, useEffect } from 'react'
import { ROOMS } from '@/lib/corners'
import Link from 'next/link'

export default function RoomsPage() {
  const [corners, setCorners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/corners').then(async (res) => {
      if (res.ok) setCorners(await res.json())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  const aliveNames = new Set(corners.filter((c: any) => c._count.entries > 0).map((c: any) => c.name))

  return (
    <div>
      <h1 className="mb-2 font-serif text-xl text-warm-700">Rooms</h1>
      <p className="mb-8 text-xs text-warm-400">A hallway. Some doors are open. Some are waiting.</p>
      <div className="grid grid-cols-2 gap-3">
        {ROOMS.map((room) => {
          const corner = corners.find((c: any) => c.name === room.name)
          const isOpen = corner && aliveNames.has(room.name)
          if (isOpen) {
            return (
              <Link key={corner.id} href={`/home/rooms/${corner.id}`} className="card-hover flex flex-col items-center gap-2 py-6 text-center">
                <span className="text-2xl">{room.icon}</span>
                <span className="text-xs font-medium text-warm-700">{room.name}</span>
                <span className="text-[10px] text-warm-300">{corner._count.entries}</span>
              </Link>
            )
          }
          return (
            <div key={room.name} className="flex flex-col items-center gap-2 rounded-2xl border border-warm-200/40 bg-warm-50/30 py-6 text-center opacity-60">
              <span className="text-2xl opacity-40">{room.icon}</span>
              <span className="text-xs font-medium text-warm-400">{room.name}</span>
              <span className="px-3 text-[10px] italic text-warm-300 leading-relaxed">{room.description.split('\n')[0]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
