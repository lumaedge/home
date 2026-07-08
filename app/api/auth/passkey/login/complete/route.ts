import { NextRequest, NextResponse } from 'next/server'
import { completeLogin } from '@/lib/webauthn-server'
import { createOneTimeToken } from '@/auth'

export async function POST(req: NextRequest) {
  try {
    const { credential, challenge } = await req.json()
    if (!credential || !challenge) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    const { userId } = await completeLogin(credential, challenge)
    const token = await createOneTimeToken(userId)
    return NextResponse.json({ token, url: '/home' })
  } catch {
    return NextResponse.json({ error: 'login failed' }, { status: 500 })
  }
}
