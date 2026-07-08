import { PrismaClient } from '@prisma/client'
import { ROOMS } from '../lib/corners'

const prisma = new PrismaClient()

async function main() {
  const home = await prisma.home.create({
    data: { inviteCode: 'gentle-river', person1: 'Alice' },
  })

  await prisma.home.update({
    where: { id: home.id },
    data: { person2: 'Bob' },
  })

  await prisma.corner.createMany({
    data: ROOMS.map((r) => ({ icon: r.icon, name: r.name, homeId: home.id })),
  })

  const entries = await Promise.all([
    prisma.entry.create({ data: { content: 'Today felt heavy. Not bad, just... heavy. Like the air was thicker than usual.', authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 86400000) } }),
    prisma.entry.create({ data: { content: "I think patience is love's quietest form.", authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 72000000) } }),
    prisma.entry.create({ data: { content: "I finally finished that project I've been avoiding for weeks. Small win, but it counts.", authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 36000000) } }),
    prisma.entry.create({ data: { content: 'Remember that rainy afternoon when we just sat and watched the window? That was a good day.', authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 18000000) } }),
    prisma.entry.create({ data: { content: '...', authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 9000000) } }),
    prisma.entry.create({ data: { content: 'I dreamt we were in a house with too many doors. Every room was empty but warm.', authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 3600000) } }),
  ])

  console.log('Seeded! Open http://localhost:3000 and use key: gentle-river')
}

main().catch(console.error).finally(() => prisma.$disconnect())
