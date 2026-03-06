import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { SidebarLayout } from '@/components/layout/SidebarLayout'
import { PortfolioPositions } from '@/components/portfolio/PortfolioPositions'
import {
  HIDDEN_TAB_COOKIE,
  HIDDEN_TAB_PATH,
  isSessionTokenValid,
  passwordIsConfigured,
} from '@/lib/hiddenTabAuth'

export const dynamic = 'force-dynamic'

export default async function HiddenPortfolioPage() {
  const cookieStore = await cookies()
  const hasAccess = isSessionTokenValid(cookieStore.get(HIDDEN_TAB_COOKIE)?.value)

  if (!passwordIsConfigured() || !hasAccess) {
    redirect(HIDDEN_TAB_PATH)
  }

  return (
    <SidebarLayout currentPage="about">
      <div className="space-y-4 text-[15px] leading-relaxed text-foreground">
        <Link
          href={HIDDEN_TAB_PATH}
          className="inline-flex items-center gap-1 text-sm text-black/60 hover:text-black no-underline transition-colors"
        >
          ← Back
        </Link>
        <PortfolioPositions />
      </div>
    </SidebarLayout>
  )
}
