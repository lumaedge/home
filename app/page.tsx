'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HOME_CONFIG } from '@/lib/home-config'
import { isFirstVisit, identifyFromUrl, loadIdentity } from '@/lib/identity'
import { registerPasskey } from '@/lib/auth-client'
import WelcomeTour from '@/components/WelcomeTour'
import PasskeyGate from '@/components/PasskeyGate'

type PageStep = 'loading' | 'gate' | 'first' | 'register' | 'home'

export default function LandingPage() {
  const router = useRouter()
  const [step, setStep] = useState<PageStep>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!HOME_CONFIG.personalMode) {
      setStep('first')
      return
    }

    const hasPasskey = localStorage.getItem('passkey_registered') === 'true'
    const hasIdentity = !!loadIdentity().name

    if (hasPasskey && hasIdentity) {
      setStep('gate')
    } else if (hasPasskey && !hasIdentity) {
      setStep('gate')
    } else if (!isFirstVisit()) {
      router.replace('/home')
    } else {
      setStep('first')
    }
  }, [router])

  async function handleRegister() {
    setError('')
    try {
      const { homeId, name } = loadIdentity()
      if (!homeId || !name) return
      await registerPasskey(homeId, name)
      router.replace('/home')
    } catch {
      setError('Passkey registration failed. You can try again later.')
      router.replace('/home')
    }
  }

  if (step === 'loading') return null

  if (step === 'gate') {
    return (
      <PasskeyGate
        onAuthed={() => router.replace('/home')}
        onSkip={() => router.replace('/home')}
      />
    )
  }

  if (step === 'first') {
    return (
      <WelcomeTour
        onDone={() => {
          identifyFromUrl()
          const hasPasskey = localStorage.getItem('passkey_registered') === 'true'
          if (hasPasskey) {
            router.replace('/home')
          } else {
            setStep('register')
          }
        }}
      />
    )
  }

  if (step === 'register') {
    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50 px-8">
        <div className="max-w-sm text-center">
          <div className="mb-4 text-4xl">🔐</div>
          <h1 className="mb-2 font-serif text-xl text-warm-700">Secure your home</h1>
          <p className="mb-8 text-sm italic text-warm-400">A passkey means only you two can enter. It lives on your device and follows you to new phones.</p>
          <button onClick={handleRegister} className="btn-primary">
            Set up passkey
          </button>
          <button onClick={() => router.replace('/home')} className="btn-ghost mt-4 block w-full text-xs text-warm-300">
            Skip for now
          </button>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  return null
}
