// ชนิดของข้อความที่จะส่งออก
type ChatRole = 'user' | 'assistant' | 'system'
type OutgoingMessage = {
  role: ChatRole
  content: string
}

// payload ของ pre:send ตามที่คุณ log มา
export type PreSendEventPayload = {
  type: 'pre:send'
  message: {
    agent_id: string
    environment_id: string
    thread_id: string
    context: Record<string, unknown>
    additional_properties: Record<string, unknown>
    message: OutgoingMessage
  }
}

// อินสแตนซ์จาก widget — ระบุเท่าที่ใช้จริง
export type WxoInstance = {
  on: (
    event: string,
    handler: (e: unknown, instance: WxoInstance) => void
  ) => void
}
