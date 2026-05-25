import { cookies } from 'next/headers'

const COOKIE = 'admin_session'
const MAX_AGE = 60 * 60 * 8 // 8 hours

function secret(): string {
  const s = process.env.SESSION_SECRET
  if (!s) throw new Error('SESSION_SECRET env var is not set')
  return s
}

async function hmacKey(sec: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(sec),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function sign(payload: string): Promise<string> {
  const key = await hmacKey(secret())
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(): Promise<string> {
  const payload = `admin:${Date.now()}`
  const sig = await sign(payload)
  return Buffer.from(`${payload}.${sig}`).toString('base64')
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const lastDot = decoded.lastIndexOf('.')
    const payload = decoded.slice(0, lastDot)
    const sig = decoded.slice(lastDot + 1)
    const expected = await sign(payload)
    return sig === expected
  } catch {
    return false
  }
}

export async function getAdminSession(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE)?.value
  if (!token) return false
  return verifySessionToken(token)
}

export async function setAdminSession(): Promise<void> {
  const jar = await cookies()
  jar.set(COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export async function clearAdminSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE)
}

export function checkPassword(input: string): boolean {
  const correct = process.env.ADMIN_PASSWORD
  if (!correct) return false
  if (input.length !== correct.length) return false
  let diff = 0
  for (let i = 0; i < input.length; i++) {
    diff |= input.charCodeAt(i) ^ correct.charCodeAt(i)
  }
  return diff === 0
}
