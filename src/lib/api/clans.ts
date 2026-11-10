import { apiClient } from '@/lib/api/client'
import type { Clan, CreateClanRequest } from '@/types/clan'

export async function getClans(search?: string): Promise<Clan[]> {
  const { data } = await apiClient.get<Clan[]>('/clans', {
    params: search ? { search } : undefined,
  })

  return data
}

export async function createClan(payload: CreateClanRequest): Promise<Clan> {
  const { data } = await apiClient.post<Clan>('/clans', payload)
  return data
}

export async function deleteClan(id: string): Promise<void> {
  await apiClient.delete(`/clans/${id}`)
}
