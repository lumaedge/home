import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { beginRegistration } from '@/lib/webauthn-server'

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })
  try {
    const options = await beginRegistration(session.user.id)
    return NextResponse.json(options)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
