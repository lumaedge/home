'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Nav from '@/components/Nav'

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [hasHome, setHasHome] = useState<boolean | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') {
      router.replace('/')
      return
    }
    fetch('/api/home/mine').then(r => r.json()).then(data => {
      if (!data.home) {
        router.replace('/')
      } else {
        setHasHome(true)
      }
    })
  }, [status, router])

  if (status !== 'authenticated' || !hasHome) return <div className="mx-auto max-w-lg min-h-screen px-4 pt-20 text-center text-xs text-warm-300">...</div>

  return (
    <div className="mx-auto min-h-screen max-w-lg px-4 pb-32 pt-8">
      {children}
      <Nav />
    </div>
  )
}
