import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}

export async function getUserHome(userId: string) {
  const member = await prisma.homeMember.findFirst({
    where: { userId },
    include: { home: true },
  })
  return member?.home ?? null
}
