import { NextResponse } from 'next/server'
import { beginLogin } from '@/lib/webauthn-server'

export async function POST() {
  try {
    const options = await beginLogin()
    return NextResponse.json(options)
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
