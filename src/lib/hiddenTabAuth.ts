import crypto from 'node:crypto'
import { HIDDEN_TAB_COOKIE, HIDDEN_TAB_PATH } from '@/lib/hiddenTabConfig'
export { HIDDEN_TAB_COOKIE, HIDDEN_TAB_PATH } from '@/lib/hiddenTabConfig'

const SESSION_TTL_SECONDS = 60 * 60 * 8

function timingSafeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function configuredPassword() {
  const value = process.env.HIDDEN_TAB_PASSWORD?.trim()
  return value && value.length > 0 ? value : null
}

function sessionSecret() {
  const explicitSecret = process.env.HIDDEN_TAB_SESSION_SECRET?.trim()
  if (explicitSecret) {
    return explicitSecret
  }

  return configuredPassword()
}

function signPayload(payload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export function passwordIsConfigured() {
  return configuredPassword() !== null
}

export function isPasswordMatch(input: string) {
  const password = configuredPassword()
  if (!password) {
    return false
  }

  return timingSafeEqual(input, password)
}

export function createSessionToken(now = Date.now()) {
  const secret = sessionSecret()
  if (!secret) {
    throw new Error('Missing secret for hidden tab session token')
  }

  const expiresAt = now + SESSION_TTL_SECONDS * 1000
  const nonce = crypto.randomBytes(16).toString('hex')
  const payload = `${expiresAt}.${nonce}`
  const signature = signPayload(payload, secret)

  return `${payload}.${signature}`
}

export function isSessionTokenValid(token: string | undefined, now = Date.now()) {
  if (!token) {
    return false
  }

  const secret = sessionSecret()
  if (!secret) {
    return false
  }

  const parts = token.split('.')
  if (parts.length !== 3) {
    return false
  }

  const [expiresAtRaw, nonce, signature] = parts
  const expiresAt = Number(expiresAtRaw)
  if (!Number.isFinite(expiresAt) || expiresAt <= now) {
    return false
  }

  const payload = `${expiresAtRaw}.${nonce}`
  const expectedSignature = signPayload(payload, secret)
  return timingSafeEqual(signature, expectedSignature)
}

export function hiddenTabCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  }
}
