import './globals.css'
import type { Metadata } from 'next'
import { serifFont } from '@/styles/fonts/fonts'

export const metadata: Metadata = {
  title: 'Venkat Arun',
  description: 'Co-founder at Datafruit. Engineer and builder.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`h-full ${serifFont.variable}`}>
      <body className={`h-full bg-background antialiased ${serifFont.className}`}>
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
