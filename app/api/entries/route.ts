import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { matchRoom } from '@/lib/corners'

async function getHomeId(session: any): Promise<string | null> {
  if (!session?.user?.id) return null
  const member = await prisma.homeMember.findFirst({ where: { userId: session.user.id } })
  return member?.homeId ?? null
}

export async function GET() {
  const session = await auth()
  const homeId = await getHomeId(session)
  if (!homeId) return NextResponse.json({ error: 'no home' }, { status: 400 })

  const entries = await prisma.entry.findMany({
    where: { homeId, deletedAt: null },
    include: { corners: { include: { corner: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  const homeId = await getHomeId(session)
  if (!homeId) return NextResponse.json({ error: 'no home' }, { status: 400 })

  const member = await prisma.homeMember.findFirst({ where: { userId: session!.user.id, homeId } })
  const personName = member?.personName || session?.user?.name || 'Someone'

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
      authorId: session!.user.id,
      homeId,
      corners: corners.length > 0
        ? { create: corners.map((c) => ({ cornerId: c.id })) }
        : undefined,
    },
    include: { corners: { include: { corner: true } } },
  })

  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  const homeId = await getHomeId(session)
  if (!homeId) return NextResponse.json({ error: 'no home' }, { status: 400 })

  const { entryId } = await req.json()
  if (!entryId) return NextResponse.json({ error: 'entryId required' }, { status: 400 })

  const result = await prisma.entry.updateMany({
    where: { id: entryId, homeId },
    data: { deletedAt: new Date() },
  })

  if (result.count === 0) return NextResponse.json({ error: 'entry not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
