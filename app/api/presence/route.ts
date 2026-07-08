import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  const personName = req.headers.get('x-person-name')
  if (!homeId || !personName) {
    return NextResponse.json({ error: 'home id and name required' }, { status: 400 })
  }

  const home = await prisma.home.findUnique({ where: { id: homeId } })
  if (!home) return NextResponse.json({ error: 'home not found' }, { status: 404 })

  const isPerson1 = home.person1 === personName
  if (isPerson1) {
    await prisma.home.update({ where: { id: homeId }, data: { person1SeenAt: new Date() } })
  } else if (home.person2 === personName) {
    await prisma.home.update({ where: { id: homeId }, data: { person2SeenAt: new Date() } })
  }

  return NextResponse.json({ ok: true })
}

export async function GET(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  const personName = req.headers.get('x-person-name')
  if (!homeId || !personName) {
    return NextResponse.json({ error: 'home id and name required' }, { status: 400 })
  }

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: { person1: true, person2: true, person1SeenAt: true, person2SeenAt: true },
  })
  if (!home) return NextResponse.json({ error: 'home not found' }, { status: 404 })

  const now = Date.now()
  const THIRTY_SEC = 30000

  const p1Present = home.person1SeenAt && (now - home.person1SeenAt.getTime()) < THIRTY_SEC
  const p2Present = home.person2SeenAt && (now - home.person2SeenAt.getTime()) < THIRTY_SEC

  const isP1 = home.person1 === personName
  const partnerPresent = isP1 ? p2Present : p1Present
  const partnerName = isP1 ? home.person2 : home.person1

  return NextResponse.json({
    present: partnerPresent,
    partnerName,
    you: personName,
  })
}
