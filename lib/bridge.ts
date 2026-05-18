export interface NSBCInitPayload {
  token: string
  firmId: string
  clientId: string
  templateId: string | null
  serviceId: string
  userId: string
  mode: 'simple' | 'flow'
}

export const DEV_PAYLOAD: NSBCInitPayload = {
  token: 'dev-token',
  firmId: 'dev-firm-id',
  clientId: 'dev-client-id',
  templateId: null,
  serviceId: 'dev-service-id',
  userId: 'dev-user-id',
  mode: 'simple',
}

export function listenForInit(
  callback: (payload: NSBCInitPayload) => void,
  timeoutMs = 500
) {
  let resolved = false

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NSBC_INIT') {
      resolved = true
      callback(event.data.payload)
    }
  }

  window.addEventListener('message', handler)

  setTimeout(() => {
    if (!resolved) {
      console.warn('[NSBC] No NSBC_INIT received — using dev payload')
      callback(DEV_PAYLOAD)
    }
  }, timeoutMs)

  return () => window.removeEventListener('message', handler)
}

export function sendToParent(type: string, payload?: object) {
  window.parent.postMessage({ type, payload }, '*')
}