import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon:        ReactNode
  title:       string
  description: string
  action?:     ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-4 bg-cream-dark rounded-2xl mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="font-bold text-forest text-base mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
