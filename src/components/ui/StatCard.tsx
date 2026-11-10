import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tone?: 'brand' | 'amber' | 'stone'
}

const toneClasses = {
  brand: 'bg-brand-50 text-brand-700',
  amber: 'bg-amber-50 text-amber-700',
  stone: 'bg-stone-100 text-stone-600',
}

export function StatCard({ label, value, hint, icon: Icon, tone = 'brand' }: StatCardProps) {
  return (
    <div className="surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">{value}</p>
        </div>
        <div
          className={cn('flex h-10 w-10 items-center justify-center rounded-xl', toneClasses[tone])}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-xs text-stone-500">{hint}</p>
    </div>
  )
}
