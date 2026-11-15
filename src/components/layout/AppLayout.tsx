import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { to: '/clans', label: 'Dòng họ' },
  { to: '/persons', label: 'Thành viên' },
  { to: '/tree', label: 'Cây phả hệ' },
  { to: '/history', label: 'Lịch sử' },
  { to: '/approvals', label: 'Duyệt đề xuất' },
  { to: '/events', label: 'Sự kiện & giỗ' },
  { to: '/settings', label: 'Cài đặt' },
]

export function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
      <div
        className={cn(
          'fixed inset-0 z-30 bg-stone-900/20 lg:hidden',
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-stone-300 bg-white transition-transform lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-start justify-between border-b border-stone-300 px-4 py-5">
          <Link to="/" onClick={() => setIsSidebarOpen(false)}>
            <span className="text-xl leading-none text-stone-900">VGMS</span>
          </Link>
          <button
            type="button"
            className="rounded p-1 text-stone-500 hover:bg-stone-100 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {navigation.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'block border-l-2 px-4 py-2 text-sm transition-colors',
                  isActive
                    ? 'border-brand-700 bg-brand-50 text-brand-900'
                    : 'border-transparent text-stone-700 hover:border-stone-300 hover:bg-stone-50',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-stone-300 p-4">
          <Link to="/login" className="text-sm text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="flex h-14 items-center gap-3 border-b border-stone-300 px-4 lg:hidden">
          <button
            type="button"
            className="rounded p-1 text-stone-600 hover:bg-stone-100"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Mở menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="text-lg text-stone-900">
            VGMS
          </Link>
          <Link to="/login" className="ml-auto text-sm text-brand-700 hover:underline">
            Đăng nhập
          </Link>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
