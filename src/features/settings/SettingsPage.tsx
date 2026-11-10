import { Settings } from 'lucide-react'
import { PlaceholderPage } from '@/components/ui/PlaceholderPage'

export function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Quản trị"
      title="Cài đặt dòng họ"
      description="Thông tin clan, chi/nhánh, vai trò, quyền riêng tư, audit và xuất dữ liệu."
      icon={Settings}
      items={[
        'Thông tin clan: phả ký, gia huấn, nhà thờ họ',
        'Quản lý chi và phân quyền BranchEditor/Approver',
        'Chính sách riêng tư theo người và theo chi',
        'Audit log, lịch sử phân quyền, khôi phục',
        'Xuất Excel/JSON và xóa dữ liệu theo yêu cầu',
      ]}
    />
  )
}
