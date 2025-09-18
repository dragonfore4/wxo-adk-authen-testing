import { createEnv } from '@t3-oss/env-nextjs'
import { z } from 'zod'

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_ORCHESTRATION_ID: z.string(),
    NEXT_PUBLIC_ORCHESTRATION_HOST_URL: z.string(),
    NEXT_PUBLIC_AGENT_ID: z.string(),
    NEXT_PUBLIC_AGENT_ENVIRONMENT_ID: z.string()
  },
  runtimeEnv: {
    NEXT_PUBLIC_ORCHESTRATION_ID: process.env.NEXT_PUBLIC_ORCHESTRATION_ID,
    NEXT_PUBLIC_ORCHESTRATION_HOST_URL:
      process.env.NEXT_PUBLIC_ORCHESTRATION_HOST_URL,
    NEXT_PUBLIC_AGENT_ID: process.env.NEXT_PUBLIC_AGENT_ID,
    NEXT_PUBLIC_AGENT_ENVIRONMENT_ID:
      process.env.NEXT_PUBLIC_AGENT_ENVIRONMENT_ID
  }
})
