import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, TreePine } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Đăng nhập sẽ được gắn ở task Auth/JWT tiếp theo.')
  }

  return (
    <div className="grid min-h-screen bg-stone-50 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-800 p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand-700/70 blur-2xl" />
        <div className="absolute -bottom-24 left-10 h-72 w-72 rounded-full bg-amber-300/20 blur-2xl" />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-inset ring-white/20">
            <TreePine className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-semibold">VGMS</p>
            <p className="text-xs text-brand-100/80">Gia phả dòng họ Việt</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
            Gia phả 4.0
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Giữ tên.
            <br />
            Giữ người.
            <br />
            Giữ điều đã kể.
          </h1>
          <p className="mt-5 text-sm leading-6 text-brand-50/80">
            Mỗi thay đổi có người đề xuất, người duyệt và lịch sử khôi phục. Dữ liệu thuộc về dòng
            họ, không thuộc về nền tảng.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-brand-100/70">
          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          Riêng tư mặc định · Không link công khai
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Về trang tổng quan
          </Link>

          <div className="surface p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-stone-900">Đăng nhập</h2>
              <p className="mt-2 text-sm text-stone-500">
                Bản khung chưa gắn Auth. Form này giữ chỗ cho OTP/magic link và JWT.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="field-label" htmlFor="login-email">
                  Email hoặc số điện thoại
                </label>
                <input
                  id="login-email"
                  className="text-input"
                  placeholder="ban@example.com"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="field-label" htmlFor="login-password">
                  Mật khẩu
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="text-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              {message ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  {message}
                </p>
              ) : null}

              <Button type="submit" className="w-full">
                Đăng nhập
              </Button>
            </form>

            <p className="mt-5 text-center text-xs text-stone-400">
              Chưa có tài khoản? Tính năng đăng ký sẽ làm cùng task Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
