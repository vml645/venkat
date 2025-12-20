import { IBM_Plex_Mono, Crimson_Pro, Fira_Code } from 'next/font/google'

export const monoFont = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-mono',
    display: 'swap',
})

export const serifFont = Crimson_Pro({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    variable: '--font-serif',
    display: 'swap',
})

export const sansFont = serifFont

export const codeFont = Fira_Code({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-code',
    display: 'swap',
})