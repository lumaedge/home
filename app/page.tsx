'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { saveIdentity, loadIdentity } from '@/lib/identity'

type Step = 'start' | 'name' | 'action' | 'join' | 'key'

export default function LandingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('start')
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [createdKey, setCreatedKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { homeId } = loadIdentity()
    if (homeId) router.replace('/home')
  }, [router])

  async function handleCreate() {
    if (!name.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: name.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    setCreatedKey(data.inviteCode)
    saveIdentity(data.homeId, name.trim())
    setLoading(false)
  }

  async function handleJoin() {
    if (!name.trim() || !key.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'join', name: name.trim(), inviteCode: key.trim() }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setLoading(false); return }
    saveIdentity(data.homeId, name.trim())
    router.push('/home')
  }

  if (createdKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 text-4xl">🏡</div>
        <h1 className="mb-2 font-serif text-2xl text-warm-800">Your Home is ready</h1>
        <p className="mb-6 text-xs text-warm-500">
          Share this key to open your home to someone.
        </p>
        <div className="mx-auto mb-8 inline-block rounded-2xl bg-warm-100 px-8 py-4">
          <span className="font-serif text-xl tracking-wide text-warm-700">{createdKey}</span>
        </div>
        <button onClick={() => router.push('/home')} className="btn-primary w-full max-w-xs">
          Enter your Home
        </button>
      </div>
    )
  }

  if (step === 'start') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-sm text-center">
          <div className="mb-6 text-5xl">🏡</div>
          <h1 className="mb-2 font-serif text-3xl font-light text-warm-800">Home</h1>
          <p className="mb-8 text-xs text-warm-400 leading-relaxed">
            A quiet, shared space for two people<br />to grow closer over time.
          </p>
          <button onClick={() => setStep('name')} className="btn-primary w-full">
            Begin
          </button>
        </div>
        <footer className="mt-16 text-center text-xs text-warm-300">
          Whatever today looked like...<br />
          <span className="text-warm-400">You are welcome here.</span>
        </footer>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 text-3xl">🌿</div>
          <h1 className="mb-6 font-serif text-xl text-warm-800">Who are you?</h1>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="input mb-4 text-center"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep('action')}
          />
          <button
            onClick={() => name.trim() && setStep('action')}
            disabled={!name.trim()}
            className="btn-primary w-full disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  if (step === 'action') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-3 text-3xl">🏡</div>
          <p className="mb-2 font-serif text-lg text-warm-800">Hello, {name}.</p>
          <p className="mb-8 text-xs text-warm-400">What would you like to do?</p>
          <div className="space-y-3">
            <button onClick={handleCreate} disabled={loading} className="btn-primary w-full">
              Create a Home
            </button>
            <button onClick={() => setStep('join')} className="btn-ghost w-full">
              Come Home
            </button>
          </div>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6 text-3xl">🔑</div>
        <h1 className="mb-2 font-serif text-xl text-warm-800">Come Home</h1>
        <p className="mb-6 text-xs text-warm-400">Enter the key someone shared with you.</p>
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="e.g. gentle-river"
          className="input mb-4 text-center lowercase"
          autoFocus
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
        />
        <button onClick={handleJoin} disabled={loading || !key.trim()} className="btn-primary w-full disabled:opacity-40">
          {loading ? 'Opening the door...' : 'Enter'}
        </button>
        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
        <button onClick={() => setStep('action')} className="btn-ghost mt-4 text-xs">
          ← Back
        </button>
      </div>
    </div>
  )
}
