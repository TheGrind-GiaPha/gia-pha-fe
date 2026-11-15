import { apiClient } from '@/lib/api/client'
import type { AddChildrenRequest, Person, PersonNode } from '@/types/person'

const apiOrigin = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
)

export function resolvePortraitUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${apiOrigin}${url}`
}

export async function getTree(clanId: string, rootId?: string, depth = 20): Promise<PersonNode> {
  const { data } = await apiClient.get<PersonNode>(`/clans/${clanId}/tree`, {
    params: { rootId, depth },
  })
  return data
}

export async function addChildren(
  clanId: string,
  fatherId: string,
  payload: AddChildrenRequest,
): Promise<Person[]> {
  const { data } = await apiClient.post<Person[]>(`/clans/${clanId}/persons/${fatherId}/children`, payload)
  return data
}

export async function deletePerson(
  clanId: string,
  personId: string,
  strategy: string,
  newFatherId?: string,
): Promise<void> {
  await apiClient.delete(`/clans/${clanId}/persons/${personId}`, {
    params: { strategy, newFatherId },
  })
}

export async function moveSubtree(
  clanId: string,
  personId: string,
  newFatherId: string,
): Promise<void> {
  await apiClient.post(`/clans/${clanId}/persons/${personId}/move`, { newFatherId })
}

export async function mergePersons(
  clanId: string,
  keepId: string,
  removeId: string,
): Promise<Person> {
  const { data } = await apiClient.post<Person>(`/clans/${clanId}/persons/${keepId}/merge/${removeId}`)
  return data
}
