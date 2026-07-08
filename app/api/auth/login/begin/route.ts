import { NextRequest, NextResponse } from 'next/server'
import { beginLogin } from '@/lib/webauthn-server'

export async function POST(req: NextRequest) {
  try {
    const { homeId } = await req.json()
    if (!homeId) return NextResponse.json({ error: 'homeId required' }, { status: 400 })
    const options = await beginLogin(homeId)
    return NextResponse.json(options)
  } catch {
    return NextResponse.json({ error: 'failed to begin login' }, { status: 500 })
  }
}
