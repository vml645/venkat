import fs from 'node:fs/promises'
import path from 'node:path'
import { createDefaultStore, normalizeHabitStore, type HabitStore } from '@/lib/habitStore'

const STORE_FILE = path.join(process.cwd(), '.venkat-private-state.json')
const TEMP_FILE = `${STORE_FILE}.tmp`
const STORE_KEY = 'venkat:hidden:habit-store:v1'
const MEMORY_CACHE_TTL_MS = 30_000

let memoryCachedStore: HabitStore | null = null
let memoryCachedPayload: string | null = null
let memoryCachedAt = 0

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

export async function readPrivateHabitStore() {
  const config = upstashConfig()
  const cacheAge = Date.now() - memoryCachedAt
  if (memoryCachedStore && cacheAge >= 0 && cacheAge < MEMORY_CACHE_TTL_MS) {
    return normalizeHabitStore(memoryCachedStore)
  }

  if (config) {
    try {
      const result = await runRedisCommand(['GET', STORE_KEY])
      if (typeof result === 'string' && result.length > 0) {
        const normalized = normalizeHabitStore(JSON.parse(result))
        memoryCachedStore = normalized
        memoryCachedPayload = JSON.stringify(normalized)
        memoryCachedAt = Date.now()
        return normalizeHabitStore(normalized)
      }
      memoryCachedStore = createDefaultStore()
      memoryCachedPayload = JSON.stringify(memoryCachedStore)
      memoryCachedAt = Date.now()
      return createDefaultStore()
    } catch {
      return createDefaultStore()
    }
  }

  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8')
    const normalized = normalizeHabitStore(JSON.parse(raw))
    memoryCachedStore = normalized
    memoryCachedPayload = JSON.stringify(normalized)
    memoryCachedAt = Date.now()
    return normalizeHabitStore(normalized)
  } catch {
    return createDefaultStore()
  }
}

export async function writePrivateHabitStore(store: HabitStore) {
  const normalized = normalizeHabitStore(store)
  const payload = JSON.stringify(normalized)
  if (payload === memoryCachedPayload) {
    memoryCachedAt = Date.now()
    return
  }

  const config = upstashConfig()
  if (config) {
    await runRedisCommand(['SET', STORE_KEY, payload])
    memoryCachedStore = normalized
    memoryCachedPayload = payload
    memoryCachedAt = Date.now()
    return
  }

  await fs.writeFile(TEMP_FILE, payload, 'utf8')
  await fs.rename(TEMP_FILE, STORE_FILE)
  memoryCachedStore = normalized
  memoryCachedPayload = payload
  memoryCachedAt = Date.now()
}
