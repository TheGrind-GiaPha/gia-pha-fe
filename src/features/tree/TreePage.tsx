import { TreePine } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/PlaceholderPage'

export function TreePage() {
  return (
    <PlaceholderPage
      eyebrow="Hiển thị"
      title="Cây phả hệ"
      description="Cây tương tác nhiều đời, thu gọn theo chi, xem từ vị trí của tôi và tìm kiếm trong cây."
      icon={TreePine}
      items={[
        'React Flow hoặc d3 layout cho cây nhiều đời',
        'Thu gọn/mở rộng theo chi; center on me',
        'Hiển thị dâu/rể, con nuôi, người thừa tự',
        'Panel hồ sơ khi chọn một người',
        'Kiểm thử hiệu năng với cây 2.000 người',
      ]}
    />
  )
}
