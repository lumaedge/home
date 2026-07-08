'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

type Step = 'loading' | 'welcome' | 'name' | 'credentials' | 'setup' | 'ready'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [step, setStep] = useState<Step>('loading')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      fetch('/api/home/mine').then(r => r.json()).then(data => {
        if (data.home) router.replace('/home')
        else setStep('setup')
      })
      return
    }

    const saved = localStorage.getItem('home_name')
    if (saved) setName(saved)
    setStep('welcome')
  }, [status, router])

  useEffect(() => {
    if (step !== 'setup' || !session?.user?.id) return
    const homeName = localStorage.getItem('home_name') || session.user.name || 'Home'
    fetch('/api/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: homeName }),
    }).then(r => r.json()).then(data => {
      if (data.homeId) { localStorage.removeItem('home_name'); setStep('ready') }
      else { setError('Could not create your home.'); setStep('welcome') }
    }).catch(() => { setError('Something went wrong.'); setStep('welcome') })
  }, [step, session])

  async function handleCreateAccount() {
    if (!name.trim() || !email.trim() || !password.trim()) return
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password, name: name.trim() }),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.error) }
      localStorage.setItem('home_name', name.trim())
      await signIn('credentials', { email: email.trim(), password, callbackUrl: '/' })
    } catch (e: any) {
      setError(e.message)
    } finally { setBusy(false) }
  }

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) return
    setBusy(true); setError('')
    const result = await signIn('credentials', { email: email.trim(), password, callbackUrl: '/', redirect: false })
    if (result?.error) setError('Invalid email or password.')
    setBusy(false)
  }

  if (step === 'loading') return <div className="fixed inset-0 flex items-center justify-center bg-warm-50"><p className="text-xs text-warm-300">...</p></div>

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <div className="mb-4 text-5xl">🏡</div>
          <h1 className="mb-2 font-serif text-3xl text-warm-800">Home</h1>
          <p className="mb-10 text-sm italic text-warm-400">A quiet place for two.</p>
          <button onClick={() => setStep('name')} className="btn-primary mb-3 w-full">
            Create Your Home
          </button>
          <button onClick={() => {
            localStorage.removeItem('home_name')
            setStep('credentials')
          }} className="btn-ghost w-full text-sm">
            Come back
          </button>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
        </div>
      </div>
    )
  }

  if (step === 'name') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <h2 className="mb-6 font-serif text-xl text-warm-700">What should we call you?</h2>
          <input autoFocus value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { localStorage.setItem('home_name', name.trim()); setStep('credentials') } }}
            placeholder="Your name"
            className="mb-6 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-center text-warm-700 outline-none focus:border-warm-400"
          />
          <button onClick={() => { localStorage.setItem('home_name', name.trim()); setStep('credentials') }}
            disabled={!name.trim()} className="btn-primary mb-3 w-full disabled:opacity-40">Continue</button>
          <button onClick={() => setStep('welcome')} className="btn-ghost w-full text-xs">Back</button>
        </div>
      </div>
    )
  }

  if (step === 'credentials') {
    const isSignUp = !!localStorage.getItem('home_name')
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <h2 className="mb-6 font-serif text-xl text-warm-700">{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
          <div className="space-y-4">
            <input autoFocus={!isSignUp} value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email" type="email"
              className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-center text-warm-700 outline-none focus:border-warm-400"
            />
            <input value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') isSignUp ? handleCreateAccount() : handleSignIn() }}
              placeholder="Password" type="password"
              className="w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-center text-warm-700 outline-none focus:border-warm-400"
            />
            <button onClick={isSignUp ? handleCreateAccount : handleSignIn}
              disabled={busy || !email.trim() || !password.trim()}
              className="btn-primary w-full disabled:opacity-40">
              {busy ? '...' : (isSignUp ? 'Create account & enter' : 'Sign in')}
            </button>
          </div>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
          <button onClick={() => setStep('name')} className="btn-ghost mt-4 w-full text-xs">Back</button>
          {!isSignUp && (
            <button onClick={() => { localStorage.setItem('home_name', 'temp'); setStep('name') }}
              className="btn-ghost mt-2 w-full text-xs text-warm-400">Don't have an account?</button>
          )}
        </div>
      </div>
    )
  }

  if (step === 'setup') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <div className="mb-4 text-4xl">🔨</div>
          <h2 className="mb-2 font-serif text-xl text-warm-700">Setting up your home...</h2>
          <p className="text-sm italic text-warm-400">Just a moment.</p>
        </div>
      </div>
    )
  }

  if (step === 'ready') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <div className="mb-4 text-4xl">🏡</div>
          <h2 className="mb-2 font-serif text-xl text-warm-700">Your home is ready.</h2>
          <p className="mb-8 text-sm italic text-warm-400">Come in.</p>
          <button onClick={() => router.push('/home')} className="btn-primary w-full">Enter</button>
        </div>
      </div>
    )
  }

  return null
}
