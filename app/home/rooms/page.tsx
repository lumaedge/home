'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadIdentity, apiFetch } from '@/lib/identity'
import { ROOMS } from '@/lib/corners'
import Link from 'next/link'

export default function RoomsPage() {
  const router = useRouter()
  const [corners, setCorners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const { homeId } = loadIdentity()
    if (!homeId) { router.replace('/'); return }
    apiFetch('/api/corners').then(async (res) => {
      if (res.ok) setCorners(await res.json())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [router])

  if (loading) return <div className="pt-20 text-center text-xs text-warm-300">...</div>

  const alive = corners.filter((c: any) => c._count.entries > 0)

  return (
    <div>
      <h1 className="mb-6 font-serif text-xl text-warm-700">Rooms</h1>
      <p className="mb-8 text-xs text-warm-400">Places that have grown into your home.</p>
      {alive.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mb-3 text-3xl">🏡</div>
          <p className="font-serif text-sm text-warm-400">Your rooms will appear here</p>
          <p className="mt-1 text-xs text-warm-300">as you fill your home with thoughts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {alive.map((corner: any) => {
            const def = ROOMS.find((c) => c.name === corner.name)
            return (
              <Link
                key={corner.id}
                href={`/home/rooms/${corner.id}`}
                className="card-hover flex flex-col items-center gap-2 py-6 text-center"
              >
                <span className="text-2xl">{def?.icon}</span>
                <span className="text-xs font-medium text-warm-700">{corner.name}</span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
