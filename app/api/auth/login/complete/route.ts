import { NextRequest, NextResponse } from 'next/server'
import { completeLogin } from '@/lib/webauthn-server'
import { SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'home-dev-secret-change-in-production')

export async function POST(req: NextRequest) {
  try {
    const { credential, challenge } = await req.json()
    if (!credential || !challenge) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    const { homeId, personName } = await completeLogin(credential, challenge)

    const token = await new SignJWT({ homeId, personName })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('90d')
      .sign(secret)

    return NextResponse.json({ token, homeId, personName })
  } catch {
    return NextResponse.json({ error: 'login failed' }, { status: 500 })
  }
}
