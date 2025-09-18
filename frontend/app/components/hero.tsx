import { MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

export const Hero = () => {
  return (
    <div className="relative z-10 flex w-full flex-col items-center justify-center gap-8 text-center">
      <h1 className="inline-flex gap-2 text-4xl leading-tight tracking-tight md:text-6xl">
        Welcome AskHR
        <Icons.LogoColor className="size-6 md:size-8" />
      </h1>
      <p className="max-w-4xl text-xl">
        <span>Get instant answers to your HR questions,</span>
        <span className="text-muted-foreground">
          {' '}
          manage your leave requests, access payroll information, and update
          personal details &mdash; all through natural conversation with
          AI-powered HR agent
        </span>
      </p>
      <div className="flex w-full justify-center gap-4">
        <Button
          asChild
          className="group relative flex h-12 min-w-40 overflow-hidden bg-blue-500 px-5 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          <a href="/askhr">
            <MessageCircle className="size-4" />
            Ask HR questions
          </a>
        </Button>
        <Link href={'/demo'}>
          <Button className="h-12 min-w-40 px-5" variant="outline">
            View Demo
          </Button>
        </Link>
      </div>
    </div>
  )
}
