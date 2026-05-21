export interface NSBCInitPayload {
  token:      string
  firmId:     string
  templateId: string | null
  serviceId:  string
  mode:       'simple' | 'flow'
  clientId?:  string
  userId?:    string
}

export const DEV_PAYLOAD: NSBCInitPayload = {
  token:      'dev-token',
  firmId:     'dev-firm-id',
  templateId: null,
  serviceId:  'dev-service-id',
  mode:       'simple',
}

export function listenForInit(
  callback: (payload: NSBCInitPayload) => void,
  timeoutMs = 2000
) {
  let resolved = false

  const handler = (event: MessageEvent) => {
    if (event.data?.type === 'NSBC_INIT') {
      resolved = true
      callback(event.data.payload as NSBCInitPayload)
    }
  }

  window.addEventListener('message', handler)

  setTimeout(() => {
    if (!resolved) {
      console.warn('[NSBC Bridge] No NSBC_INIT — using dev payload')
      callback(DEV_PAYLOAD)
    }
  }, timeoutMs)

  return () => window.removeEventListener('message', handler)
}

export function sendToParent(type: string, payload?: object) {
  window.parent.postMessage({ type, payload }, '*')
}

export function notifySaved(templateId: string) {
  sendToParent('NSBC_SAVE_COMPLETE', { templateId })
}

export function notifyPublished(templateId: string) {
  sendToParent('NSBC_PUBLISH_COMPLETE', { templateId })
}

export function notifyError(message: string) {
  sendToParent('NSBC_ERROR', { message })
}