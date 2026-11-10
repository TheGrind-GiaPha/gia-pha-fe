import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  Settings,
  ShieldCheck,
  TreePine,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard, end: true },
  { to: '/clans', label: 'Dòng họ', icon: Users },
  { to: '/persons', label: 'Thành viên', icon: Users },
  { to: '/tree', label: 'Cây phả hệ', icon: TreePine },
  { to: '/approvals', label: 'Duyệt đề xuất', icon: ClipboardCheck },
  { to: '/events', label: 'Sự kiện & giỗ', icon: CalendarDays },
  { to: '/settings', label: 'Cài đặt', icon: Settings },
]

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-stone-50">
      <div
        className={cn(
          'fixed inset-0 z-30 bg-stone-950/30 backdrop-blur-sm transition-opacity lg:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-stone-200 bg-white transition-transform lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-stone-100 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm">
            <TreePine className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-stone-900">VGMS</p>
            <p className="text-xs text-stone-500">Gia phả dòng họ Việt</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-lg p-2 text-stone-500 hover:bg-stone-100 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            Không gian làm việc
          </p>
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-800'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900',
                )
              }
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-100 p-4">
          <div className="rounded-2xl bg-stone-50 p-4">
            <div className="flex items-center gap-2 text-brand-700">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <p className="text-xs font-semibold uppercase tracking-wide">Dữ liệu có kiểm chứng</p>
            </div>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Mỗi thay đổi có người đề xuất, người duyệt và lịch sử khôi phục.
            </p>
          </div>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-stone-200/80 bg-stone-50/90 px-4 backdrop-blur sm:px-6 lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-stone-600 hover:bg-stone-200/70 lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 text-sm text-stone-500 sm:flex">
            <span className="font-medium text-stone-700">Không gian dòng họ</span>
            <span className="text-stone-300">/</span>
            <span>Bản khung MVP</span>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-200 sm:inline-flex">
              Chưa kết nối tài khoản
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white">
              TH
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
