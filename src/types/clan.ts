export interface Clan {
  id: string
  name: string
  description?: string | null
  createdAt: string
  updatedAt?: string | null
}

export interface CreateClanRequest {
  name: string
  description?: string
}
