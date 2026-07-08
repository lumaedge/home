import { prisma } from '@/lib/prisma'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

const rpName = 'Home'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null)
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3000'

function getRPID(): string {
  return new URL(APP_URL).hostname
}

function getOrigin(): string {
  return APP_URL
}

export async function beginRegistration(userId: string) {
  const existing = await prisma.passkeyCredential.findMany({ where: { userId } })

  const user = await prisma.user.findUnique({ where: { id: userId } })

  const options = await generateRegistrationOptions({
    rpName,
    rpID: getRPID(),
    userName: user?.email || userId,
    attestationType: 'none',
    excludeCredentials: existing.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
  })

  await prisma.challenge.create({
    data: {
      value: options.challenge,
      expiresAt: new Date(Date.now() + 60000),
    },
  })

  return options
}

export async function completeRegistration(userId: string, credential: any, challenge: string) {
  const stored = await prisma.challenge.findUnique({ where: { value: challenge } })
  if (!stored || stored.expiresAt < new Date()) throw new Error('Challenge expired or not found')

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRPID(),
  })

  if (!verification.verified || !verification.registrationInfo) throw new Error('Registration verification failed')

  const { credential: cred } = verification.registrationInfo

  await prisma.passkeyCredential.create({
    data: {
      id: cred.id,
      userId,
      publicKey: Buffer.from(cred.publicKey),
      counter: cred.counter,
      transports: cred.transports || [],
    },
  })

  await prisma.challenge.delete({ where: { value: challenge } })
}

export async function beginLogin() {
  const options = await generateAuthenticationOptions({
    rpID: getRPID(),
    userVerification: 'preferred',
  })

  await prisma.challenge.create({
    data: {
      value: options.challenge,
      expiresAt: new Date(Date.now() + 60000),
    },
  })

  return options
}

export async function completeLogin(credential: any, challenge: string) {
  const stored = await prisma.challenge.findUnique({ where: { value: challenge } })
  if (!stored || stored.expiresAt < new Date()) throw new Error('Challenge expired or not found')

  const storedCred = await prisma.passkeyCredential.findUnique({ where: { id: credential.id } })
  if (!storedCred) throw new Error('Credential not found')

  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRPID(),
    credential: {
      id: storedCred.id,
      publicKey: new Uint8Array(storedCred.publicKey),
      counter: Number(storedCred.counter),
      transports: storedCred.transports as AuthenticatorTransportFuture[],
    },
  })

  if (!verification.verified) throw new Error('Login verification failed')

  await prisma.passkeyCredential.update({
    where: { id: credential.id },
    data: { counter: Number(verification.authenticationInfo.newCounter) },
  })

  await prisma.challenge.delete({ where: { value: challenge } })

  return { userId: storedCred.userId }
}
