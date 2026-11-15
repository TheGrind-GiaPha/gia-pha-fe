import { PageHeader } from '@/components/ui/PageHeader'

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <div className="space-y-4">
      <PageHeader title={title} />
      <p className="text-sm text-stone-600">Chưa triển khai.</p>
    </div>
  )
}
