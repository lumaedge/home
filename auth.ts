import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import Apple from 'next-auth/providers/apple'
import Email from 'next-auth/providers/email'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { jwtVerify, SignJWT } from 'jose'

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || '')

async function verifyOneTimeToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] })
    if (payload.type !== 'passkey-auth' || !payload.sub) return null
    const user = await prisma.user.findUnique({ where: { id: payload.sub as string } })
    return user
  } catch { return null }
}

export async function createOneTimeToken(userId: string) {
  return await new SignJWT({ type: 'passkey-auth', sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30s')
    .sign(secret)
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: [
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! })]
      : []),
    ...(process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET
      ? [Apple({ clientId: process.env.AUTH_APPLE_ID!, clientSecret: process.env.AUTH_APPLE_SECRET! })]
      : []),
    ...(process.env.AUTH_EMAIL_SERVER
      ? [Email({ server: process.env.AUTH_EMAIL_SERVER, from: process.env.AUTH_EMAIL_FROM || 'home@home.com' })]
      : []),
    Credentials({
      id: 'passkey',
      name: 'Passkey',
      credentials: { token: { label: 'Token' } },
      async authorize({ token }) {
        if (!token || typeof token !== 'string') return null
        const user = await verifyOneTimeToken(token)
        return user ? { id: user.id, name: user.name || undefined, email: user.email || undefined, image: user.image || undefined } : null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
