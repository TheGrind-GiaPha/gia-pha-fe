import type { FlexibleDate } from './person'

export interface PublicClan {
  id: string
  name: string
  description?: string | null
}

export interface PublicPerson {
  id: string
  fullName: string
  gender: number
  generation: number
  isLiving: boolean
  birthDate?: FlexibleDate | null
  deathDate?: FlexibleDate | null
  portraitUrl?: string | null
}

export interface PublicPersonNode {
  person: PublicPerson
  children: PublicPersonNode[]
}
