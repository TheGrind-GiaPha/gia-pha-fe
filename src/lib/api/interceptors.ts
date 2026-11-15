import { apiClient } from '@/lib/api/client'
import { clearAuth, getToken } from '@/lib/auth'

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token hết hạn / không hợp lệ: xóa phiên và về trang đăng nhập.
    if (error?.response?.status === 401 && window.location.pathname !== '/login') {
      clearAuth()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)
