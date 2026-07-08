'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { clearIdentity, loadIdentity } from '@/lib/identity'
import { useState } from 'react'

const links = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/home/write', label: 'Write', icon: '✍️' },
  { href: '/home/story', label: 'Story', icon: '📖' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-warm-200 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-1.5">
          {links.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-6 py-1 transition-all duration-200 ${
                  active ? 'text-warm-700' : 'text-warm-400 hover:text-warm-600'
                }`}
              >
                <span className="text-lg">{link.icon}</span>
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            )
          })}
        </div>
        <div className="flex justify-center pb-1">
          <button onClick={() => setShowInfo(true)} className="text-[9px] text-warm-300 hover:text-warm-500 transition-colors">
            Our Home
          </button>
        </div>
      </nav>

      {showInfo && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/20" onClick={() => setShowInfo(false)}>
          <div className="w-full max-w-lg rounded-t-3xl bg-white px-6 pb-24 pt-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-warm-200" />
            <InfoSheet />
          </div>
        </div>
      )}
    </>
  )
}

function InfoSheet() {
  const router = useRouter()
  const { homeId } = loadIdentity()
  const [key, setKey] = useState('')
  const [people, setPeople] = useState('')

  useState(() => {
    if (!homeId) return
    fetch('/api/home', { headers: { 'x-home-id': homeId } })
      .then(r => r.ok && r.json())
      .then(d => {
        setKey(d.inviteCode)
        const names = [d.person1, d.person2].filter(Boolean)
        setPeople(names.join(' & '))
      })
  })

  return (
    <div className="space-y-4 text-sm">
      <div className="rounded-xl bg-warm-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">🔑</span>
          <div>
            <p className="text-xs text-warm-400">Home Key</p>
            <p className="font-serif text-warm-700">{key}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(key); alert('Copied') }}
            className="btn-ghost ml-auto text-xs"
          >
            Copy
          </button>
        </div>
      </div>
      <div className="rounded-xl bg-warm-50 p-4">
        <div className="flex items-center gap-3">
          <span className="text-lg">👥</span>
          <p className="text-warm-700">{people || 'You'}</p>
        </div>
      </div>
      <Link href="/home/rooms" className="btn-ghost w-full text-xs">
        🚪 Rooms
      </Link>
      <button
        onClick={() => { clearIdentity(); router.push('/') }}
        className="btn-ghost w-full text-xs text-warm-400 hover:text-red-500 hover:bg-red-50"
      >
        Leave Home
      </button>
    </div>
  )
}
