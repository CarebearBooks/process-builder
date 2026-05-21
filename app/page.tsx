'use client'

import { useEffect } from 'react'
import { DEV_PAYLOAD, NSBCInitPayload } from '@/lib/bridge'
import BuilderShell from '@/components/builder/BuilderShell'
import { useBuilderStore } from '@/src/store/builderStore'

export default function Page() {
  const setInitPayload = useBuilderStore((s) => s.setInitPayload)
  const initPayload    = useBuilderStore((s) => s.initPayload)

  useEffect(() => {
    const params     = new URLSearchParams(window.location.search)
    const token      = params.get('token')
    const firmId     = params.get('firmId')
    const templateId = params.get('templateId') ?? null
    const serviceId  = params.get('serviceId')
    const mode       = (params.get('mode') ?? 'simple') as 'simple' | 'flow'

    if (token && firmId && serviceId) {
      const payload: NSBCInitPayload = {
        token,
        firmId,
        templateId,
        serviceId,
        mode,
      }
      setInitPayload(payload)
    } else {
      console.warn('[NSBC] No URL params — using dev payload')
      setInitPayload(DEV_PAYLOAD)
    }
  }, [setInitPayload])

  if (!initPayload) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0f1117]">
        <div className="text-sm text-zinc-500">Initializing builder…</div>
      </div>
    )
  }

  return <BuilderShell />
}

// 'use client'

// import { useEffect } from 'react'
// import { useBuilderStore } from '@/store/builderStore'
// import { DEV_PAYLOAD, NSBCInitPayload } from '@/lib/bridge'
// import BuilderShell from '@/components/Builder/BuilderShell'

// export default function Page() {
//   const setInitPayload = useBuilderStore((s) => s.setInitPayload)
//   const initPayload    = useBuilderStore((s) => s.initPayload)

//   useEffect(() => {
//     const params        = new URLSearchParams(window.location.search)
//     const token         = params.get('token')
//     const firmId        = params.get('firmId')
//     const templateId    = params.get('templateId') ?? null
//     const serviceId     = params.get('serviceId')
//     const mode          = (params.get('mode') ?? 'simple') as 'simple' | 'flow'
//     const serviceName     = params.get('service_name') ?? ''
//     const serviceVertical = params.get('service_vertical') ?? ''

//     if (token && firmId && serviceId) {
//       const payload: NSBCInitPayload = { token, firmId, templateId, serviceId, mode }
//       setInitPayload(payload)

//       // Set service context for breadcrumb display
//       if (serviceName) {
//         useBuilderStore.getState().setServiceContext(serviceId, serviceName, serviceVertical)
//       }
//     } else {
//       console.warn('[NSBC] No URL params — using dev payload')
//       setInitPayload(DEV_PAYLOAD)
//     }
//   }, [setInitPayload])

//   if (!initPayload) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-[#0f1117]">
//         <div className="text-sm text-zinc-500">Initializing builder…</div>
//       </div>
//     )
//   }

//   return <BuilderShell />
// }