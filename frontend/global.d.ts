/*
  This file augments the global Window interface to declare properties
  used by the external Watson widget. An interface is required here
  for declaration merging with the built-in Window type.
*/

type WxOLayout = {
  form?: string
  customElement?: Element | null
  showOrchestrateHeader?: boolean
  width?: string
  height?: string
  [key: string]: unknown
}

type WxOConfiguration = {
  orchestrationID?: string
  hostURL?: string
  rootElementID?: string
  showLauncher?: boolean
  chatOptions?: {
    agentId?: string
    agentEnvironmentId?: string
    [k: string]: unknown
  }
  style?: { [k: string]: unknown }
  layout?: WxOLayout
  [key: string]: unknown
}

type WxoLoader = {
  init?: () => void
  [key: string]: unknown
}

declare global {
  // expose as globals (on window in browser) to avoid duplicate `Window` declarations
  var wxOConfiguration: WxOConfiguration | undefined
  var wxoLoader: WxoLoader | undefined

  // Note: we intentionally avoid declaring `interface Window` or `interface GlobalThis`
  // to prevent duplicate identifier errors with other provided d.ts files. The
  // globals below are sufficient for TypeScript to recognize these runtime
  // variables when accessed via `window` or `globalThis`.
}

export {}
