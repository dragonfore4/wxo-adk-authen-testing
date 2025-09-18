import { CheckCircle2, FileText, MessageSquare } from 'lucide-react'
import type { ReactNode } from 'react'

type ExpectationStepProps = {
  step: number
  title: string
  description: string
  icon: ReactNode
}

const ExpectationStep = ({
  step,
  title,
  description,
  icon
}: ExpectationStepProps) => {
  return (
    <div className="flex flex-col items-center space-y-4 text-center">
      <div className="relative">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 font-bold text-2xl text-blue-600">
          {step}
        </div>
        <div className="-right-2 -top-2 absolute flex h-8 w-8 items-center justify-center rounded-full bg-blue-500">
          {icon}
        </div>
      </div>
      <h3 className="font-semibold text-blue-600 text-xl">{title}</h3>
      <p className="max-w-xs text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  )
}

export const Expectations = () => {
  const steps = [
    {
      step: 1,
      title: 'Ask Naturally',
      description:
        "Ask questions like 'How many vacation days do I have left?' or 'Can you send me my latest payslip?' - no special formatting needed",
      icon: <MessageSquare className="size-4 text-white" />
    },
    {
      step: 2,
      title: 'AI Processes',
      description:
        'Our AI accesses your HR records, company policies, and relevant documents to provide accurate, personalized responses',
      icon: <CheckCircle2 className="size-4 text-white" />
    },
    {
      step: 3,
      title: 'Get Results',
      description:
        'Receive immediate answers, document downloads, or confirmation that your request has been processed and submitted',
      icon: <FileText className="size-4 text-white" />
    }
  ]

  return (
    <section className="grid gap-6 md:gap-12">
      <p className="text-balance text-center text-2xl tracking-tighter sm:text-3xl md:text-4xl">
        What to expect from your AskHR?
      </p>
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
        {steps.map(step => (
          <ExpectationStep
            description={step.description}
            icon={step.icon}
            key={step.step}
            step={step.step}
            title={step.title}
          />
        ))}
      </div>
    </section>
  )
}
