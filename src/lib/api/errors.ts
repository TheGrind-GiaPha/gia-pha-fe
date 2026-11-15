import axios from 'axios'

interface ApiError {
  code?: string
  message?: string
  title?: string
  detail?: string
  status?: number
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiError | undefined
    return data?.message ?? data?.detail ?? data?.title ?? 'Không kết nối được API.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}
