import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const homeId = req.headers.get('x-home-id')
  if (!homeId) return NextResponse.json({ error: 'no home id' }, { status: 400 })

  const corners = await prisma.corner.findMany({
    where: { homeId },
    include: {
      _count: { select: { entries: true } },
      entries: { select: { entryId: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  return NextResponse.json(corners)
}
