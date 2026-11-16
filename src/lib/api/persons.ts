import axios from 'axios'
import { apiClient } from '@/lib/api/client'
import type {
  AddChildrenRequest,
  Person,
  PersonNode,
  PersonProfile,
  PersonProfileRequest,
} from '@/types/person'

const apiOrigin = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
)

export function resolvePortraitUrl(url: string | null | undefined): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${apiOrigin}${url}`
}

// Họ chưa có người thì API trả 404; ta coi đó là "cây trống" thay vì lỗi.
export async function getTree(clanId: string, rootId?: string, depth = 20): Promise<PersonNode | null> {
  try {
    const { data } = await apiClient.get<PersonNode>(`/clans/${clanId}/tree`, {
      params: { rootId, depth },
    })
    return data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

export async function getPerson(clanId: string, personId: string): Promise<PersonProfile> {
  const { data } = await apiClient.get<PersonProfile>(`/clans/${clanId}/persons/${personId}`)
  return data
}

export async function createRoot(clanId: string, payload: PersonProfileRequest): Promise<Person> {
  const { data } = await apiClient.post<Person>(`/clans/${clanId}/persons`, payload)
  return data
}

export async function updatePerson(
  clanId: string,
  personId: string,
  payload: PersonProfileRequest,
): Promise<PersonProfile> {
  const { data } = await apiClient.put<PersonProfile>(`/clans/${clanId}/persons/${personId}`, payload)
  return data
}

/** Upload ảnh chân dung (jpg/png, tối đa 5MB), trả về URL tương đối. */
export async function uploadPortrait(
  clanId: string,
  personId: string,
  file: File,
): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  // Dùng postForm (multipart/form-data) thay vì post để tránh bị dính
  // Content-Type mặc định là application/json của apiClient.
  const { data } = await apiClient.postForm<string>(
    `/clans/${clanId}/persons/${personId}/portrait`,
    formData,
  )
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
