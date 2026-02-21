import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { HIDDEN_TAB_COOKIE, isSessionTokenValid } from '@/lib/hiddenTabAuth'
import { normalizeHabitStore } from '@/lib/habitStore'
import { readPrivateHabitStore, writePrivateHabitStore } from '@/lib/privateHabitStore'

function notFound() {
  return new NextResponse('Not Found', { status: 404 })
}

async function hasHiddenAccess() {
  const cookieStore = await cookies()
  return isSessionTokenValid(cookieStore.get(HIDDEN_TAB_COOKIE)?.value)
}

export async function GET() {
  if (!(await hasHiddenAccess())) {
    return notFound()
  }

  const store = await readPrivateHabitStore()
  return NextResponse.json(store, {
    headers: {
      'Cache-Control': 'private, max-age=30, stale-while-revalidate=300',
    },
  })
}

export async function POST(request: Request) {
  if (!(await hasHiddenAccess())) {
    return notFound()
  }

  try {
    const payload = await request.json()
    const normalized = normalizeHabitStore(payload)
    await writePrivateHabitStore(normalized)
    return NextResponse.json({ ok: true })
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }
}
