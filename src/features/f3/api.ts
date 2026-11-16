import { apiClient } from '@/lib/api/client'
export interface SearchPerson { id:string; clanId:string; fullName:string; generation:number; branchId?:string; branchName:string; birthYear?:number; portraitUrl?:string; isRedacted:boolean }
export interface Profile extends SearchPerson { birthDateDisplay:string; deathDateDisplay:string; biography?:string; burialPlace?:string; burialMapUrl?:string; phoneNumber?:string; version:number; canDirectEdit:boolean; father?:{personId:string;fullName:string}; spouses:{personId:string;fullName:string}[]; children:{personId:string;fullName:string}[]; photos:{id:string;url:string;caption?:string}[] }
export interface SearchResult { items:SearchPerson[]; page:number; totalPages:number; totalCount:number }
export async function searchPeople(clan:string,params:Record<string,unknown>) { return (await apiClient.get<SearchResult>(`/clans/${clan}/persons/search`,{params})).data }
export async function getProfile(clan:string,person:string) { return (await apiClient.get<Profile>(`/clans/${clan}/persons/${person}/profile`)).data }
export const myPersonKey = (clan:string) => `vgms_my_person_${clan}`
