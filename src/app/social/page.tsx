import Link from 'next/link'
import { SidebarLayout } from "@/components/layout/SidebarLayout"

const socialLinks = [
  { href: 'https://x.com/venkat9165', label: 'X (Twitter)', handle: '@venkat9165' },
  { href: 'https://github.com/vml645', label: 'GitHub', handle: 'vml645' },
  { href: 'https://www.linkedin.com/in/venkat-arun/', label: 'LinkedIn', handle: 'venkat arun' },
]

export default function SocialPage() {
  return (
    <SidebarLayout>
      <h1 className="text-lg font-medium mb-6">Social</h1>
      
      <ul className="space-y-4 text-[15px]">
        {socialLinks.map((link) => (
          <li key={link.href}>
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
