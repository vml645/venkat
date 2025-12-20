import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"

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
  return (
    <SidebarLayout>
      <h1 className="text-lg font-medium mb-6">Highlighted Projects</h1>
      
      <ul className="space-y-5">
        {projects.map((project) => (
          <li key={project.name}>
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
