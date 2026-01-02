import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"

export default function AboutPage() {
  return (
    <SidebarLayout>
      <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground">
        <p>
          Hi, I'm Venkat, a student at UC Berkeley studying Statistics and Computer Science.
        </p>

        <p>
          In my second year, I took a leave of absence to work on a startup full time.
        </p>

        <p>
          That startup is{' '}
          <Link href="https://datafruit.dev" target="_blank" rel="noopener noreferrer">
            Datafruit
          </Link>
          , where we're building agents that can reason across and work with cloud infrastructure. 
          The company is backed by{' '}
          <Link href="https://ycombinator.com" target="_blank" rel="noopener noreferrer">
            Y Combinator
          </Link>{' '}
          as part of the S25 batch.
        </p>

        <p>
          Outside of work and school, I'm interested in Carnatic music, UX, and design. 
          I play the mridangam, a South Indian percussion instrument — you can learn about it{' '}
          <Link href="https://en.wikipedia.org/wiki/Mridangam" target="_blank" rel="noopener noreferrer">
            here
          </Link>
          , and about my teacher{' '}
          <Link href="https://en.wikipedia.org/wiki/K._P._Parameswaran" target="_blank" rel="noopener noreferrer">
            here
          </Link>
          .
        </p>

        <p>
          You can reach me at{' '}
          <Link href="mailto:mmiv645[at]gmail[dot]com">
            mmiv645@gmail.com
          </Link>
          .
        </p>
      </div>
    </SidebarLayout>
  )
}
