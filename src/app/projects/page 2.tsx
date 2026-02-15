import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"

const projects = [
  {
    name: 'Datafruit',
    description: 'Agents that reason across cloud infrastructure. YC S25.',
    href: 'https://datafruit.dev',
  },
  {
    name: 'Datafruit Open Source',
    description: 'Our open source contributions and tools.',
    href: 'https://github.com/datafruit-dev/datafruit',
  },
]

export default function ProjectsPage() {
  return (
    <SidebarLayout currentPage="projects">
      <h1 className="text-xl font-bold mb-6">Projects</h1>
      
      <ul className="space-y-5">
        {projects.map((project) => (
          <li key={project.name}>
            <Link 
              href={project.href} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[15px]"
            >
              {project.name}
            </Link>
            <p className="text-muted-foreground text-[15px] mt-1">{project.description}</p>
          </li>
        ))}
      </ul>
    </SidebarLayout>
  );
}
