import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'no auth' }, { status: 401 })

  const member = await prisma.homeMember.findFirst({ where: { userId: session.user.id } })
  if (!member) return NextResponse.json({ error: 'no home' }, { status: 400 })

  const corners = await prisma.corner.findMany({
    where: { homeId: member.homeId },
    include: {
      _count: { select: { entries: true } },
      entries: { select: { entryId: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(corners)
}
