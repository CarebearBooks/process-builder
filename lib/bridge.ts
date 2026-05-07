export type NSBCInitPayload = {
  token: string
  firmId: string
  clientId: string
  templateId: string | null
  serviceId: string
  userId: string
  mode: 'simple' | 'flow'
}

export function listenForInit(callback: (payload: NSBCInitPayload) => void) {
  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NSBC_INIT') {
      callback(event.data.payload)
    }
  }
  window.addEventListener('message', handler)
  return () => window.removeEventListener('message', handler)
}

export function sendToParent(type: string, payload?: object) {
  window.parent.postMessage({ type, payload }, '*')
}