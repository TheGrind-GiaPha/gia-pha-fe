export const ClanStatus = {
  Draft: 0,
  Published: 1,
} as const

export function clanStatusLabel(status: number): string {
  return status === ClanStatus.Published ? 'Đã công bố' : 'Bản nháp'
}

export interface Clan {
  id: string
  name: string
  description?: string | null
  status: number
  publishedAt?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface CreateClanRequest {
  name: string
  description?: string
}
