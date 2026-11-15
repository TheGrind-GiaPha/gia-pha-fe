import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function LoginPage() {
  const [message, setMessage] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Chức năng gửi liên kết sẽ được nối ở task Auth.')
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-12">
      <Link to="/" className="text-xl text-stone-900">
        VGMS
      </Link>

      <h1 className="mt-8 text-3xl text-stone-900">Đăng nhập</h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        Nhập email hoặc số điện thoại. Hệ thống gửi một liên kết đăng nhập, không cần mật khẩu.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="login-contact">
            Email hoặc số điện thoại
          </label>
          <input
            id="login-contact"
            className="text-input"
            placeholder="ban@example.com"
            autoComplete="username"
          />
        </div>

        {message ? (
          <p className="border-l-2 border-amber-600 pl-3 text-sm text-amber-800">{message}</p>
        ) : null}

        <Button type="submit" className="w-full">
          Gửi liên kết đăng nhập
        </Button>
      </form>

      <Link to="/" className="mt-6 text-sm text-stone-500 hover:text-stone-800">
        Về trang chính
      </Link>
    </main>
  )
}
