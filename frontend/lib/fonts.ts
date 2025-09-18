import { IBM_Plex_Mono, IBM_Plex_Sans_Thai } from 'next/font/google'
import { cn } from './utils'

const fontSans = IBM_Plex_Sans_Thai({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700']
})

const fontMono = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700']
})

export const fonts = cn(
  fontSans.variable,
  fontMono.variable,
  'touch-manipulation font-sans antialiased'
)
