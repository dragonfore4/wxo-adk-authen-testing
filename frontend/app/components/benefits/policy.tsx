'use client'

import { domAnimation, LazyMotion, m, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const messages = [
  {
    from: 'user',
    content: 'Tell me about you'
  },
  {
    from: 'assistant',
    content: [
      "Hi! I'm AskHR,",
      ' a generative AI worker. ',
      'Thank you for taking the ',
      'time to get know me better!',
      '\n\n',
      'Most importantly, ',
      "I'm not a search engine ",
      '— think of me as a colleague ',
      'you can have a conversation ',
      'with and ask questions in a natural way.'
    ].join(' ')
  },
  {
    from: 'user',
    content: 'What is the company policy on remote work?'
  },
  {
    from: 'assistant',
    content:
      'The company policy on remote work is that employees can work from home up to 2 days per week.'
  },
  {
    from: 'user',
    content: 'What is the company policy on dress code?'
  },
  {
    from: 'assistant',
    content:
      'The company policy on dress code is that employees should wear business casual attire.'
  }
]

const ONE_MS = 0.01
const MESSAGE_DELAY = 1.8
const SCROLL_DELAY = 800
const LOOP_DELAY = 3000
const RESET_DELAY = 500

export const PolicyGraphic = () => {
  const reference = useRef<HTMLDivElement>(null)
  const inView = useInView(reference, { once: true, amount: 'some' })
  const [completedMessages, setCompletedMessages] = useState<number[]>([])
  const [loopCount, setLoopCount] = useState(0)
  const [isResetting, setIsResetting] = useState(false)

  useEffect(() => {
    if (reference.current && completedMessages.length > 0) {
      const latestMessageIndex = Math.max(...completedMessages)
      const scrollTimeout = setTimeout(() => {
        const messageElement = reference.current?.querySelector(
          `[data-message-index="${latestMessageIndex}"]`
        )
        if (messageElement && reference.current) {
          const containerRect = reference.current.getBoundingClientRect()
          const messageRect = messageElement.getBoundingClientRect()
          const scrollTop = reference.current.scrollTop
          const targetScrollTop =
            scrollTop +
            (messageRect.top - containerRect.top) -
            containerRect.height / 2 +
            messageRect.height / 2

          reference.current.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          })
        }
      }, SCROLL_DELAY)

      return () => clearTimeout(scrollTimeout)
    }
  }, [completedMessages])

  useEffect(() => {
    if (completedMessages.length === messages.length && !isResetting) {
      const loopTimeout = setTimeout(() => {
        setIsResetting(true)

        if (reference.current) {
          reference.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          })
        }

        setTimeout(() => {
          setCompletedMessages([])
          setLoopCount(prev => prev + 1)
          setIsResetting(false)
        }, RESET_DELAY)
      }, LOOP_DELAY)

      return () => clearTimeout(loopTimeout)
    }
  }, [completedMessages, isResetting])

  const handleMessageComplete = (messageIndex: number) => {
    setCompletedMessages(prev => {
      if (!prev.includes(messageIndex)) {
        return [...prev, messageIndex]
      }
      return prev
    })
  }

  if (!inView) {
    return <div className="h-72 w-full" ref={reference} />
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="relative">
        <div className="pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b from-background to-transparent" />
        <div
          className="hide-scrollbar flex h-52 w-full flex-col gap-4 overflow-hidden p-6"
          ref={reference}
        >
          {messages.map((message, messageIndex) => (
            <m.div
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex gap-4',
                message.from === 'user' ? 'justify-end' : 'items-start'
              )}
              data-message-index={messageIndex}
              initial={{ opacity: 0, y: 20 }}
              key={`${message.from}-${messageIndex}-${loopCount}`}
              transition={{
                delay: messageIndex * MESSAGE_DELAY,
                duration: 0.3
              }}
            >
              <div
                className={cn(
                  'max-w-xs rounded-lg border p-4',
                  message.from === 'user' ? 'bg-foreground' : 'bg-card'
                )}
              >
                <p className="m-0 text-sm">
                  {[...message.content].map((char, charIndex) => (
                    <m.span
                      animate={{ opacity: 1 }}
                      className={cn(
                        'text-sm',
                        message.from === 'user'
                          ? 'text-background'
                          : 'text-foreground'
                      )}
                      initial={{ opacity: 0 }}
                      key={`${message.from}-${messageIndex}-${charIndex}-${loopCount}`}
                      onAnimationComplete={() => {
                        if (charIndex === message.content.length - 1) {
                          handleMessageComplete(messageIndex)
                        }
                      }}
                      transition={{
                        delay:
                          1 + messageIndex * MESSAGE_DELAY + charIndex * ONE_MS,
                        duration: 0.01
                      }}
                    >
                      {char}
                    </m.span>
                  ))}
                </p>
              </div>
            </m.div>
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-background to-transparent" />
      </div>
    </LazyMotion>
  )
}
