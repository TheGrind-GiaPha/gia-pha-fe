import { ClipboardCheck } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/PlaceholderPage'

export function ApprovalsPage() {
  return (
    <PlaceholderPage
      eyebrow="Quản trị dữ liệu"
      title="Duyệt đề xuất"
      description="ChangeRequest, tóm tắt thay đổi bằng tiếng Việt, nút duyệt lớn trên điện thoại và audit log."
      icon={ClipboardCheck}
      items={[
        'Tạo đề xuất thêm/sửa/xóa person và quan hệ',
        'Tóm tắt tác động: ai, chi nào, đời nào, ảnh hưởng bao nhiêu người',
        'Không tự duyệt; escalate khi quá SLA',
        'Magic link Zalo/SMS cho người duyệt',
        'Audit log bất biến và khôi phục từng thay đổi',
      ]}
    />
  )
}
