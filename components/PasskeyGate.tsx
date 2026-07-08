'use client'

import { useState } from 'react'
import { loginWithPasskey } from '@/lib/auth-client'
import { loadIdentity } from '@/lib/identity'

export default function PasskeyGate({ onAuthed, onSkip }: { onAuthed: () => void; onSkip?: () => void }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleLogin(hasIdentity: boolean) {
    setBusy(true)
    setError('')
    try {
      const { homeId } = loadIdentity()
      await loginWithPasskey(hasIdentity && homeId ? homeId : undefined)
      onAuthed()
    } catch (e: any) {
      if (e.name === 'NotAllowedError') {
        setError('')
      } else {
        setError('Could not verify. Try again.')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-warm-50">
      <div className="text-center max-w-sm px-6">
        <div className="mb-4 text-4xl">🔐</div>
        <h1 className="mb-2 font-serif text-xl text-warm-700">Unlock your Home</h1>
        <p className="mb-8 text-sm italic text-warm-400">Your passkey is the only key you need.</p>
        <button
          onClick={() => handleLogin(true)}
          disabled={busy}
          className="btn-primary disabled:opacity-40"
        >
          {busy ? '...' : 'Unlock'}
        </button>
        {error && <p className="mt-4 text-xs text-red-500">{error}</p>}
        {onSkip && (
          <button onClick={onSkip} className="btn-ghost mt-6 block w-full text-xs text-warm-300">
            Try another way
          </button>
        )}
      </div>
    </div>
  )
}
