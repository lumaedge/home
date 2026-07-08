import { prisma } from '@/lib/prisma'
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type { AuthenticatorTransportFuture } from '@simplewebauthn/server'

const rpName = 'Home'

function getRPID(): string {
  if (process.env.VERCEL_URL) return process.env.VERCEL_URL
  return 'localhost'
}

function getOrigin(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

export async function beginRegistration(homeId: string, personName: string) {
  const existing = await prisma.passkeyCredential.findMany({
    where: { homeId, personName },
  })

  const options = await generateRegistrationOptions({
    rpName,
    rpID: getRPID(),
    userName: `${homeId}:${personName}`,
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

export async function completeRegistration(
  homeId: string,
  personName: string,
  credential: any,
  challenge: string,
) {
  const stored = await prisma.challenge.findUnique({ where: { value: challenge } })
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('Challenge expired or not found')
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge: challenge,
    expectedOrigin: getOrigin(),
    expectedRPID: getRPID(),
  })

  if (!verification.verified || !verification.registrationInfo) {
    throw new Error('Registration verification failed')
  }

  const { credential: cred } = verification.registrationInfo

  await prisma.passkeyCredential.create({
    data: {
      id: cred.id,
      homeId,
      personName,
      publicKey: Buffer.from(cred.publicKey),
      counter: cred.counter,
      transports: cred.transports || [],
    },
  })

  await prisma.challenge.delete({ where: { value: challenge } })
}

export async function beginLogin(homeId: string) {
  const creds = await prisma.passkeyCredential.findMany({
    where: { homeId },
  })

  const options = await generateAuthenticationOptions({
    rpID: getRPID(),
    allowCredentials: creds.map((c) => ({
      id: c.id,
      transports: c.transports as AuthenticatorTransportFuture[],
    })),
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
  if (!stored || stored.expiresAt < new Date()) {
    throw new Error('Challenge expired or not found')
  }

  const credId = credential.id

  const storedCred = await prisma.passkeyCredential.findUnique({
    where: { id: credId },
  })
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
    where: { id: credId },
    data: { counter: Number(verification.authenticationInfo.newCounter) },
  })

  await prisma.challenge.delete({ where: { value: challenge } })

  return { homeId: storedCred.homeId, personName: storedCred.personName }
}
