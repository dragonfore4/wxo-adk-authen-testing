import { CreditCard, FileText, FileUser } from 'lucide-react'
import { cn } from '@/lib/utils'

const defaultCards = [
  {
    icon: <FileUser className="size-4" />,
    title: 'Personal Details Update',
    description:
      'Update your name, contact information, address, and emergency contact details through simple requests.',
    date: 'HR Services',
    className:
      "[grid-area:stack] hover:-translate-y-10 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
  },
  {
    icon: <FileText className="size-4" />,
    title: 'Banking Information',
    description:
      'Update your bank account details, routing numbers, and direct deposit information for payroll.',
    date: 'HR Services',
    className:
      "[grid-area:stack] translate-x-12 translate-y-10 hover:-translate-y-1 before:absolute before:w-[100%] before:outline-1 before:rounded-xl before:outline-border before:h-[100%] before:content-[''] before:bg-blend-overlay before:bg-background/50 grayscale-[100%] hover:before:opacity-0 before:transition-opacity before:duration-700 hover:grayscale-0 before:left-0 before:top-0"
  },
  {
    icon: <CreditCard className="size-4" />,
    title: 'Emergency Contacts',
    description:
      'Add or modify emergency contact information including names, relationships, and phone numbers.',
    date: 'HR Services',
    className:
      '[grid-area:stack] translate-x-24 translate-y-20 hover:translate-y-10'
  }
]

export const InformationGraphic = () => {
  return (
    <div className="-ml-16 fade-in-0 grid animate-in place-items-center opacity-100 duration-700 [grid-template-areas:'stack']">
      {defaultCards.map(card => (
        <div
          className={cn(
            '-skew-y-[8deg] relative flex h-32 w-[22rem] select-none flex-col justify-between rounded-xl border p-4 font-mono backdrop-blur-sm transition-all duration-700',
            "after:-right-1 after:absolute after:top-[-5%] after:h-[110%] after:w-[20rem] after:bg-gradient-to-l after:from-background after:to-transparent after:content-['']",
            'hover:border-foreground/20 hover:bg-muted',
            '[&>*]:flex [&>*]:items-center [&>*]:gap-2',
            card.className
          )}
          key={card.title}
        >
          <div>
            {card.icon}
            <p className="font-medium text-sm">{card.title}</p>
          </div>
          <p className="text-balance text-xs">{card.description}</p>
          <p className="text-muted-foreground text-sm">{card.date}</p>
        </div>
      ))}
    </div>
  )
}
