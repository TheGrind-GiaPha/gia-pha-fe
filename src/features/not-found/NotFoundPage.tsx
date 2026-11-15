import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-md py-20">
      <h1 className="text-3xl text-stone-900">Không tìm thấy trang</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Đường dẫn này không tồn tại hoặc bạn không có quyền truy cập.
      </p>
      <Link to="/" className="mt-6 inline-block text-sm text-brand-700 hover:underline">
        Về tổng quan
      </Link>
    </div>
  )
}
