import { NextRequest, NextResponse } from 'next/server'
import { beginRegistration } from '@/lib/webauthn-server'

export async function POST(req: NextRequest) {
  try {
    const { homeId, personName } = await req.json()
    if (!homeId || !personName) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    const options = await beginRegistration(homeId, personName)
    return NextResponse.json(options)
  } catch {
    return NextResponse.json({ error: 'failed to begin registration' }, { status: 500 })
  }
}
