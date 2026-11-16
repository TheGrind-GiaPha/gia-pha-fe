import { resolvePortraitUrl } from './api'

interface PersonAvatarProps {
  fullName: string
  portraitUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-12 w-12 text-base',
  md: 'h-16 w-16 text-xl',
  lg: 'h-28 w-28 text-3xl',
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?'
  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
}

export function PersonAvatar({ fullName, portraitUrl, size = 'md' }: PersonAvatarProps) {
  const resolved = resolvePortraitUrl(portraitUrl)
  const dims = sizeClasses[size]

  if (resolved) {
    return (
      <img
        src={resolved}
        alt={fullName}
        className={`${dims} shrink-0 rounded-xl border border-stone-200 object-cover shadow-sm`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${dims} flex shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 font-semibold text-brand-800`}
    >
      {getInitials(fullName)}
    </div>
  )
}
