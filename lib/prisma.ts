import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

function getPrisma() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma

  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  if (tursoUrl && tursoToken) {
    const { createClient } = require('@libsql/client')
    const { PrismaLibSQL } = require('@prisma/adapter-libsql')
    const libsql = createClient({ url: tursoUrl, authToken: tursoToken })
    globalForPrisma.prisma = new PrismaClient({ adapter: new PrismaLibSQL(libsql) })
  } else {
    globalForPrisma.prisma = new PrismaClient()
  }

  return globalForPrisma.prisma
}

export const prisma = getPrisma()
