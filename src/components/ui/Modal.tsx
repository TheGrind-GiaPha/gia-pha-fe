import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-stone-900/30" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex max-h-[calc(100vh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-6 py-4">
          <h2 className="text-lg text-stone-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-stone-500 hover:bg-stone-100"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
