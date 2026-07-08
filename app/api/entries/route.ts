import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { matchRoom } from '@/lib/corners'

export async function GET(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  if (!homeId) return NextResponse.json({ error: 'no home id' }, { status: 400 })

  const entries = await prisma.entry.findMany({
    where: { homeId },
    include: { corners: { include: { corner: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  const personName = req.headers.get('x-person-name')
  if (!homeId || !personName) {
    return NextResponse.json({ error: 'home id and name required' }, { status: 400 })
  }

  const { content } = await req.json()
  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const matchedNames = matchRoom(content)

  const corners = matchedNames.length > 0
    ? await prisma.corner.findMany({ where: { homeId, name: { in: matchedNames } } })
    : []

  const entry = await prisma.entry.create({
    data: {
      content,
      authorName: personName,
      homeId,
      corners: corners.length > 0
        ? { create: corners.map((c) => ({ cornerId: c.id })) }
        : undefined,
    },
    include: { corners: { include: { corner: true } } },
  })

  return NextResponse.json(entry, { status: 201 })
}
