import type { ThemeProviderProps } from 'next-themes'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from './theme-provider'

type ProvidersProps = ThemeProviderProps

export const Providers = ({ children, ...props }: ProvidersProps) => {
  return (
    <ThemeProvider {...props}>
      <TooltipProvider>{children}</TooltipProvider>
      <Toaster />
    </ThemeProvider>
  )
}
