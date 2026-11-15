import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="py-8">
      <h2 className="text-base text-stone-900">{title}</h2>
      <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}
