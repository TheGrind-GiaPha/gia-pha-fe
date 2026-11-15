import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { login, register } from '@/lib/api/auth'
import { getApiErrorMessage } from '@/lib/api/errors'
import { setAuth } from '@/lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('Vui lòng nhập email và mật khẩu.')
      return
    }

    setIsSubmitting(true)
    try {
      const result =
        mode === 'login'
          ? await login(email.trim(), password)
          : await register(email.trim(), displayName.trim(), password)

      setAuth(result.token, result.user)
      navigate('/clans', { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center px-4 py-12">
      <Link to="/" className="text-xl text-stone-900">
        VGMS
      </Link>

      <h1 className="mt-8 text-3xl text-stone-900">
        {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
      </h1>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        {mode === 'login'
          ? 'Đăng nhập bằng email và mật khẩu để xem gia phả.'
          : 'Tạo tài khoản mới để bắt đầu.'}
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="field-label" htmlFor="auth-email">
            Email
          </label>
          <input
            id="auth-email"
            className="text-input"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ban@example.com"
            autoComplete="username"
          />
        </div>

        {mode === 'register' ? (
          <div>
            <label className="field-label" htmlFor="auth-name">
              Tên hiển thị
            </label>
            <input
              id="auth-name"
              className="text-input"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Nguyễn Văn A"
              autoComplete="name"
            />
          </div>
        ) : null}

        <div>
          <label className="field-label" htmlFor="auth-password">
            Mật khẩu
          </label>
          <input
            id="auth-password"
            className="text-input"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          />
        </div>

        {error ? (
          <p className="border-l-2 border-red-600 pl-3 text-sm text-red-800">{error}</p>
        ) : null}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
        </Button>
      </form>

      <button
        type="button"
        className="mt-4 text-left text-sm text-brand-700 hover:underline"
        onClick={() => {
          setMode(mode === 'login' ? 'register' : 'login')
          setError(null)
        }}
      >
        {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
      </button>

      <Link to="/public" className="mt-6 text-sm text-brand-700 hover:underline">
        Xem dòng họ công khai
      </Link>

      <Link to="/" className="mt-3 text-sm text-stone-500 hover:text-stone-800">
        Về trang chính
      </Link>
    </main>
  )
}
