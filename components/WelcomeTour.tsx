'use client'

import { useEffect, useState } from 'react'
import { HOME_CONFIG } from '@/lib/home-config'

export default function WelcomeTour({ onDone }: { onDone: () => void }) {
  const [showNote, setShowNote] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowNote(true), 2500)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50 px-8">
      <div className={`text-center transition-all duration-1000 ${showNote ? 'opacity-0' : 'opacity-100'}`}>
        <div className="mb-4 text-5xl">🏡</div>
        <h1 className="font-serif text-3xl text-warm-800">Welcome Home.</h1>
      </div>

      <div className={`max-w-sm text-center transition-all duration-1000 delay-300 ${showNote ? 'opacity-100' : 'opacity-0'}`}>
        <div className="mb-6 text-4xl">💌</div>
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="font-serif text-base leading-relaxed text-warm-800">
            &ldquo;{HOME_CONFIG.welcomeNote}&rdquo;
          </p>
        </div>
        <p className="mt-6 text-xs text-warm-300 italic">
          The first note in our home.
        </p>
        <button
          onClick={onDone}
          className="btn-primary mt-10"
        >
          Come in
        </button>
      </div>
    </div>
  )
}
