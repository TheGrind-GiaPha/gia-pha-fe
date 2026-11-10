import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ShieldCheck,
  Sparkles,
  TreePine,
  Users,
} from 'lucide-react'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getClans } from '@/lib/api/clans'
import { formatDate } from '@/lib/utils'

const quickActions = [
  {
    to: '/tree',
    title: 'Cây phả hệ',
    description: 'Xem cấu trúc nhiều đời, thu gọn theo chi và tìm vị trí của bạn.',
    icon: TreePine,
  },
  {
    to: '/approvals',
    title: 'Duyệt đề xuất',
    description: 'Người duyệt xem tóm tắt thay đổi và bấm duyệt trên điện thoại.',
    icon: ClipboardCheck,
  },
  {
    to: '/events',
    title: 'Sự kiện & giỗ',
    description: 'Lịch âm, nhắc giỗ và các cuộc họp họ sắp tới.',
    icon: CalendarDays,
  },
  {
    to: '/settings',
    title: 'Phả đồ & phả ký',
    description: 'Xuất bản phả đồ PDF và cuốn gia phả để in, dâng nhà thờ họ.',
    icon: BookOpen,
  },
]

export function DashboardPage() {
  const { data: clans, isLoading } = useQuery({
    queryKey: ['clans', ''],
    queryFn: () => getClans(),
  })

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-brand-800 px-6 py-8 text-white shadow-soft sm:px-8 sm:py-10">
        <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-brand-700/60 blur-2xl" />
        <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-brand-50 ring-1 ring-inset ring-white/15">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Bản khung MVP · VGMS
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Gia phả có người giữ.
            <br />
            <span className="text-amber-200">Mỗi thay đổi có người duyệt.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-brand-50/85 sm:text-base">
            Nền tảng quản lý gia phả cho dòng họ đông người: dữ liệu có nguồn, thay đổi có kiểm
            chứng, người duyệt thao tác ngay trên điện thoại.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/clans"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
            >
              Xem dòng họ
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/tree"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 px-4 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Mở cây phả hệ
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Dòng họ đang quản lý"
          value={isLoading ? '…' : String(clans?.length ?? 0)}
          hint="Dữ liệu mẫu từ API /api/clans"
          icon={Users}
        />
        <StatCard
          label="Thành viên"
          value="—"
          hint="Sẽ có sau khi hoàn thiện ERD Person"
          icon={TreePine}
          tone="stone"
        />
        <StatCard
          label="Đề xuất chờ duyệt"
          value="—"
          hint="ChangeRequest + Approval workflow"
          icon={ClipboardCheck}
          tone="amber"
        />
        <StatCard
          label="Ngày giỗ sắp tới"
          value="—"
          hint="Lịch âm & nhắc lịch sẽ được gắn sau"
          icon={CalendarDays}
          tone="stone"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">Dòng họ của bạn</h2>
              <p className="mt-1 text-sm text-stone-500">Hai dòng họ mẫu đang có trong LocalDB.</p>
            </div>
            <Link to="/clans" className="text-sm font-medium text-brand-700 hover:text-brand-800">
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <Card className="animate-pulse">
                <div className="h-5 w-1/2 rounded bg-stone-100" />
                <div className="mt-3 h-4 w-3/4 rounded bg-stone-100" />
              </Card>
            ) : clans && clans.length > 0 ? (
              clans.slice(0, 3).map((clan) => (
                <Card key={clan.id} className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <TreePine className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-stone-900">{clan.name}</h3>
                      <Badge variant="brand">Đang dựng</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-stone-500">
                      {clan.description ?? 'Chưa có mô tả.'}
                    </p>
                    <p className="mt-2 text-xs text-stone-400">
                      Tạo ngày {formatDate(clan.createdAt)}
                    </p>
                  </div>
                  <Link
                    to="/tree"
                    className="hidden rounded-lg p-2 text-stone-400 transition hover:bg-stone-100 hover:text-brand-700 sm:block"
                    aria-label={`Mở cây phả hệ ${clan.name}`}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Card>
              ))
            ) : (
              <Card>
                <p className="text-sm text-stone-500">
                  Chưa có dòng họ nào. Vào mục Dòng họ để tạo bản ghi đầu tiên.
                </p>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-stone-900">Nguyên tắc dữ liệu</h2>
          <Card className="space-y-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Riêng tư mặc định',
                text: 'Không có link công khai. Người sống được che thông tin cá nhân.',
              },
              {
                icon: ClipboardCheck,
                title: 'Có người duyệt',
                text: 'Thay đổi sau khi ban hành đều đi qua ChangeRequest và audit log.',
              },
              {
                icon: BookOpen,
                title: 'Dữ liệu thuộc về dòng họ',
                text: 'Xuất Excel/JSON bất cứ lúc nào; không khóa dữ liệu sau khi hết hạn gói.',
              },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{text}</p>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">Đi tiếp từ đây</h2>
          <p className="mt-1 text-sm text-stone-500">
            Các module sẽ được hoàn thiện theo thứ tự ERD → API → UI → kiểm thử.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ to, title, description, icon: Icon }) => (
            <Link
              key={title}
              to={to}
              className="surface group p-5 transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-600 transition group-hover:bg-brand-50 group-hover:text-brand-700">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-stone-900">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-stone-500">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
