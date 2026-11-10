import { CalendarDays } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/PlaceholderPage'

export function EventsPage() {
  return (
    <PlaceholderPage
      eyebrow="Nghi thức"
      title="Sự kiện & giỗ"
      description="Lịch âm dương, giỗ theo chi, nhắc trước và xuất .ics để đồng bộ lịch điện thoại."
      icon={CalendarDays}
      items={[
        'Chuyển âm ↔ dương theo thuật toán Hồ Ngọc Đức, UTC+7',
        'Giỗ lặp năm, xử lý tháng nhuận và ngày 29/30',
        'Nhắc trước 7/3/1 ngày; chỉ gửi cho đúng chi',
        'Xuất .ics; email/Zalo/SMS',
        'Digest tuần/tháng cho trưởng họ',
      ]}
    />
  )
}
