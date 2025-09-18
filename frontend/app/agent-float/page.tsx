'use client'

import { useEffect, useRef } from 'react'
import { env } from '@/lib/env'

const FloatPage = () => {
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const orchestrationID = env.NEXT_PUBLIC_ORCHESTRATION_ID
    const hostURL = env.NEXT_PUBLIC_ORCHESTRATION_HOST_URL
    const agentId = env.NEXT_PUBLIC_AGENT_ID
    const agentEnvironmentId = env.NEXT_PUBLIC_AGENT_ENVIRONMENT_ID

    const initWatsonX = () => {
      try {
        window.wxOConfiguration = {
          orchestrationID, // Adds control over chat display mode (e.g., fullscreen)
          hostURL, // or region-specific host
          rootElementID: 'chat-bot',
          showLauncher: true,
          chatOptions: {
            agentId,
            agentEnvironmentId
          },

          style: {
            headerColor: '#F2F2F2',
            userMessageBackgroundColor: '#FF0000',
            primaryColor: '#DF0000'
          },
          layout: {
            form: 'float', // Options: float | custom | fullscreen-overlay - if not specified float is default
            showOrchestrateHeader: true, // Optional: shows top agent header bar
            width: '600px', // Optional: honored when form is float only
            height: '600px' // Optional: honored when form is float only
          }
        }

        const existing = document.querySelectorAll(
          'script[src*="wxoLoader.js"]'
        )

        if (existing.length > 0) {
          if (window.wxoLoader?.init) {
            window.wxoLoader.init()
          }
        } else {
          const script = document.createElement('script')
          script.async = true
          script.src = `${window.wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`
          script.onload = () => {
            if (window.wxoLoader?.init) {
              window.wxoLoader?.init()
            }
          }
          document.head.appendChild(script)
        }
      } catch (_e) {
        // console.error('Watsonx init failed', e)
      }
    }

    initWatsonX()
  }, [])
  return (
    <div className="space-y-4 p-6">
      <h1 className="font-semibold text-xl">Kemkai Page</h1>
      <section className="rounded-xl border p-0" id="chat-bot" ref={hostRef} />
      <div className="border">test</div>
    </div>
  )
}

export default FloatPage
