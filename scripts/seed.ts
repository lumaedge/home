import { PrismaClient } from '@prisma/client'
import { ROOMS } from '../lib/corners'

const prisma = new PrismaClient()

async function main() {
  const home = await prisma.home.upsert({
    where: { inviteCode: 'gentle-river' },
    update: {},
    create: { inviteCode: 'gentle-river', person1: 'Alice', person2: 'Bob' },
  })

  for (const r of ROOMS) {
    await prisma.corner.upsert({
      where: { homeId_name: { homeId: home.id, name: r.name } },
      update: {},
      create: { icon: r.icon, name: r.name, homeId: home.id },
    })
  }

  const existing = await prisma.entry.count({ where: { homeId: home.id } })
  if (existing === 0) {
    await prisma.entry.createMany({
      data: [
        { content: 'Today felt heavy. Not bad, just... heavy. Like the air was thicker than usual.', authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 86400000) },
        { content: "I think patience is love's quietest form.", authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 72000000) },
        { content: 'I finally finished that project. Small win, but it counts.', authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 36000000) },
        { content: 'Remember that rainy afternoon when we just sat and watched the window? That was a good day.', authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 18000000) },
        { content: '...', authorName: 'Alice', homeId: home.id, createdAt: new Date(Date.now() - 9000000) },
        { content: 'I dreamt we were in a house with too many doors. Every room was empty but warm.', authorName: 'Bob', homeId: home.id, createdAt: new Date(Date.now() - 3600000) },
      ],
    })
  }

  console.log('Seeded! Use key: gentle-river')
}

main().catch(console.error).finally(() => prisma.$disconnect())
