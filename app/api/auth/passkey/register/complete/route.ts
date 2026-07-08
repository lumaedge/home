import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { completeRegistration } from '@/lib/webauthn-server'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  try {
    const { credential, challenge } = await req.json()
    if (!credential || !challenge) return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    await completeRegistration(session.user.id, credential, challenge)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
