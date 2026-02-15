'use client'

import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   section heading appears with elastic settle
 *   80ms   social links rise in quickly (staggered 60ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headingAppear: 0, // heading appears first
  linksAppear: 80, // links begin stagger
}

const MOTION = {
  linkStagger: 60, // ms between each link row
}

const socialLinks = [
  { href: 'https://x.com/venkat9165', label: 'X (Twitter)', handle: '@venkat9165' },
  { href: 'https://github.com/vml645', label: 'GitHub', handle: 'vml645' },
  { href: 'https://www.linkedin.com/in/venkat-arun/', label: 'LinkedIn', handle: 'venkat arun' },
]

export default function SocialPage() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.headingAppear, TIMING.linksAppear],
  })

  return (
    <SidebarLayout currentPage="social">
      <h1 className={`text-lg font-medium mb-6 transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${reducedMotion ? 'duration-0' : ''}`}>Social</h1>
      
      <ul className="space-y-4 text-[15px]">
        {socialLinks.map((link, index) => (
          <li
            key={link.href}
            style={reducedMotion ? undefined : { transitionDelay: `${index * MOTION.linkStagger}ms` }}
            className={`transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${reducedMotion ? 'duration-0' : ''}`}
          >
            <Link 
              href={link.href} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {link.label}
            </Link>
            <span className="text-muted-foreground ml-2">— {link.handle}</span>
          </li>
        ))}
      </ul>
    </SidebarLayout>
  )
}
