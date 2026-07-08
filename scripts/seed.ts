import { PrismaClient } from '@prisma/client'
import { HOME_CONFIG } from '../lib/home-config'
import { ROOMS } from '../lib/corners'

const prisma = new PrismaClient()

async function main() {
  // Find or create the home
  let home = await prisma.home.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!home) {
    home = await prisma.home.create({
      data: {
        inviteCode: 'gentle-river',
        person1: HOME_CONFIG.person1.name,
        person2: HOME_CONFIG.person2.name,
      },
    })
  }

  for (const r of ROOMS) {
    await prisma.corner.upsert({
      where: { homeId_name: { homeId: home.id, name: r.name } },
      update: {},
      create: { icon: r.icon, name: r.name, homeId: home.id },
    })
  }

  const existing = await prisma.entry.count({ where: { homeId: home.id } })

  if (existing === 0) {
    await prisma.entry.create({
      data: {
        content: HOME_CONFIG.welcomeNote,
        authorName: HOME_CONFIG.person1.name,
        homeId: home.id,
        createdAt: new Date(),
      },
    })

    await prisma.entry.createMany({
      data: [
        { content: 'Today felt heavy. Not bad, just... heavy. Like the air was thicker than usual.', authorName: HOME_CONFIG.person1.name, homeId: home.id, createdAt: new Date(Date.now() - 86400000) },
        { content: "I think patience is love's quietest form.", authorName: HOME_CONFIG.person2.name, homeId: home.id, createdAt: new Date(Date.now() - 72000000) },
        { content: 'I finally finished that project. Small win, but it counts.', authorName: HOME_CONFIG.person1.name, homeId: home.id, createdAt: new Date(Date.now() - 36000000) },
        { content: 'Remember that rainy afternoon when we just sat and watched the window? That was a good day.', authorName: HOME_CONFIG.person2.name, homeId: home.id, createdAt: new Date(Date.now() - 18000000) },
        { content: '...', authorName: HOME_CONFIG.person1.name, homeId: home.id, createdAt: new Date(Date.now() - 9000000) },
        { content: 'I dreamt we were in a house with too many doors. Every room was empty but warm.', authorName: HOME_CONFIG.person2.name, homeId: home.id, createdAt: new Date(Date.now() - 3600000) },
      ],
    })
  }

  console.log('Seeded!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
