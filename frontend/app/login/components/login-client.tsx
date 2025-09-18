'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const MIN_PASSWORD_LENGTH = 6

const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters')
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginClient() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const API_CALL_DELAY = 1000

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY))

      // Extract ID from email (everything before @)
      const userId = data.email.split('@')[0]

      // Mock user data - in real app this would come from API
      const userData = {
        id: userId,
        name: 'John Doe', // In real app, this would come from API
        email: data.email,
        avatar: 'https://github.com/edsml-kl121.png',
        role: 'Employee'
      }

      localStorage.setItem('user', JSON.stringify(userData))
      window.location.href = '/' // Redirect to home page after login
    } catch (_error) {
      // console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="relative z-10 flex w-full flex-col items-center justify-center gap-8 text-center"
      style={{ minHeight: 'calc(100vh - 16rem)' }}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <Icons.LogoColor className="size-8" />
          <h1 className="font-bold text-3xl">AskHR</h1>
        </div>
        <p className="text-muted-foreground">
          Access your HR dashboard and get instant answers to your questions
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        className="focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        placeholder="Enter your email"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        className="focus-visible:border-blue-500 focus-visible:ring-blue-500"
                        placeholder="Enter your password"
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full bg-blue-500 px-5 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="text-muted-foreground text-sm">
        Don't have an account?{' '}
        <a
          className="text-blue-600 hover:underline dark:text-blue-400"
          href="/register"
        >
          Sign up
        </a>
      </div>
    </div>
  )
}
