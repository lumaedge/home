import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateHomeKey, normalizeKey } from '@/lib/home-key'
import { ROOMS } from '@/lib/corners'

export async function GET(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  if (!homeId) return NextResponse.json({ error: 'no home id' }, { status: 400 })

  const home = await prisma.home.findUnique({
    where: { id: homeId },
    select: { id: true, name: true, person1: true, person2: true, inviteCode: true, createdAt: true },
  })
  if (!home) return NextResponse.json({ error: 'home not found' }, { status: 404 })

  return NextResponse.json(home)
}

export async function POST(req: NextRequest) {
  const { action, name, inviteCode } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  if (action === 'create') {
    const code = generateHomeKey()
    const home = await prisma.home.create({
      data: { inviteCode: code, person1: name },
    })

    await prisma.corner.createMany({
      data: ROOMS.map((c) => ({ icon: c.icon, name: c.name, homeId: home.id })),
    })

    return NextResponse.json({ homeId: home.id, inviteCode: code, name: home.person1 })
  }

  if (action === 'join') {
    if (!inviteCode) return NextResponse.json({ error: 'key required' }, { status: 400 })

    const home = await prisma.home.findUnique({
      where: { inviteCode: normalizeKey(inviteCode) },
    })
    if (!home) return NextResponse.json({ error: 'no home found with that key' }, { status: 404 })
    if (home.person2) return NextResponse.json({ error: 'this home is already full' }, { status: 400 })

    await prisma.home.update({
      where: { id: home.id },
      data: { person2: name },
    })

    return NextResponse.json({ homeId: home.id, name, person1: home.person1 })
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}
