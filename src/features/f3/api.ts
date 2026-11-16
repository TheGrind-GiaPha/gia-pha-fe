import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import { getClans } from '@/lib/api/clans'
import { resolvePortraitUrl } from '@/lib/api/persons'

export { resolvePortraitUrl }

export interface SearchPerson {
  id: string
  clanId: string
  branchId?: string | null
  branchName: string
  fullName: string
  huyName?: string | null
  tuName?: string | null
  thuyName?: string | null
  gender: number
  generation: number
  isLiving: boolean
  birthYear?: number | null
  deathYear?: number | null
  portraitUrl?: string | null
  privacyLevel: number
  isRedacted: boolean
}

export interface ProfileRelation {
  personId: string
  fullName: string
  generation: number
  relationType: number
}

export interface ProfilePhoto {
  id: string
  url: string
  caption?: string | null
}

export interface Profile extends SearchPerson {
  clanStatus: number
  birthDateDisplay: string
  deathDateDisplay: string
  biography?: string | null
  burialPlace?: string | null
  burialMapUrl?: string | null
  phoneNumber?: string | null
  version: number
  canDirectEdit: boolean
  father?: ProfileRelation | null
  spouses: ProfileRelation[]
  children: ProfileRelation[]
  photos: ProfilePhoto[]
}

export interface SearchResult {
  items: SearchPerson[]
  page: number
  totalPages: number
  totalCount: number
}

export interface AnniversaryItem {
  personId: string
  fullName: string
  huyName?: string | null
  thuyName?: string | null
  generation: number
  branchId?: string | null
  branchName: string
  portraitUrl?: string | null
  lunarDay: number
  lunarMonth: number
  lunarYear: number
  lunarDateDisplay: string
  solarDate: string
  solarDateDisplay: string
  yearsSinceDeath: number
  isAdjustedFromLeapMonth: boolean
  isAdjustedFromDay30To29: boolean
  adjustmentNote?: string | null
}

export interface AnniversaryWarning {
  personId: string
  fullName: string
  reasonCode: string
  message: string
}

export interface AnniversaryCalendar {
  solarYear: number
  items: AnniversaryItem[]
  warnings: AnniversaryWarning[]
}

export interface KinshipPathNode {
  personId: string
  fullName: string
  gender: number
  generation: number
  isLiving: boolean
  portraitUrl?: string | null
  roleInPath: string
  stepLabel: string
  relationToNext?: string | null
}

export interface KinshipResult {
  fromPersonId: string
  toPersonId: string
  isOutOfScope: boolean
  outOfScopeReasonCode?: string | null
  outOfScopeMessage?: string | null
  commonAncestorId?: string | null
  upSteps: number
  downSteps: number
  generationDelta: number
  branchComparison: string
  spouseRole: string
  term: string
  fromCallsTo: string
  toCallsFrom: string
  regionalAliases: string[]
  summary: string
  adoptionNote?: string | null
  path: KinshipPathNode[]
}

export const myPersonKey = (clanId: string) => `vgms_my_person_${clanId}`
const SELECTED_CLAN_KEY = 'vgms_selected_clan_id'

export async function searchPeople(clanId: string, params: Record<string, unknown>) {
  const { data } = await apiClient.get<SearchResult>(`/clans/${clanId}/persons/search`, { params })
  return data
}

export async function getProfile(clanId: string, personId: string) {
  const { data } = await apiClient.get<Profile>(`/clans/${clanId}/persons/${personId}/profile`)
  return data
}

export async function getAnniversaries(clanId: string, params: Record<string, unknown>) {
  const { data } = await apiClient.get<AnniversaryCalendar>(`/clans/${clanId}/anniversaries`, {
    params,
  })
  return data
}

export async function downloadAnniversariesIcs(clanId: string, params: Record<string, unknown>) {
  const { data } = await apiClient.get<Blob>(`/clans/${clanId}/anniversaries.ics`, {
    params,
    responseType: 'blob',
  })
  return data
}

export async function getKinship(clanId: string, from: string, to: string) {
  const { data } = await apiClient.get<KinshipResult>(`/clans/${clanId}/kinship`, {
    params: { from, to },
  })
  return data
}

/**
 * Tự động chọn dòng họ đã dùng gần nhất hoặc mặc định "Nhà Nguyễn" để demo nhanh.
 */
export function usePreferredClan(initialClanId = '') {
  const [selectedClanId, setSelectedClanId] = useState<string>(
    () => initialClanId || localStorage.getItem(SELECTED_CLAN_KEY) || '',
  )

  const clansQuery = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  const clans = clansQuery.data
  const defaultClanId = useMemo(() => {
    if (!clans || clans.length === 0) return ''
    const nguyen = clans.find((c) => c.name.toLowerCase().includes('nhà nguyễn'))
    return nguyen?.id ?? clans[0].id
  }, [clans])

  const clanId =
    clans && clans.length > 0 && !clans.some((c) => c.id === selectedClanId)
      ? defaultClanId
      : selectedClanId

  function setClanId(nextId: string) {
    setSelectedClanId(nextId)
    if (nextId) {
      localStorage.setItem(SELECTED_CLAN_KEY, nextId)
    } else {
      localStorage.removeItem(SELECTED_CLAN_KEY)
    }
  }

  return { clanId, setClanId, clansQuery }
}
