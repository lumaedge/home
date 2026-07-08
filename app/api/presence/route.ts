import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

async function getMember(session: any) {
  if (!session?.user?.id) return null
  return await prisma.homeMember.findFirst({ where: { userId: session.user.id } })
}

export async function POST() {
  const session = await auth()
  const member = await getMember(session)
  if (!member) return NextResponse.json({ error: 'no home' }, { status: 400 })

  await prisma.homeMember.update({
    where: { id: member.id },
    data: { seenAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await auth()
  const member = await getMember(session)
  if (!member) return NextResponse.json({ error: 'no home' }, { status: 400 })

  const allMembers = await prisma.homeMember.findMany({
    where: { homeId: member.homeId },
  })

  const now = Date.now()
  const THIRTY_SEC = 30000

  const partner = allMembers.find((m) => m.id !== member.id)
  const present = partner ? (partner.seenAt && (now - partner.seenAt.getTime()) < THIRTY_SEC) : false

  return NextResponse.json({
    present,
    partnerName: partner?.personName || null,
  })
}
