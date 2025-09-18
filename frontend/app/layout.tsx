import './globals.css'

import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { fonts } from '@/lib/fonts'
import { createMetadata } from '@/lib/metadata'
import { cn } from '@/lib/utils'
import { Providers } from '@/providers'
import { Header } from './components/header'

export const metadata: Metadata = createMetadata({
  title: 'AskHR',
  description:
    'Get instant answers to your HR questions, manage your leave requests, access payroll information, and update personal details — all through natural conversation with AI-powered HR agent'
})

type RootLayoutProps = {
  readonly children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          fonts,
          'bg-gradient-to-t from-blue-200/30 via-transparent to-transparent dark:from-blue-900/30'
        )}
      >
        <Providers attribute="class" defaultTheme="light" enableSystem>
          <Header />
          <div className="h-8 md:h-30" />
          <main className="container relative mx-auto px-6">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
