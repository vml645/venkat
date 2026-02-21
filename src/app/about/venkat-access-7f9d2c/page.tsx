import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { HabitTracker } from '@/components/habits/HabitTracker'
import {
  HIDDEN_TAB_COOKIE,
  HIDDEN_TAB_PATH,
  createSessionToken,
  hiddenTabCookieOptions,
  isPasswordMatch,
  isSessionTokenValid,
  passwordIsConfigured,
} from '@/lib/hiddenTabAuth'

export const metadata: Metadata = {
  title: 'Venkat Arun',
  description: 'Private area',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
}

export const dynamic = 'force-dynamic'

async function unlockHiddenTab(formData: FormData) {
  'use server'

  const password = String(formData.get('password') ?? '')

  if (!isPasswordMatch(password)) {
    redirect(`${HIDDEN_TAB_PATH}?error=1`)
  }

  const cookieStore = await cookies()
  cookieStore.set(HIDDEN_TAB_COOKIE, createSessionToken(), hiddenTabCookieOptions())
  redirect(HIDDEN_TAB_PATH)
}

async function lockHiddenTab() {
  'use server'

  const cookieStore = await cookies()
  cookieStore.delete(HIDDEN_TAB_COOKIE)
  redirect('/about')
}

type HiddenTabPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function HiddenTabPage({ searchParams }: HiddenTabPageProps) {
  const cookieStore = await cookies()
  const hasAccess = isSessionTokenValid(cookieStore.get(HIDDEN_TAB_COOKIE)?.value)
  const { error } = await searchParams

  return (
    <SidebarLayout currentPage="about">
      <div className="space-y-5 text-[15px] leading-relaxed text-foreground">
        {!passwordIsConfigured() && (
          <p>
            Hidden tab is disabled. Set <code>HIDDEN_TAB_PASSWORD</code> in your environment to turn it on.
          </p>
        )}

        {passwordIsConfigured() && !hasAccess && (
          <>
            <p>secret tab! password to enter.</p>
            <form action={unlockHiddenTab} className="space-y-2 max-w-xs">
              <div className="border-b border-black/20 pb-1">
                <input
                  id="hidden-tab-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full border-0 bg-transparent px-0 py-0.5 text-[15px] outline-none"
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-black/45">password</p>
                <button
                  type="submit"
                  className="text-xs text-black/50 underline decoration-black/35 underline-offset-2 hover:text-black/80 transition-colors"
                >
                  enter
                </button>
              </div>
              {error ? (
                <p className="text-sm text-red-600">Incorrect password.</p>
              ) : null}
            </form>
          </>
        )}

        {passwordIsConfigured() && hasAccess && (
          <>
            <div className="max-w-[34rem] pr-2 flex items-center justify-between gap-3">
              <h1 className="text-lg font-medium">habit tracker</h1>
              <form action={lockHiddenTab}>
                <button
                  type="submit"
                  className="text-sm text-black/45 hover:text-black/75 transition-colors"
                >
                  Lock tab
                </button>
              </form>
            </div>
            <HabitTracker />
          </>
        )}
      </div>
    </SidebarLayout>
  )
}
