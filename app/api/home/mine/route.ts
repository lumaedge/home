import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ home: null })

  const member = await prisma.homeMember.findFirst({
    where: { userId: session.user.id },
    include: { home: true },
  })

  return NextResponse.json({ home: member ? { id: member.home.id, name: member.home.name, createdAt: member.home.createdAt } : null })
}
