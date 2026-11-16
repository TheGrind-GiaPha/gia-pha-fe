import { apiClient } from '@/lib/api/client'
import type { AuditPage, AuditQuery, RestoreResult } from '@/types/audit'

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

export async function restoreAuditLog(
  clanId: string,
  logId: string,
): Promise<RestoreResult> {
  const { data } = await apiClient.post<RestoreResult>(
    `/clans/${clanId}/audit/${logId}/restore`,
  )

  return data
}
