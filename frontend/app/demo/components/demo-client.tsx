'use client'

import { useState } from 'react'

const videos = [
  {
    id: 'compensation',
    title: 'Compensation Agent',
    description: 'Handle salaries, bonuses & benefits',
    link: 'https://pub-895c9f6911064cc98bb7bf8fd2053070.r2.dev/Compensation-agent.mp4'
  },
  {
    id: 'employee-info',
    title: 'Employee Info Agent',
    description: 'Access & update employee records',
    link: 'https://pub-895c9f6911064cc98bb7bf8fd2053070.r2.dev/Employee-Info-Agent.mp4'
  },
  {
    id: 'leave-management',
    title: 'Leave Management Agent',
    description: 'Manage vacation & time-off requests',
    link: 'https://pub-895c9f6911064cc98bb7bf8fd2053070.r2.dev/Leave-Management-agent.mp4'
  },
  {
    id: 'policy',
    title: 'Policy Agent',
    description: 'Navigate company policies & procedures',
    link: 'https://pub-895c9f6911064cc98bb7bf8fd2053070.r2.dev/Policy-Agent.mp4'
  }
]

const DemoClient = () => {
  const [active, setActive] = useState(videos[0].id)

  const examplesById: Record<string, { label: string; text: string }[]> = {
    compensation: [
      { label: 'Overview', text: 'คำนวณเงินเดือน โบนัส และสิทธิประโยชน์โดยอัตโนมัติ' },
      { label: 'Quick Action', text: 'ขอปรับเงินเดือน / ส่งคำขอโบนัส' }
    ],
    'employee-info': [
      { label: 'Overview', text: 'ค้นหาและอัปเดตข้อมูลพนักงาน เช่น ที่อยู่/ตําแหน่ง/ทีม' },
      { label: 'Quick Action', text: 'อัปเดตที่อยู่พนักงาน / เพิ่มประวัติการฝึกอบรม' }
    ],
    'leave-management': [
      {
        label: 'Overview',
        text: 'จัดการคำขอลา ตรวจสอบวันลา และอนุมัติหรือปฏิเสธคำขอ'
      },
      { label: 'Quick Action', text: 'สร้างคำขอลา พิมพ์แบบฟอร์มลาล่วงหน้า' }
    ],
    policy: [
      {
        label: 'Overview',
        text: 'ค้นหาแนวทางปฏิบัติ นโยบายองค์กร และคำอธิบายข้อกำหนด'
      },
      { label: 'Quick Action', text: 'ขอเอกสารนโยบายล่าสุด / สรุปเป็นย่อ' }
    ]
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Header / Navbar */}
      <div className="mb-12 grid grid-cols-2 items-center gap-3 rounded-full border border-gray-200 bg-white p-3 shadow-sm md:grid-cols-4">
        {videos.map(video => (
          <button
            className={`w-full rounded-full px-4 py-3 text-center font-medium transition-all duration-300 ${
              active === video.id
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }`}
            key={video.id}
            onClick={() => setActive(video.id)}
            type="button"
          >
            {video.title}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {(() => {
        const current = videos.find(v => v.id === active) || videos[0]
        return (
          <div
            className="fade-in-0 zoom-in-95 relative animate-in overflow-hidden rounded-2xl border bg-gradient-to-b from-primary/5 via-accent/5 to-background p-8 shadow-sm duration-300"
            key={active}
          >
            <div className="grid gap-10 md:grid-cols-5">
              <div className="space-y-6 md:col-span-3">
                <h2 className="flex items-center gap-3 font-semibold text-2xl tracking-tight">
                  {current.title}
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary text-xs">
                    Demo
                  </span>
                </h2>
                <p className="max-w-prose text-muted-foreground leading-relaxed">
                  {current.description}. พื้นที่นี้จะแสดงตัวอย่างการทำงาน (walkthrough),
                  quick actions และข้อมูลตัวอย่างของ agent
                  เพื่อให้เห็นภาพรวมการใช้งานได้อย่างรวดเร็ว
                </p>
                <div className="space-y-4">
                  {examplesById[current.id].map(box => (
                    <div
                      className="group rounded-xl border bg-card/50 p-4 backdrop-blur transition hover:shadow"
                      key={box.label}
                    >
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="font-medium text-muted-foreground text-sm">
                          {box.label}
                        </span>
                        <span className="text-[10px] text-primary/70 uppercase tracking-wide">
                          {current.id}
                        </span>
                      </div>
                      <div className="text-foreground/90 text-sm leading-relaxed">
                        {box.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex h-full flex-col gap-4 md:col-span-2">
                <div className="relative aspect-video h-full w-full overflow-hidden rounded-xl border bg-black/5">
                  {videos.find(v => v.id === active) && (
                    <video
                      autoPlay
                      className="absolute inset-0 h-full w-full object-cover"
                      controls
                      loop
                      muted
                      src={
                        videos.find(v => v.id === active)?.link ||
                        videos[0].link
                      }
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0" />
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default DemoClient
