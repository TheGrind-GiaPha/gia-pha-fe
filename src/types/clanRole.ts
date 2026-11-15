export interface ClanRoleAssignment {
  id: string
  userId: string
  email: string
  displayName: string
  clanId: string
  branchId?: string | null
  role: number
}

export const ClanRoleLabel: Record<number, string> = {
  0: 'Quản trị họ',
  1: 'Biên tập chi',
  2: 'Người duyệt',
  3: 'Thành viên',
}

export const ClanAdminRole = 0

export const ClanRoleOptions = [0, 1, 2, 3]
