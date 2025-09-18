'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Icons } from '@/components/icons'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useIsMobile } from '@/hooks/use-mobile'
import { useIsScroll } from '@/hooks/use-scroll'
import { cn } from '@/lib/utils'

type User = {
  id: string
  name: string
  email: string
  avatar: string
}
export const Header = () => {
  const isMobile = useIsMobile()
  const isScrolled = useIsScroll()
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check if user exists in localStorage
    const checkUser = () => {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          // Try to parse as JSON first
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } catch (_error) {
          // If parsing fails, treat as string (user ID)
          setUser({
            id: storedUser,
            name: 'User',
            email: '',
            avatar: 'https://github.com/edsml-kl121.png'
          })
        }
      } else {
        setUser(null)
      }
    }

    checkUser()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <header
      className={cn(
        'top-0 z-50 w-full bg-background transition-all duration-300 md:fixed',
        isScrolled && !isMobile && 'border-border border-b'
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-6">
          <Link className="flex gap-1" href="/">
            <span className="font-semibold text-xl">AskHR</span>
            <Icons.LogoColor className="size-3" />
          </Link>
        </div>

        <div className="flex items-center">
          <div className="flex items-center justify-end gap-3">
            <Button asChild className="group relative flex" variant="outline">
              <Link
                className="flex items-center"
                href="https://workday.com"
                target="_blank"
              >
                <Icons.Workday className="size-4" />
                Workday
              </Link>
            </Button>

            {user ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer border bg-accent">
                    <AvatarImage
                      src={user.avatar || 'https://github.com/edsml-kl121.png'}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0) || user.id?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium text-sm leading-none">
                        {user.name || 'User'}
                      </p>
                      <p className="text-muted-foreground text-xs leading-none">
                        {user.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/settings')}>
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                asChild
                className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
