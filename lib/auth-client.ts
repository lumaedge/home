'use client'

import { startRegistration, startAuthentication } from '@simplewebauthn/browser'
import { signIn } from 'next-auth/react'

export async function registerPasskey() {
  const res = await fetch('/api/auth/passkey/register/begin', { method: 'POST' })
  const options = await res.json()
  if (!res.ok) throw new Error(options.error)

  const credential = await startRegistration(options)

  const verifyRes = await fetch('/api/auth/passkey/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, challenge: options.challenge }),
  })
  const result = await verifyRes.json()
  if (!verifyRes.ok) throw new Error(result.error)
}

export async function loginWithPasskey() {
  const res = await fetch('/api/auth/passkey/login/begin', { method: 'POST' })
  const options = await res.json()
  if (!res.ok) throw new Error(options.error)

  const credential = await startAuthentication(options)

  const verifyRes = await fetch('/api/auth/passkey/login/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, challenge: options.challenge }),
  })
  const result = await verifyRes.json()
  if (!verifyRes.ok) throw new Error(result.error)

  await signIn('passkey', { token: result.token, callbackUrl: result.url })
}
