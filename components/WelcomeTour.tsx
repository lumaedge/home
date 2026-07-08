'use client'

import { useState, useEffect, useCallback } from 'react'
import { HOME_CONFIG, PersonConfig } from '@/lib/home-config'
import { ROOMS } from '@/lib/corners'
import { setPerson } from '@/lib/identity'

type Step = 'greeting' | 'choose' | 'tour' | 'note' | 'done'

export default function WelcomeTour({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState<Step>('greeting')
  const [tourIdx, setTourIdx] = useState(0)
  const [chosen, setChosen] = useState<PersonConfig | null>(null)
  const [showContent, setShowContent] = useState(false)
  const [fading, setFading] = useState(false)

  const advance = useCallback(() => {
    setFading(true)
    setTimeout(() => {
      if (tourIdx < ROOMS.length - 1) {
        setTourIdx((i) => i + 1)
        setFading(false)
      } else {
        setStep('note')
        setFading(false)
      }
    }, 600)
  }, [tourIdx])

  useEffect(() => {
    if (step === 'greeting') {
      const t1 = setTimeout(() => setShowContent(true), 800)
      const t2 = setTimeout(() => {
        setFading(true)
        setTimeout(() => { setStep('choose'); setFading(false) }, 600)
      }, 3000)
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
  }, [step])

  if (step === 'greeting') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50">
        <div className={`text-center transition-all duration-1000 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-4 text-5xl">🏡</div>
          <h1 className="font-serif text-3xl text-warm-800">Welcome Home.</h1>
        </div>
      </div>
    )
  }

  if (step === 'choose') {
    return (
      <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-warm-50 px-6">
        <div className={`text-center transition-all duration-700 ${fading ? 'opacity-0 translate-y-2' : 'opacity-100'}`}>
          <p className="mb-10 font-serif text-lg text-warm-400 italic">Find your place.</p>
          <div className="flex justify-center gap-10">
            {[HOME_CONFIG.person1, HOME_CONFIG.person2].map((person) => (
              <button
                key={person.name}
                onClick={() => {
                  setChosen(person)
                  setFading(true)
                  setTimeout(() => { setStep('tour'); setFading(false) }, 600)
                }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95"
              >
                {person.emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'tour') {
    const room = ROOMS[tourIdx]
    const lines = room.description.split('\n')
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50 px-8">
        <div
          className={`max-w-sm text-center transition-all duration-700 ${fading ? 'opacity-0 translate-y-4' : 'opacity-100'}`}
        >
          <div className="mb-4 text-4xl">{room.icon}</div>
          <h2 className="mb-4 font-serif text-xl text-warm-700">{room.name}</h2>
          <div className="space-y-1">
            {lines.map((line, i) => (
              <p
                key={i}
                className="text-sm italic leading-relaxed text-warm-400"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                {line}
              </p>
            ))}
          </div>
          <button
            onClick={advance}
            className="btn-ghost mt-10 text-xs text-warm-300"
          >
            {tourIdx < ROOMS.length - 1 ? 'Next room →' : 'One more thing →'}
          </button>
        </div>
      </div>
    )
  }

  if (step === 'note') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50 px-8">
        <div className={`max-w-sm text-center transition-all duration-1000 ${fading ? 'opacity-0' : 'opacity-100'}`}>
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
            onClick={() => {
              if (chosen) setPerson(chosen)
              onDone()
            }}
            className="btn-primary mt-10"
          >
            Come in
          </button>
        </div>
      </div>
    )
  }

  return null
}
