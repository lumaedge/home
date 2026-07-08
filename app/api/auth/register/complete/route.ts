import { NextRequest, NextResponse } from 'next/server'
import { completeRegistration } from '@/lib/webauthn-server'

export async function POST(req: NextRequest) {
  try {
    const { homeId, personName, credential, challenge } = await req.json()
    if (!homeId || !personName || !credential || !challenge) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    await completeRegistration(homeId, personName, credential, challenge)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'registration failed' }, { status: 500 })
  }
}
