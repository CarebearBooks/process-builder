'use client'

import { useBuilderStore } from '@/src/store/builderStore'
import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'


export const StartNode = memo((_: NodeProps) => {
  const { theme } = useBuilderStore()
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        padding: '5px 18px',
        borderRadius: 20,
        border: '1px solid rgba(59,130,246,0.4)',
        background: 'rgba(59,130,246,0.1)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase' as const,
        color: '#60a5fa',
        position: 'relative',
        cursor: 'default',
        userSelect: 'none' as const,
      }}
    >
      Start
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.3)',
          border: '2px solid rgba(59,130,246,0.5)',
          borderRadius: '50%',
        }}
      />
    </div>
  )
})
StartNode.displayName = 'StartNode'

export const EndNode = memo((_: NodeProps) => {
  const { theme } = useBuilderStore()
  const isDark = theme === 'dark'

  return (
    <div
      style={{
        padding: '5px 18px',
        borderRadius: 20,
        border: '1px solid rgba(16,185,129,0.4)',
        background: 'rgba(16,185,129,0.1)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase' as const,
        color: '#34d399',
        position: 'relative',
        cursor: 'default',
        userSelect: 'none' as const,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: isDark ? 'rgba(16,185,129,0.4)' : 'rgba(16,185,129,0.3)',
          border: '2px solid rgba(16,185,129,0.5)',
          borderRadius: '50%',
        }}
      />
      End
    </div>
  )
})
EndNode.displayName = 'EndNode'