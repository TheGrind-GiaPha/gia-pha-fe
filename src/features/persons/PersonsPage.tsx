import { Users } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/PlaceholderPage'

export function PersonsPage() {
  return (
    <PlaceholderPage
      eyebrow="Dữ liệu lõi"
      title="Thành viên"
      description="Hồ sơ con người, tên húy/tự/thụy, ngày âm dương, đa hôn phối và con nuôi/con thừa tự."
      icon={Users}
      items={[
        'Person + DTO + validation theo ERD đã chốt',
        'Tên húy/tự/thụy với mức hiển thị riêng',
        'Union có thứ bậc hôn phối; ParentChild có loại con',
        'Tính đời/chi tự động và kiểm tra chu trình',
        'Tìm kiếm không dấu, theo tên húy/tự/thụy',
      ]}
    />
  )
}
