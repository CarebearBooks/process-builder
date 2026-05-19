'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'

export const StartNode = memo(({ }: NodeProps) => (
  <div className="rounded-full border border-blue-500/40 bg-blue-500/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
    <Handle
      type="source"
      position={Position.Bottom}
      className="!w-3 !h-3 !bg-blue-500/40 !border-blue-400/50"
    />
    Start
  </div>
))
StartNode.displayName = 'StartNode'

export const EndNode = memo(({ }: NodeProps) => (
  <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
    <Handle
      type="target"
      position={Position.Top}
      className="!w-3 !h-3 !bg-emerald-500/40 !border-emerald-400/50"
    />
    End
  </div>
))
EndNode.displayName = 'EndNode'