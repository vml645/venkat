'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

type NavPage = 'about' | 'projects' | 'social'

const navLinks = [
  { href: '/about', label: 'about', external: false },
  { href: '/projects', label: 'projects', external: false },
  { href: 'https://www.ycombinator.com/companies/datafruit', label: 'datafruit', external: true },
  { href: '/social', label: 'social', external: false },
]

interface SidebarLayoutProps {
  children: React.ReactNode
  currentPage: NavPage
}

function isActive(href: string, currentPage: NavPage) {
  return href === `/${currentPage}`
}

export function SidebarLayout({ children, currentPage }: SidebarLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 bg-background z-50 px-6 py-4 border-b border-border">
        <Link href="/" className="text-lg font-semibold no-underline hover:opacity-100 whitespace-nowrap block">
          Venkat Arun
        </Link>
        <nav className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {navLinks.map((link) => (
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="no-underline hover:opacity-100 text-black/45 hover:text-black/70 inline-flex items-center gap-1"
              >
                {link.label}
                <ExternalLink aria-hidden="true" strokeWidth={1.5} className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className={`no-underline hover:opacity-100 ${
                  isActive(link.href, currentPage)
                    ? 'text-foreground font-semibold'
                    : 'text-black/45 hover:text-black/70'
                }`}
              >
                {link.label}
              </Link>
            )
          ))}
        </nav>
      </header>

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:block w-44 shrink-0 min-h-screen py-12 pl-12 pr-4">
        <div className="sticky top-12">
          <Link href="/" className="text-lg font-semibold no-underline hover:opacity-100 block mb-8 whitespace-nowrap text-right">
            Venkat Arun
          </Link>
          
          <nav className="flex flex-col gap-[6px] text-right">
            {navLinks.map((link) => (
              link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:opacity-100 text-[15px] leading-relaxed text-black/45 hover:text-black/70 inline-flex items-center justify-end gap-1"
                >
                  {link.label}
                  <ExternalLink aria-hidden="true" strokeWidth={1.5} className="h-3 w-3 shrink-0" />
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`no-underline hover:opacity-100 text-[15px] leading-relaxed ${
                    isActive(link.href, currentPage)
                      ? 'text-foreground font-semibold'
                      : 'text-black/45 hover:text-black/70'
                  }`}
                >
                  {link.label}
                </Link>
              )
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-28 lg:pt-12 px-6 lg:px-12 pb-16">
        <div className="max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
