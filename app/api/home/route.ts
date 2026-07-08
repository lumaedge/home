import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { ROOMS } from '@/lib/corners'
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || '')

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'not authenticated' }, { status: 401 })

  const { action, name, inviteToken } = await req.json()
  const userId = session.user.id
  const userName = name || session.user.name || 'You'

  if (action === 'create') {
    const existing = await prisma.homeMember.findFirst({ where: { userId } })
    if (existing) return NextResponse.json({ error: 'already has a home' }, { status: 400 })

    // Check if this user matches an existing home's person1 (migration case)
    const unclaimed = await prisma.home.findFirst({
      where: {
        person1: userName,
        members: { none: { userId } },
      },
    })
    if (unclaimed) {
      await prisma.homeMember.create({
        data: { userId, homeId: unclaimed.id, role: 'owner', personName: userName },
      })
      await prisma.home.update({ where: { id: unclaimed.id }, data: { creatorId: userId } })
      // Link entries to this user
      await prisma.entry.updateMany({
        where: { homeId: unclaimed.id, authorName: userName, authorId: null },
        data: { authorId: userId },
      })
      const inviteToken = await new SignJWT({ homeId: unclaimed.id, inviter: userName })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('365d')
        .sign(secret)
      return NextResponse.json({ homeId: unclaimed.id, name: userName, inviteToken })
    }

    let home: any
    let code: string
    for (let attempt = 0; attempt < 5; attempt++) {
      code = makeInviteCode()
      try {
        home = await prisma.home.create({
          data: {
            inviteCode: code,
            person1: userName,
            creatorId: userId,
          },
        })
        break
      } catch (err: any) {
        if (err.code !== 'P2002' || attempt === 4) throw err
      }
    }

    await prisma.homeMember.create({
      data: { userId, homeId: home.id, role: 'owner', personName: userName },
    })

    await prisma.corner.createMany({
      data: ROOMS.map((r) => ({ icon: r.icon, name: r.name, homeId: home.id })),
    })

    const inviteToken = await new SignJWT({ homeId: home.id, inviter: userName })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('365d')
      .sign(secret)

    return NextResponse.json({ homeId: home.id, name: userName, inviteToken })
  }

  if (action === 'join') {
    if (!inviteToken) return NextResponse.json({ error: 'invite token required' }, { status: 400 })
    try {
      const { payload } = await jwtVerify(inviteToken, secret, { algorithms: ['HS256'] })
      const homeId = payload.homeId as string
      const home = await prisma.home.findUnique({ where: { id: homeId } })
      if (!home) return NextResponse.json({ error: 'invalid invitation' }, { status: 404 })

      const existing = await prisma.homeMember.findFirst({ where: { homeId, userId } })
      if (existing) return NextResponse.json({ homeId, name: home.person1 })

      const members = await prisma.homeMember.count({ where: { homeId } })
      if (members >= 2) return NextResponse.json({ error: 'home is full' }, { status: 400 })

      await prisma.homeMember.create({
        data: { userId, homeId, role: 'member', personName: userName },
      })

      if (!home.person2) {
        await prisma.home.update({ where: { id: homeId }, data: { person2: userName } })
      }

      return NextResponse.json({ homeId, name: home.person1 })
    } catch {
      return NextResponse.json({ error: 'invalid invitation' }, { status: 400 })
    }
  }

  return NextResponse.json({ error: 'invalid action' }, { status: 400 })
}

function makeInviteCode() {
  const words = ['gentle', 'quiet', 'warm', 'calm', 'still', 'soft', 'slow', 'deep']
  const animals = ['river', 'moon', 'pine', 'stone', 'cloud', 'wind', 'rain', 'dove']
  return `${words[Math.floor(Math.random() * words.length)]}-${animals[Math.floor(Math.random() * animals.length)]}`
}
