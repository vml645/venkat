import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import {
  HIDDEN_TAB_COOKIE,
  HIDDEN_TAB_PATH,
  createSessionToken,
  hiddenTabCookieOptions,
  isPasswordMatch,
  isSessionTokenValid,
  passwordIsConfigured,
} from '@/lib/hiddenTabAuth'
import {
  checkHiddenTabUnlockRateLimit,
  clearHiddenTabUnlockFailures,
  hiddenTabRateLimitIdentifier,
  registerHiddenTabUnlockFailure,
} from '@/lib/hiddenTabRateLimit'

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
  const requestHeaders = await headers()
  const rateLimitId = hiddenTabRateLimitIdentifier({
    forwardedFor: requestHeaders.get('x-forwarded-for'),
    realIp: requestHeaders.get('x-real-ip'),
    userAgent: requestHeaders.get('user-agent'),
  })
  const rateLimit = await checkHiddenTabUnlockRateLimit(rateLimitId)

  if (!rateLimit.allowed) {
    redirect(`${HIDDEN_TAB_PATH}?error=rate_limit`)
  }

  if (!isPasswordMatch(password)) {
    await registerHiddenTabUnlockFailure(rateLimitId)
    redirect(`${HIDDEN_TAB_PATH}?error=1`)
  }

  await clearHiddenTabUnlockFailures(rateLimitId)
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
  searchParams: Promise<{ error?: '1' | 'rate_limit' }>
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
            Hidden tab is disabled. Set <code>htp</code> in your environment to turn it on.
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
              {error === '1' ? <p className="text-sm text-red-600">Incorrect password.</p> : null}
              {error === 'rate_limit' ? (
                <p className="text-sm text-red-600">Too many attempts. Please wait before trying again.</p>
              ) : null}
            </form>
          </>
        )}

        {passwordIsConfigured() && hasAccess && (
          <>
            <div className="max-w-[34rem] pr-2 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h1 className="text-lg font-medium">Private Menu</h1>
                <form action={lockHiddenTab}>
                  <button
                    type="submit"
                    className="text-sm text-black/45 hover:text-black/75 transition-colors"
                  >
                    Lock
                  </button>
                </form>
              </div>
              <nav className="space-y-2">
                <Link
                  href={`${HIDDEN_TAB_PATH}/habits`}
                  className="block rounded-lg px-3 py-2 no-underline text-black/75 hover:text-black hover:bg-black/[0.04] transition-colors"
                >
                  Habit Tracker
                </Link>
                <Link
                  href={`${HIDDEN_TAB_PATH}/portfolio`}
                  className="block rounded-lg px-3 py-2 no-underline text-black/75 hover:text-black hover:bg-black/[0.04] transition-colors"
                >
                  Portfolio Positions
                </Link>
              </nav>
            </div>
          </>
        )}
      </div>
    </SidebarLayout>
  )
}
