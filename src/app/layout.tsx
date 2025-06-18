import './globals.css'
import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme/theme-provider'
import { cn } from '@/lib/utils/utils'
import { Analytics } from "@vercel/analytics/react"
import { monoFont, sansFont, codeFont } from '@/styles/fonts/fonts'

export const metadata: Metadata = {
  title: 'venkat',
  description: 'a site where I document my ML learning journey & share my thoughts',
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
      sansFont.variable,
      codeFont.variable
    )} suppressHydrationWarning>
      <body className={cn(
        "h-full bg-background transition-colors duration-300"
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen relative">
            <div className="flex-1 flex flex-col">
              <main className="container mx-auto mt-4 px-4 flex-1">
                {children}
                <Analytics />
              </main>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}

