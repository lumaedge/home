'use client'

import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

export async function registerPasskey(homeId: string, personName: string) {
  const res = await fetch('/api/auth/register/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeId, personName }),
  })
  const options = await res.json()
  if (!res.ok) throw new Error(options.error)

  const credential = await startRegistration(options)

  const verifyRes = await fetch('/api/auth/register/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ homeId, personName, credential, challenge: options.challenge }),
  })
  const result = await verifyRes.json()
  if (!verifyRes.ok) throw new Error(result.error)

  localStorage.setItem('passkey_registered', 'true')
}

export async function loginWithPasskey(homeId?: string) {
  const body = homeId ? { homeId } : {}
  const res = await fetch('/api/auth/login/begin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const options = await res.json()
  if (!res.ok) throw new Error(options.error)

  const credential = await startAuthentication(options)

  const verifyRes = await fetch('/api/auth/login/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, challenge: options.challenge }),
  })
  const result = await verifyRes.json()
  if (!verifyRes.ok) throw new Error(result.error)

  localStorage.setItem('home_id', result.homeId)
  localStorage.setItem('person_name', result.personName)
  localStorage.setItem('auth_token', result.token)
  localStorage.setItem('passkey_registered', 'true')

  return result
}
