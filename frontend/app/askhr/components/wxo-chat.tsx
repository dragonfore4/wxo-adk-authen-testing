'use client'

import { CircleDashed } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { env } from '@/lib/env'

import type { PreSendEventPayload, WxoInstance } from '@/wxo-types' // ปรับ path ให้ตรงของคุณ
import { get } from 'http'

function isPreSendEvent(e: unknown): e is PreSendEventPayload {
  return (
    !!e &&
    typeof e === 'object' &&
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    (e as any).type === 'pre:send' &&
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    typeof (e as any).message?.message?.content === 'string'
  )
}

export const WxoChat = () => {
  const hostRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const navigateToHome = () => {
      window.location.href = '/'
    }

    const preSendHandler = (event: unknown, _instance: WxoInstance) => {
      if (!isPreSendEvent(event)) {
        return
      }

      const userId = localStorage.getItem('user')
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : 'emp001'

      if (event?.message?.message?.content) {
        event.message.message.content = `${event.message.message?.content} - ${userId}`
      }
    }

    const authTokenNeededHandler = async (event: unknown, instance: WxoInstance) => {
      // console.log("in kub")
      // console.log(event);

      // const result = await fetch("http://localhost:3001/");
      // if (result.ok) {
      //   console.log("okkkkkkkkkkkkk")
      //   const token = await result.text();
      //   event.authToken = token;
      //   // window.wxOConfiguration.token = token
      // }

    }

    const onChatLoad = (instance: WxoInstance) => {
      instance.on('pre:send', preSendHandler)
      instance.on("authTokenNeeded", authTokenNeededHandler);
    }

    const orchestrationID = env.NEXT_PUBLIC_ORCHESTRATION_ID
    const hostURL = env.NEXT_PUBLIC_ORCHESTRATION_HOST_URL
    const agentId = env.NEXT_PUBLIC_AGENT_ID
    const agentEnvironmentId = env.NEXT_PUBLIC_AGENT_ENVIRONMENT_ID

    const initWatsonX = async () => {
      try {
        window.wxOConfiguration = {
          orchestrationID,
          hostURL,
          rootElementID: 'chat-bot',
          showLauncher: true,
          chatOptions: {
            agentId,
            agentEnvironmentId,
            onLoad: onChatLoad
          },
          style: {
            headerColor: '#FFFFFF',
            userMessageBackgroundColor: '#D3D3D3',
            primaryColor: '#1F51FF'
          },
          layout: {
            form: 'fullscreen-overlay',
            showOrchestrateHeader: true
          }
        }

        const existing = document.querySelectorAll(
          'script[src*="wxoLoader.js"]'
        )

        if (existing.length > 0) {
          if (window.wxoLoader?.init) {
            window.wxoLoader.init()
            setIsLoading(false)
          }
        } else {
          const script = document.createElement('script')
          script.async = true
          script.src = `${window.wxOConfiguration.hostURL}/wxochat/wxoLoader.js?embed=true`
          document.head.appendChild(script)
          script.onload = () => {
            if (window.wxoLoader?.init) {
              window.wxoLoader?.init()
            }
          }

          const observer = new MutationObserver(_mutationsList => {
            const chatbotSection = document.getElementById('chat-bot')
            const clickBtn = document.querySelector('button.chatButton')
            const svgElement = document.querySelector('svg.minimize')
            const leftLogo = document.querySelector('a.cds--header__name')
            const headerBar = document.querySelectorAll('header')

            chatbotSection?.classList.add('hidden')
            if (clickBtn instanceof HTMLButtonElement) {
              clickBtn.click()
            }

            if (svgElement) {
              svgElement.addEventListener('click', navigateToHome)
            }

            if (leftLogo) {
              leftLogo.addEventListener('click', navigateToHome)

              observer.disconnect()
              setIsLoading(false)
              chatbotSection?.classList.remove('hidden')
              headerBar[1]?.classList.add('hidden')
            }
          })

          observer.observe(document.body, {
            childList: true,
            subtree: true
          })
        }
      } catch (_e) {
        // console.error('Watsonx init failed', _e)
        setIsLoading(false)
      }
    }

    // ฟังก์ชันที่ดึง JWT token จากเซิร์ฟเวอร์ก่อนที่จะโหลด chat
    const getIdentityToken = async () => {
      // เรียกไปที่เซิร์ฟเวอร์เพื่อขอ JWT
      const result = await fetch("http://localhost:3001/");
      window.wxOConfiguration.token = await result.text();
    }

    initWatsonX().then(async () => {
      getIdentityToken()
    })
    // getIdentityToken()

    // initWatsonX()
  }, [])

  return (
    <div>
      {isLoading ? (
        <div
          aria-live="polite"
          className="flex max-h-screen items-center justify-center"
        >
          <CircleDashed className="animate-spin duration-1000" size={32} />
        </div>
      ) : (
        <section
          className="rounded-xl border p-0"
          id="chat-bot"
          ref={hostRef}
        />
      )}
    </div>
  )
}
