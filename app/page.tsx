'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { HOME_CONFIG } from '@/lib/home-config'
import { isFirstVisit, identifyFromUrl } from '@/lib/identity'
import WelcomeTour from '@/components/WelcomeTour'

export default function LandingPage() {
  const router = useRouter()
  const [showTour, setShowTour] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!HOME_CONFIG.personalMode) {
      setChecking(false)
      return
    }
    if (!isFirstVisit()) {
      router.replace('/home')
      return
    }
    identifyFromUrl()
    setShowTour(true)
    setChecking(false)
  }, [router])

  if (HOME_CONFIG.personalMode) {
    if (checking) return null
    if (showTour) {
      return <WelcomeTour onDone={() => router.replace('/home')} />
    }
    return null
  }

  const [name, setName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<'begin' | 'name' | 'action' | 'create' | 'join' | 'created'>('begin')
  const [createdKey, setCreatedKey] = useState('')

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'something went wrong'); return }
      localStorage.setItem('home_id', data.homeId)
      localStorage.setItem('person_name', name)
      setCreatedKey(data.inviteCode)
      setStep('created')
    } catch { setError('could not reach home') } finally { setCreating(false) }
  }

  async function handleJoin() {
    setJoining(true)
    setError('')
    try {
      const res = await fetch('/api/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', name, inviteCode }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'something went wrong'); return }
      localStorage.setItem('home_id', data.homeId)
      localStorage.setItem('person_name', name)
      router.push('/home')
    } catch { setError('could not reach home') } finally { setJoining(false) }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      {step === 'begin' && (
        <div className="fade-in space-y-4">
          <div className="text-4xl">🏡</div>
          <h1 className="font-serif text-2xl text-warm-800">Home</h1>
          <p className="text-sm italic text-warm-400">A quiet, shared space for two people to grow closer over time.</p>
          <button onClick={() => setStep('name')} className="btn-primary mt-4">Begin</button>
        </div>
      )}

      {step === 'name' && (
        <div className="fade-in space-y-4">
          <div className="text-3xl">🌿</div>
          <p className="font-serif text-warm-600">Who are you?</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="input text-center" autoFocus />
          <button onClick={() => name.trim() && setStep('action')} disabled={!name.trim()} className="btn-primary disabled:opacity-40">Next</button>
        </div>
      )}

      {step === 'action' && (
        <div className="fade-in space-y-4">
          <p className="font-serif text-warm-600">Hello, {name}. What would you like to do?</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setStep('create')} className="btn-primary">Create a Home</button>
            <button onClick={() => setStep('join')} className="btn-ghost">Come Home</button>
          </div>
        </div>
      )}

      {step === 'create' && (
        <div className="fade-in space-y-4">
          <button onClick={() => setStep('action')} className="btn-ghost text-xs">← Back</button>
          <p className="font-serif text-warm-600">Creating your home...</p>
          <button onClick={handleCreate} disabled={creating} className="btn-primary disabled:opacity-40">
            {creating ? 'Building...' : 'Build it'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {step === 'join' && (
        <div className="fade-in space-y-4">
          <button onClick={() => setStep('action')} className="btn-ghost text-xs">← Back</button>
          <div className="text-2xl">🔑</div>
          <p className="font-serif text-warm-600">Enter the key someone shared with you.</p>
          <input value={inviteCode} onChange={(e) => setInviteCode(e.target.value.toLowerCase())} placeholder="e.g. gentle-river" className="input text-center" autoFocus />
          <button onClick={handleJoin} disabled={!inviteCode.trim() || joining} className="btn-primary disabled:opacity-40">
            {joining ? 'Opening the door...' : 'Enter'}
          </button>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      )}

      {step === 'created' && (
        <div className="fade-in space-y-4">
          <div className="text-3xl">🏡</div>
          <p className="font-serif text-warm-600">Your home is ready.</p>
          <p className="text-sm text-warm-400">Share this key with someone you trust.</p>
          <div className="rounded-xl bg-warm-50 p-4">
            <p className="font-mono text-lg text-warm-700">{createdKey}</p>
          </div>
          <button onClick={() => router.push('/home')} className="btn-primary">Enter your Home</button>
        </div>
      )}
    </div>
  )
}
