'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { startAuthentication } from '@simplewebauthn/browser'

type Step = 'loading' | 'welcome' | 'name' | 'auth' | 'invite' | 'setup' | 'ready'

function getParam(key: string) {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get(key)
}

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const token = getParam('token')

  const [step, setStep] = useState<Step>('loading')
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated') {
      fetch('/api/home/mine').then(r => r.json()).then(data => {
        if (data.home) {
          router.replace('/home')
        } else if (token) {
          fetch('/api/home', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'join', inviteToken: token }),
          }).then(r => r.json()).then(j => {
            if (j.homeId) router.replace('/home')
            else { setError('This invitation could not be used.'); setStep('welcome') }
          })
        } else {
          setStep('setup')
        }
      })
      return
    }

    if (token) {
      setStep('invite')
      return
    }

    const saved = localStorage.getItem('home_name')
    if (saved) setName(saved)
    setStep('welcome')
  }, [status, router, token])

  // When in setup step, create the home
  useEffect(() => {
    if (step !== 'setup' || !session?.user?.id) return

    const homeName = localStorage.getItem('home_name') || session.user.name || 'Home'

    fetch('/api/home', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name: homeName }),
    }).then(r => r.json()).then(data => {
      if (data.homeId) {
        localStorage.removeItem('home_name')
        setStep('ready')
      } else {
        setError('Could not create your home.')
        setStep('welcome')
      }
    }).catch(() => {
      setError('Something went wrong.')
      setStep('welcome')
    })
  }, [step, session])

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
          <button onClick={() => signIn(undefined, { callbackUrl: '/' })} className="btn-ghost w-full text-sm">
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
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { localStorage.setItem('home_name', name.trim()); setStep('auth') } }}
            placeholder="Your name"
            className="mb-6 w-full rounded-xl border border-warm-200 bg-white px-4 py-3 text-center text-warm-700 outline-none focus:border-warm-400"
          />
          <button onClick={() => { localStorage.setItem('home_name', name.trim()); setStep('auth') }} disabled={!name.trim()} className="btn-primary mb-3 w-full disabled:opacity-40">
            Continue
          </button>
          <button onClick={() => setStep('welcome')} className="btn-ghost w-full text-xs">Back</button>
        </div>
      </div>
    )
  }

  if (step === 'auth') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <h2 className="mb-6 font-serif text-xl text-warm-700">How should we sign you in?</h2>
          <div className="space-y-3">
            <button onClick={async () => {
              try {
                const res = await fetch('/api/auth/passkey/login/begin', { method: 'POST' })
                if (!res.ok) { setError('Passkey login not available'); return }
                const options = await res.json()
                const credential = await startAuthentication(options)
                const verify = await fetch('/api/auth/passkey/login/complete', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential, challenge: options.challenge }),
                })
                const result = await verify.json()
                if (!verify.ok) throw new Error(result.error)
                await signIn('passkey', { token: result.token, callbackUrl: '/' })
              } catch (e: any) {
                if (e.name !== 'NotAllowedError') setError('Could not sign in with passkey.')
              }
            }} className="btn-primary w-full">
              Use Face ID / Passkey
            </button>
            {process.env.NEXT_PUBLIC_AUTH_GOOGLE && (
              <button onClick={() => signIn('google', { callbackUrl: '/' })} className="btn-secondary w-full">
                Sign in with Google
              </button>
            )}
            {process.env.NEXT_PUBLIC_AUTH_APPLE && (
              <button onClick={() => signIn('apple', { callbackUrl: '/' })} className="btn-secondary w-full">
                Sign in with Apple
              </button>
            )}
            {process.env.NEXT_PUBLIC_AUTH_EMAIL === 'true' && (
              <button onClick={() => { const email = prompt('Enter your email:'); if (email) signIn('email', { email, callbackUrl: '/' }) }} className="btn-secondary w-full">
                Email a magic link
              </button>
            )}
          </div>
          {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
          <button onClick={() => setStep('name')} className="btn-ghost mt-4 w-full text-xs">Back</button>
        </div>
      </div>
    )
  }

  if (step === 'invite') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-warm-50">
        <div className="max-w-sm px-6 text-center">
          <div className="mb-4 text-4xl">🕯️</div>
          <p className="mb-2 font-serif text-lg text-warm-700">You have been invited home.</p>
          <p className="mb-2 text-sm italic text-warm-400">Would you like to come in?</p>
          <p className="mb-8 text-xs text-warm-300">Sign in to accept your invitation.</p>
          <div className="space-y-3">
            {process.env.NEXT_PUBLIC_AUTH_GOOGLE && (
              <button onClick={() => signIn('google', { callbackUrl: '/?token=' + token })} className="btn-primary w-full">
                Sign in with Google
              </button>
            )}
            {process.env.NEXT_PUBLIC_AUTH_APPLE && (
              <button onClick={() => signIn('apple', { callbackUrl: '/?token=' + token })} className="btn-primary w-full">
                Sign in with Apple
              </button>
            )}
            {process.env.NEXT_PUBLIC_AUTH_EMAIL === 'true' && (
              <button onClick={() => { const email = prompt('Enter your email:'); if (email) signIn('email', { email, callbackUrl: '/?token=' + token }) }} className="btn-primary w-full">
                Email a magic link
              </button>
            )}
            <button onClick={async () => {
              try {
                const res = await fetch('/api/auth/passkey/login/begin', { method: 'POST' })
                if (!res.ok) return
                const options = await res.json()
                const credential = await startAuthentication(options)
                const verify = await fetch('/api/auth/passkey/login/complete', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ credential, challenge: options.challenge }),
                })
                const result = await verify.json()
                if (!verify.ok) throw new Error(result.error)
                await signIn('passkey', { token: result.token, callbackUrl: '/?token=' + token })
              } catch (e: any) { if (e.name !== 'NotAllowedError') setError('Could not sign in.') }
            }} className="btn-primary w-full">
              Use Face ID / Passkey
            </button>
          </div>
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
          <button onClick={() => router.push('/home')} className="btn-primary w-full">
            Enter
          </button>
        </div>
      </div>
    )
  }

  return null
}
