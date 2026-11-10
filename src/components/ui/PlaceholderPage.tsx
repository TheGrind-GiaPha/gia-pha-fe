import type { LucideIcon } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'

interface PlaceholderPageProps {
  eyebrow: string
  title: string
  description: string
  icon: LucideIcon
  items: string[]
}

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  icon,
  items,
}: PlaceholderPageProps) {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <EmptyState
          icon={icon}
          title="Module đang chờ chốt ERD"
          description="Phần khung đã sẵn sàng. Khi thống nhất mô hình dữ liệu và task, màn hình này sẽ được thay bằng chức năng thật."
        />

        <Card>
          <h2 className="text-sm font-semibold text-stone-900">Sẽ làm ở các bước tiếp theo</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item} className="flex gap-2.5 text-sm text-stone-600">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-600"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  )
}
