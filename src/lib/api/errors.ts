import axios from 'axios'

interface ProblemDetails {
  title?: string
  detail?: string
  status?: number
}

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ProblemDetails | undefined
    return data?.detail ?? data?.title ?? 'Không kết nối được API.'
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}
