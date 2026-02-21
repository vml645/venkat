import fs from 'node:fs/promises'
import path from 'node:path'
import { createDefaultStore, normalizeHabitStore, type HabitStore } from '@/lib/habitStore'

const STORE_FILE = path.join(process.cwd(), '.venkat-private-state.json')
const TEMP_FILE = `${STORE_FILE}.tmp`

export async function readPrivateHabitStore() {
  try {
    const raw = await fs.readFile(STORE_FILE, 'utf8')
    return normalizeHabitStore(JSON.parse(raw))
  } catch {
    return createDefaultStore()
  }
}

export async function writePrivateHabitStore(store: HabitStore) {
  const normalized = normalizeHabitStore(store)
  const payload = JSON.stringify(normalized)

  await fs.writeFile(TEMP_FILE, payload, 'utf8')
  await fs.rename(TEMP_FILE, STORE_FILE)
}
