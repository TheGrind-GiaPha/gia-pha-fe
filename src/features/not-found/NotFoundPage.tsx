import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass className="h-7 w-7" aria-hidden="true" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-stone-900">
        Không tìm thấy trang
      </h1>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        Đường dẫn này chưa được định nghĩa trong bản khung. Quay về tổng quan để tiếp tục.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white transition hover:bg-brand-800"
      >
        Về tổng quan
      </Link>
    </div>
  )
}
