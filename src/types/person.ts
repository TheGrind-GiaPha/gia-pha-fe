export interface FlexibleDate {
  year?: number | null
  month?: number | null
  day?: number | null
  calendar: number
  isLeapMonth: boolean
}

export interface Person {
  id: string
  clanId: string
  fullName: string
  huyName?: string | null
  gender: number
  birthDate?: FlexibleDate | null
  deathDate?: FlexibleDate | null
  generation: number
  path: string
  portraitUrl?: string | null
  hasHiddenChildren?: boolean
}

export interface PersonNode {
  person: Person
  children: PersonNode[]
}

export interface Spouse {
  unionId: string
  personId: string
  fullName: string
  rank: number
}

export interface PersonProfile {
  id: string
  clanId: string
  fullName: string
  huyName?: string | null
  tuName?: string | null
  thuyName?: string | null
  otherNames?: string | null
  gender: number
  birthDate?: FlexibleDate | null
  deathDate?: FlexibleDate | null
  isLiving: boolean
  generation: number
  branchId?: string | null
  privacyLevel: number
  portraitUrl?: string | null
  biography?: string | null
  burialPlace?: string | null
  burialMapUrl?: string | null
  contact?: string | null
  hasHiddenChildren?: boolean
  spouses: Spouse[]
  parents: Person[]
  children: Person[]
}

export interface PersonProfileRequest {
  fullName: string
  gender: number
  huyName?: string | null
  tuName?: string | null
  thuyName?: string | null
  otherNames?: string | null
  birthDate?: FlexibleDate | null
  deathDate?: FlexibleDate | null
  biography?: string | null
  burialPlace?: string | null
  burialMapUrl?: string | null
  contact?: string | null
  privacyLevel?: number
}

export interface AddChildItem {
  fullName: string
  gender: number
  birthDate?: FlexibleDate | null
  relationType: number
}

export interface AddChildrenRequest {
  children: AddChildItem[]
}

export const GenderLabel: Record<number, string> = {
  0: 'Nam',
  1: 'Nữ',
  2: 'Khác',
}

export const CalendarLabel: Record<number, string> = {
  0: 'Dương lịch',
  1: 'Âm lịch',
}

export const PrivacyLabel: Record<number, string> = {
  0: 'Công khai',
  1: 'Trong họ',
  2: 'Riêng tư',
}
