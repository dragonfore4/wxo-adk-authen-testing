'use client'

import { domMax, LazyMotion, m, useDragControls, useInView } from 'motion/react'
import { type FC, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const payments: {
  title: string
  description: string
  amount: number
  left: string
  top: string
  sentiment: string
}[] = [
  {
    title: 'Base Salary',
    description: 'Monthly base salary before deductions',
    amount: 75_000,
    left: '5%',
    top: '-8%',
    sentiment: '💰'
  },
  {
    title: 'Performance Bonus',
    description: 'Annual performance-based bonus',
    amount: 15_000,
    left: '20%',
    top: '32%',
    sentiment: '🏆'
  },
  {
    title: 'Housing Allowance',
    description: 'Monthly housing allowance',
    amount: 12_000,
    left: '25%',
    top: '-8%',
    sentiment: '🏠'
  },
  {
    title: 'Transport Allowance',
    description: 'Monthly transportation allowance',
    amount: 6000,
    left: '35%',
    top: '15%',
    sentiment: '🚗'
  },
  {
    title: 'Health Insurance',
    description: 'Annual health insurance premium',
    amount: 8400,
    left: '3%',
    top: '53%',
    sentiment: '🏥'
  },
  {
    title: 'Retirement Plan',
    description: '401(k) employer contribution',
    amount: 7500,
    left: '45%',
    top: '-25%',
    sentiment: '📈'
  },
  {
    title: 'Tax Withholding',
    description: 'Federal and state tax deductions',
    amount: 18_000,
    left: '60%',
    top: '40%',
    sentiment: '🏛️'
  },
  {
    title: 'Social Security',
    description: 'Social security contributions',
    amount: 6200,
    left: '70%',
    top: '-15%',
    sentiment: '🛡️'
  },
  {
    title: 'Medicare',
    description: 'Medicare tax contributions',
    amount: 1450,
    left: '80%',
    top: '25%',
    sentiment: '💊'
  },
  {
    title: 'Other Benefits',
    description: 'Additional benefits and perks',
    amount: 5000,
    left: '15%',
    top: '60%',
    sentiment: '🎁'
  }
]

const DELAY = 1000
const DURATION = 2000

const DraggablePayroll: FC<(typeof payments)[number]> = ({
  title,
  description,
  amount,
  left,
  top,
  sentiment
}) => {
  const controls = useDragControls()
  const [ready, setReady] = useState(false)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    setTimeout(
      () => {
        setReady(true)
      },
      DELAY + Math.random() * DURATION
    )
  }, [])

  return (
    <m.div
      animate={{ scale: 1 }}
      className={cn(
        'absolute flex w-64 min-w-[80%] shrink-0 items-center gap-3 rounded-full border bg-card p-3',
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      drag
      dragConstraints={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      dragControls={controls}
      initial={{ scale: 0.5 }}
      onDragEnd={() => setDragging(false)}
      onDragStart={() => setDragging(true)}
      style={{ left, top }}
      transition={{ bounce: 0.5, type: 'spring' }}
    >
      <div className="relative shrink-0">
        {ready ? (
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-lg">
            {sentiment}
          </div>
        ) : (
          <div className="size-8 animate-pulse rounded-full bg-primary/10" />
        )}
      </div>
      <div className="flex w-full flex-row justify-between gap-1">
        <div className="grid">
          <p className="truncate font-medium text-foreground text-sm">
            {title}
          </p>
          <p className="truncate text-muted-foreground text-xs">
            {description}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <div className="font-mono text-xs">${amount.toLocaleString()}</div>
        </div>
      </div>
    </m.div>
  )
}

export const PayrollGraphic = () => {
  const reference = useRef<HTMLDivElement>(null)
  const inView = useInView(reference, { once: true, amount: 'all' })

  if (!inView) {
    return <div ref={reference} />
  }

  return (
    <div className="not-prose h-full w-full">
      <LazyMotion features={domMax}>
        {payments.map((item, index) => (
          <DraggablePayroll {...item} key={index.toString()} />
        ))}
      </LazyMotion>
    </div>
  )
}
