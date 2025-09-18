import { Benefits } from './components/benefits'
import { ChatButton } from './components/chat-button'
import { Expectations } from './components/expectations'
import { Hero } from './components/hero'

export default function Home() {
  return (
    <div className="grid gap-16 pt-8 pb-4 sm:gap-24 sm:pt-8 sm:pb-8 md:gap-32">
      <Hero />
      <Benefits />
      <Expectations />
      <ChatButton />
    </div>
  )
}
