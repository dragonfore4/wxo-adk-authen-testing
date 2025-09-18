'use client'

import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function ChatButton() {
  return (
    <Link
      aria-label="Ask HR Assistant"
      className={cn(
        'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700',
        'fixed right-6 bottom-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-primary-foreground shadow-lg',
        'transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-blue-600'
      )}
      href="/askhr"
    >
      <MessageCircle className="h-6 w-6" />
    </Link>
  )
}
