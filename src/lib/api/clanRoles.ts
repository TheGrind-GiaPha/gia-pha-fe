import { apiClient } from '@/lib/api/client'
import type { ClanRoleAssignment } from '@/types/clanRole'

export async function getClanRoles(clanId: string): Promise<ClanRoleAssignment[]> {
  const { data } = await apiClient.get<ClanRoleAssignment[]>(`/clans/${clanId}/roles`)
  return data
}

export async function assignClanRole(
  clanId: string,
  email: string,
  role: number,
): Promise<ClanRoleAssignment> {
  const { data } = await apiClient.post<ClanRoleAssignment>(`/clans/${clanId}/roles`, {
    email,
    role,
  })
  return data
}

export async function revokeClanRole(
  clanId: string,
  userId: string,
  role: number,
): Promise<void> {
  await apiClient.delete(`/clans/${clanId}/roles/${userId}/${role}`)
}
