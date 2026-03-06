import crypto from 'node:crypto'

const WINDOW_MS = 15 * 60 * 1000
const MAX_ATTEMPTS = 8
const LOCKOUT_MS = 30 * 60 * 1000
const STORE_KEY_PREFIX = 'venkat:hidden:unlock-rate:v1:'
const MEMORY_TTL_MS = Math.max(WINDOW_MS, LOCKOUT_MS)

type RateLimitState = {
  count: number
  windowStartedAt: number
  lockedUntil: number
}

type RateLimitResult = {
  allowed: boolean
  retryAfterSeconds?: number
}

const memoryStore = new Map<string, { state: RateLimitState; savedAt: number }>()

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN

  if (!url || !token) {
    return null
  }

  return { url, token }
}

async function runRedisCommand(command: unknown[]) {
  const config = upstashConfig()
  if (!config) {
    return null
  }

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Upstash request failed with status ${response.status}`)
  }

  const payload = (await response.json()) as { result?: unknown; error?: string }
  if (payload.error) {
    throw new Error(payload.error)
  }

  return payload.result
}

function keyForIdentifier(identifier: string) {
  const hash = crypto.createHash('sha256').update(identifier).digest('hex')
  return `${STORE_KEY_PREFIX}${hash}`
}

function normalizeState(raw: unknown, now: number): RateLimitState {
  if (!raw || typeof raw !== 'object') {
    return {
      count: 0,
      windowStartedAt: now,
      lockedUntil: 0,
    }
  }

  const incoming = raw as Partial<RateLimitState>
  return {
    count: Number.isFinite(incoming.count) ? Math.max(0, Number(incoming.count)) : 0,
    windowStartedAt:
      Number.isFinite(incoming.windowStartedAt) && Number(incoming.windowStartedAt) > 0
        ? Number(incoming.windowStartedAt)
        : now,
    lockedUntil:
      Number.isFinite(incoming.lockedUntil) && Number(incoming.lockedUntil) > 0 ? Number(incoming.lockedUntil) : 0,
  }
}

function maybeResetWindow(state: RateLimitState, now: number) {
  if (now - state.windowStartedAt >= WINDOW_MS) {
    state.count = 0
    state.windowStartedAt = now
  }
}

async function readState(key: string, now: number) {
  const config = upstashConfig()
  if (config) {
    try {
      const result = await runRedisCommand(['GET', key])
      if (typeof result !== 'string' || result.length === 0) {
        return normalizeState(null, now)
      }
      return normalizeState(JSON.parse(result), now)
    } catch {
      return normalizeState(null, now)
    }
  }

  const cached = memoryStore.get(key)
  if (!cached) {
    return normalizeState(null, now)
  }

  if (now - cached.savedAt > MEMORY_TTL_MS) {
    memoryStore.delete(key)
    return normalizeState(null, now)
  }

  return normalizeState(cached.state, now)
}

async function writeState(key: string, state: RateLimitState, now: number) {
  const payload = JSON.stringify(state)
  const config = upstashConfig()
  if (config) {
    try {
      await runRedisCommand(['SET', key, payload, 'EX', Math.ceil(MEMORY_TTL_MS / 1000)])
      return
    } catch {
      return
    }
  }

  memoryStore.set(key, { state, savedAt: now })
}

async function clearState(key: string) {
  const config = upstashConfig()
  if (config) {
    try {
      await runRedisCommand(['DEL', key])
    } catch {}
    return
  }

  memoryStore.delete(key)
}

export function hiddenTabRateLimitIdentifier(params: {
  forwardedFor?: string | null
  realIp?: string | null
  userAgent?: string | null
}) {
  const forwarded = params.forwardedFor?.split(',')[0]?.trim()
  const realIp = params.realIp?.trim()
  const userAgent = params.userAgent?.trim() ?? 'unknown-agent'
  const ip = forwarded || realIp || 'unknown-ip'
  return `${ip}:${userAgent}`
}

export async function checkHiddenTabUnlockRateLimit(identifier: string, now = Date.now()): Promise<RateLimitResult> {
  const key = keyForIdentifier(identifier)
  const state = await readState(key, now)
  maybeResetWindow(state, now)

  if (state.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((state.lockedUntil - now) / 1000),
    }
  }

  return { allowed: true }
}

export async function registerHiddenTabUnlockFailure(identifier: string, now = Date.now()) {
  const key = keyForIdentifier(identifier)
  const state = await readState(key, now)
  maybeResetWindow(state, now)

  state.count += 1
  if (state.count >= MAX_ATTEMPTS) {
    state.lockedUntil = now + LOCKOUT_MS
  }

  await writeState(key, state, now)
}

export async function clearHiddenTabUnlockFailures(identifier: string) {
  const key = keyForIdentifier(identifier)
  await clearState(key)
}
