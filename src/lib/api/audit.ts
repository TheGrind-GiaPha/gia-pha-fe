import { apiClient } from '@/lib/api/client'
import type { AuditPage, AuditQuery } from '@/types/audit'

export async function getClanAudit(
  clanId: string,
  params: AuditQuery = {},
): Promise<AuditPage> {
  const { data } = await apiClient.get<AuditPage>(`/clans/${clanId}/audit`, {
    params,
  })

  return data
}

export async function getPersonHistory(
  clanId: string,
  personId: string,
  params: AuditQuery = {},
): Promise<AuditPage> {
  const { data } = await apiClient.get<AuditPage>(
    `/clans/${clanId}/persons/${personId}/history`,
    { params },
  )

  return data
}
