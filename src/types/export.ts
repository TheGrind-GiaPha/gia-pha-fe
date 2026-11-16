export const ExportType = {
  Book: 0,
  Chart: 1,
} as const
export type ExportType = (typeof ExportType)[keyof typeof ExportType]

export const ExportJobStatus = {
  Queued: 0,
  Processing: 1,
  Completed: 2,
  Failed: 3,
} as const
export type ExportJobStatus = (typeof ExportJobStatus)[keyof typeof ExportJobStatus]

export interface CreateExportRequest {
  type: ExportType
  branchId?: string | null
  pageSize?: string
}

export interface ExportJob {
  id: string
  clanId: string
  type: ExportType
  branchId?: string | null
  status: ExportJobStatus
  progressPercentage: number
  fileName?: string | null
  fileSizeBytes?: number | null
  downloadUrl?: string | null
  errorMessage?: string | null
  createdAt: string
  finishedAt?: string | null
}
