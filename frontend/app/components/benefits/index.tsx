import { InformationGraphic } from './information'
import { LeaveGraphic } from './leave'
import { PayrollGraphic } from './payroll'
import { PolicyGraphic } from './policy'

const benefits = [
  {
    children: PolicyGraphic,
    description:
      'Get answers about HR policies, benefits plans, leave rules, probation periods, performance reviews, dress codes, travel policies, holidays, and working hours. Upload PDF documents for policy reference',
    title: 'General Information & Policy Q&A'
  },
  {
    children: LeaveGraphic,
    description:
      'Check your current leave balance, request time off, view leave history, and get updates on approval status. Manage vacation days, sick leave, and other time-off requests seamlessly',
    title: 'Leave Management'
  },
  {
    children: PayrollGraphic,
    description:
      'Request payslips, download tax forms, view salary information, and get answers about compensation packages, bonuses, and payroll schedules, Access all your financial documents securely',
    title: 'Compensation & Payroll Agent'
  },
  {
    children: InformationGraphic,
    description:
      'Easily update your personal details including name changes, phone numbers, addresses, emergency contacts, and banking information. Keep your HR records current with simple requests',
    title: 'Update Personal Information'
  }
]

export const Benefits = () => {
  return (
    <section className="grid gap-6 md:gap-12">
      <p className="text-balance text-center text-2xl tracking-tighter sm:text-3xl md:text-4xl">
        What AskHR can do?
      </p>

      <div className="isolate grid gap-4 lg:grid-cols-4">
        {benefits.map(benefit => (
          <div
            className="relative flex flex-col justify-start gap-2 overflow-hidden rounded-xl border bg-card p-4 sm:p-8"
            key={benefit.title}
          >
            <div className="relative z-10 h-52 w-full">
              {benefit.children && <benefit.children />}
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="z-10 mt-4 font-semibold text-xl">
                {benefit.title}
              </h3>
              <p className="max-w-sm text-pretty text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
