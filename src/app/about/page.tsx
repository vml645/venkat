'use client'

import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'
import { HIDDEN_TAB_PATH } from '@/lib/hiddenTabConfig'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   body copy starts appearing
 *   80ms   paragraphs settle in with quick elastic lift (staggered 60ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  bodyAppear:   0, // body is ready
  paragraphFlow: 80, // paragraphs begin stagger
}

const MOTION = {
  paragraphStagger: 60, // ms between each paragraph
}

export default function AboutPage() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.bodyAppear, TIMING.paragraphFlow],
  })

  const paragraphs = [
    {
      id: 'intro',
      content: (
        <p>
          Hi, I&apos;m{' '}
          <Link
            href={HIDDEN_TAB_PATH}
            className="text-inherit no-underline hover:no-underline focus-visible:outline-none focus-visible:ring-0 cursor-text"
          >
            Venkat
          </Link>
          , co-founder and CEO of Datafruit.
        </p>
      ),
    },
    {
      id: 'school',
      content: (
        <p>
          I was recently a student at UC Berkeley studying Statistics and Computer Science. In my second year, I took a leave of absence to work on a startup full time.
        </p>
      ),
    },
    {
      id: 'startup',
      content: (
        <p>
          That startup is{' '}
          <Link href="https://datafruit.ai" target="_blank" rel="noopener noreferrer">
            Datafruit
          </Link>
          , where we are building AI systems for enterprise software implementation.
          The company is backed by{' '}
          <Link href="https://ycombinator.com" target="_blank" rel="noopener noreferrer">
            Y Combinator
          </Link>{' '}
          as part of the S25 batch.
        </p>
      ),
    },
    {
      id: 'music',
      content: (
        <p>
          Outside of work and school, I&apos;m interested in Carnatic music, UX, and design.
          I play the mridangam, a South Indian percussion instrument, you can learn about it{' '}
          <Link href="https://en.wikipedia.org/wiki/Mridangam" target="_blank" rel="noopener noreferrer">
            here
          </Link>
          , and about my teacher{' '}
          <Link href="https://en.wikipedia.org/wiki/K._P._Parameswaran" target="_blank" rel="noopener noreferrer">
            here
          </Link>
          .
        </p>
      ),
    },
    {
      id: 'contact',
      content: (
        <p>
          You can reach me at{' '}
          <Link href="mailto:venkat@datafruit.dev">
            venkat[at]datafruit.dev
          </Link>
          .
        </p>
      ),
    },
  ]

  return (
    <SidebarLayout currentPage="about">
      <div className="space-y-5 text-[15px] leading-relaxed text-foreground">
        {paragraphs.map((paragraph, index) => (
          <div
            key={paragraph.id}
            style={reducedMotion ? undefined : { transitionDelay: `${index * MOTION.paragraphStagger}ms` }}
            className={`transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            } ${reducedMotion ? 'duration-0' : ''}`}
          >
            {paragraph.content}
          </div>
        ))}
      </div>
    </SidebarLayout>
  )
}
