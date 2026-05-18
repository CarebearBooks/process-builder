'use client'

import { useEffect } from 'react'
import { listenForInit } from '@/lib/bridge'
import { useBuilderStore } from '@/src/store/builderStore'
import BuilderShell from '@/components/builder/BuilderShell'


export default function Page() {
  const setInitPayload = useBuilderStore((s) => s.setInitPayload)
  const initPayload = useBuilderStore((s) => s.initPayload)

  useEffect(() => {
    const cleanup = listenForInit((payload) => {
      setInitPayload(payload)
    })
    return cleanup
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