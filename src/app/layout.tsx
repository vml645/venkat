import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
import { Analytics } from "@vercel/analytics/react"
import { monoFont, serifFont, codeFont } from '@/styles/fonts/fonts'

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
    <html lang="en" className={cn(
      "h-full",
      monoFont.variable,
      serifFont.variable,
      codeFont.variable
    )} suppressHydrationWarning>
      <body className={cn(
        "h-full bg-background transition-colors duration-300",
        serifFont.className
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen">
            {children}
            <Analytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

