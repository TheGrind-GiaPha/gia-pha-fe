import { apiClient } from '@/lib/api/client'
import type { PublicClan, PublicPersonNode } from '@/types/public'

export async function getPublicClans(): Promise<PublicClan[]> {
  const { data } = await apiClient.get<PublicClan[]>('/public/clans')
  return data
}

export async function getPublicTree(clanId: string, depth = 20): Promise<PublicPersonNode> {
  const { data } = await apiClient.get<PublicPersonNode>(`/public/clans/${clanId}/tree`, {
    params: { depth },
  })
  return data
}
