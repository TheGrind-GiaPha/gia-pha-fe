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
