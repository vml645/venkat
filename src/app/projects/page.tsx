'use client'

import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"
import { useStagedAnimation } from '@/components/animation/useStagedAnimation'

/* ─────────────────────────────────────────────────────────
 * ANIMATION STORYBOARD
 *
 * Read top-to-bottom. Each `at` value is ms after mount.
 *
 *    0ms   heading fades in with elastic settle
 *   90ms   project rows lift in quickly (staggered 70ms)
 * ───────────────────────────────────────────────────────── */

const TIMING = {
  headingAppear: 0, // title appears first
  rowsAppear: 90, // project rows start
}

const MOTION = {
  rowStagger: 70, // ms between each row
}

const projects = [
  {
    name: 'Orchard Orchestrator',
    description: 'Bring your own cloud platform as a service.',
    href: 'https://github.com/datafruit-dev/orchard-orchestrator',
  },
  {
    name: 'Achilles',
    description: 'Python optimization tool using profiling and LLMs to generate C++ patches.',
    href: 'https://github.com/datafruit-dev/achilles',
  },
  {
    name: 'Lychee',
    description: 'Orchestrate Claude Code instances with git worktrees',
    href: 'https://github.com/datafruit-dev/lychee',
  },
]

export default function ProjectsPage() {
  const { stage, reducedMotion } = useStagedAnimation({
    timing: [TIMING.headingAppear, TIMING.rowsAppear],
  })

  return (
    <SidebarLayout currentPage="projects">
      <h1 className={`text-lg font-medium mb-6 transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
        stage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } ${reducedMotion ? 'duration-0' : ''}`}>Highlighted Projects</h1>
      
      <ul className="space-y-5">
        {projects.map((project, index) => (
          <li
            key={project.name}
            style={reducedMotion ? undefined : { transitionDelay: `${index * MOTION.rowStagger}ms` }}
            className={`transition-all duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1.08)] ${
              stage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            } ${reducedMotion ? 'duration-0' : ''}`}
          >
            <p className="text-[15px]">
              <span className="font-medium">{project.name}</span>
              <span className="text-muted-foreground"> — {project.description}</span>
            </p>
            <Link 
              href={project.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[15px] text-muted-foreground"
            >
              {project.href.replace('https://', '')}
            </Link>
          </li>
        ))}
      </ul>
    </SidebarLayout>
  );
}
