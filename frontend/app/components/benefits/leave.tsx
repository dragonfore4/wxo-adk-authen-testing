'use client'

import { faker } from '@faker-js/faker'
import {
  CalendarBody,
  CalendarItem,
  CalendarProvider
} from '@/components/calendar'
import { colors } from '@/lib/colors'

const FAKER_SEED = 12_345
faker.seed(FAKER_SEED)

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const statuses = [
  { id: faker.string.uuid(), name: 'Annual Leave', color: colors.emerald },
  { id: faker.string.uuid(), name: 'Sick Leave', color: colors.red },
  { id: faker.string.uuid(), name: 'Personal Leave', color: colors.blue },
  { id: faker.string.uuid(), name: 'Vacation Leave', color: colors.yellow }
]

const leaves = Array.from({ length: 20 })
  .fill(null)
  .map(() => {
    const randomStatus = faker.helpers.arrayElement(statuses)
    return {
      id: faker.string.uuid(),
      name: capitalize(randomStatus.name),
      startAt: faker.date.past({ years: 0.1, refDate: new Date() }),
      endAt: faker.date.future({ years: 0.1, refDate: new Date() }),
      status: randomStatus
    }
  })

export const LeaveGraphic = () => {
  return (
    <div className="not-prose h-full w-full overflow-hidden border border-t-0">
      <CalendarProvider>
        <CalendarBody features={leaves}>
          {({ feature }) => <CalendarItem feature={feature} key={feature.id} />}
        </CalendarBody>
      </CalendarProvider>
    </div>
  )
}
