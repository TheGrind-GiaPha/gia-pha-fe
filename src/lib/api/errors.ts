import axios from 'axios'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Dữ liệu gửi lên không hợp lệ.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu.',
  409: 'Dữ liệu xung đột.',
  413: 'File quá lớn so với giới hạn cho phép.',
  415: 'Định dạng dữ liệu không được hỗ trợ.',
  500: 'Máy chủ gặp lỗi. Vui lòng thử lại sau.',
}

/**
 * Chuyển lỗi từ axios về thông điệp tiếng Việt dễ hiểu.
 *
 * Quan trọng: chỉ báo "không kết nối được" khi THẬT SỰ không nhận được
 * phản hồi từ máy chủ (server tắt, sai địa chỉ, timeout, bị CORS chặn).
 * Còn khi máy chủ đã trả lỗi (4xx/5xx) thì phải đọc đúng nội dung lỗi đó.
 */
export function getApiErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : 'Có lỗi xảy ra. Vui lòng thử lại.'
  }

  // Không có response => lỗi mạng (mất kết nối / timeout / CORS).
  if (!error.response) {
    return 'Không kết nối được máy chủ API. Kiểm tra backend đang chạy chưa.'
  }

  const status = error.response.status
  const data = error.response.data

  // Ưu tiên nội dung lỗi cụ thể từ thân phản hồi.
  const detail = extractMessage(data)
  if (detail) {
    return detail
  }

  // Không có nội dung cụ thể => dùng thông điệp chung theo mã trạng thái.
  return STATUS_MESSAGES[status] ?? `Lỗi máy chủ (mã ${status}).`
}

function extractMessage(data: unknown): string | null {
  // Một số endpoint trả thẳng chuỗi JSON (vd: BadRequest("Ảnh tối đa 5MB.")).
  if (typeof data === 'string' && data.trim()) {
    return data
  }

  if (!data || typeof data !== 'object') {
    return null
  }

  const obj = data as Record<string, unknown>

  const detail = obj.detail
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  const title = obj.title
  if (typeof title === 'string' && title.trim()) {
    return title
  }

  const message = obj.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  // Lỗi validation: lấy thông báo đầu tiên.
  if (obj.errors && typeof obj.errors === 'object') {
    for (const value of Object.values(obj.errors)) {
      const messages = Array.isArray(value) ? value : [value]
      const first = messages.find((m): m is string => typeof m === 'string' && m.trim().length > 0)
      if (first) {
        return first
      }
    }
  }

  return null
}
