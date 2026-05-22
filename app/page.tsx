// 'use client'

// import { useEffect } from 'react'
// import { DEV_PAYLOAD, NSBCInitPayload } from '@/lib/bridge'
// import BuilderShell from '@/components/builder/BuilderShell'
// import { useBuilderStore } from '@/src/store/builderStore'


// export default function Page() {
//   const setInitPayload = useBuilderStore((s) => s.setInitPayload)
//   const initPayload    = useBuilderStore((s) => s.initPayload)

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search)

//     const token           = params.get('token')
//     const firmId          = params.get('firm_id')      // Bubble sends firm_id
//     const serviceId       = params.get('service_id')   // Bubble sends service_id
//     const templateId      = params.get('templateId') ?? null
//     const bubbleTemplateId= params.get('bubble_template_id') ?? ''
//     const mode            = (params.get('mode') ?? 'simple') as 'simple' | 'flow'
//     const serviceName     = params.get('service_name') ?? ''
//     const serviceVertical = params.get('service_ver')  ?? ''  // matches Bubble key name

//     // Log what we received so you can verify in browser console
//     console.log('[NSBC] URL params received:', {
//       token:            token ? token.slice(0, 20) + '…' : null,
//       firmId,
//       serviceId,
//       templateId,
//       bubbleTemplateId,
//       mode,
//       serviceName,
//       serviceVertical,
//     })

//     if (token && firmId && serviceId) {
//       const payload: NSBCInitPayload = {
//         token,
//         firmId,
//         templateId,
//         serviceId,
//         mode,
//         bubbleTemplateId,
//         serviceName,
//         serviceVertical,
//       }
//       setInitPayload(payload)

//       // Set service breadcrumb context
//       if (serviceName) {
//         useBuilderStore.getState().setServiceContext(
//           serviceId, serviceName, serviceVertical
//         )
//       }
//     } else {
//       console.warn('[NSBC] Missing required params — using dev payload')
//       console.warn('  token:', !!token, '| firmId:', !!firmId, '| serviceId:', !!serviceId)
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
'use client'

import { useEffect } from 'react'
import { DEV_PAYLOAD, NSBCInitPayload } from '@/lib/bridge'
import BuilderShell from '@/components/builder/BuilderShell'
import { useBuilderStore } from '@/src/store/builderStore'


export default function Page() {
  const setInitPayload = useBuilderStore((s) => s.setInitPayload)
  const initPayload    = useBuilderStore((s) => s.initPayload)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    const token           = params.get('token')
    const firmId           = params.get('firmId')
    const serviceId        = params.get('serviceId')
    const templateId      = params.get('templateId') ?? null
    const bubbleTemplateId= params.get('bubble_template_id') ?? ''
    const mode            = (params.get('mode') ?? 'simple') as 'simple' | 'flow'
    const serviceName     = params.get('service_name') ?? ''
    const serviceVertical  = params.get('service_vertical') ?? ''

    // Log what we received so you can verify in browser console
    console.log('[NSBC] URL params received:', {
      token:            token ? token.slice(0, 20) + '…' : null,
      firmId,
      serviceId,
      templateId,
      bubbleTemplateId,
      mode,
      serviceName,
      serviceVertical,
    })

    if (token && firmId && serviceId) {
      const payload: NSBCInitPayload = {
        token,
        firmId,
        templateId,
        serviceId,
        mode,
        bubbleTemplateId,
        serviceName,
        serviceVertical,
      }
      setInitPayload(payload)

      // Set service breadcrumb context
      if (serviceName) {
        useBuilderStore.getState().setServiceContext(
          serviceId, serviceName, serviceVertical
        )
      }
    } else {
      console.warn('[NSBC] Missing required params — using dev payload')
      console.warn('  token:', !!token, '| firmId:', !!firmId, '| serviceId:', !!serviceId)
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