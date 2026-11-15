export const ImportSource = {
  Excel: 0,
  Word: 1,
} as const
export type ImportSource = (typeof ImportSource)[keyof typeof ImportSource]

export const ImportBatchStatus = {
  Uploaded: 0,
  Parsing: 1,
  Parsed: 2,
  Committed: 3,
  Failed: 4,
} as const
export type ImportBatchStatus = (typeof ImportBatchStatus)[keyof typeof ImportBatchStatus]

export const ImportRowStatus = {
  New: 0,
  PossibleDuplicate: 1,
  Rejected: 2,
  Accepted: 3,
} as const
export type ImportRowStatus = (typeof ImportRowStatus)[keyof typeof ImportRowStatus]

export interface ParsedRowData {
  maDong?: string
  tempId?: string
  hoTen?: string
  fullName?: string
  gioiTinh?: string
  gender?: string | number
  ngaySinh?: string
  birth?: {
    year?: number | null
    month?: number | null
    day?: number | null
    calendar?: string
  }
  ngayMat?: string
  death?: {
    year?: number | null
    month?: number | null
    day?: number | null
    calendar?: string
  }
  loaiLich?: string
  maCha?: string
  fatherTempId?: string
  maMe?: string
  loaiCon?: string
  thuTuVo?: number | null
  spouses?: Array<{ fullName: string; rank?: number }>
}

export interface ImportRow {
  id: string
  batchId: string
  rowIndex: number
  extractedJson: string
  status: ImportRowStatus
  matchedPersonId?: string | null
  matchedPersonName?: string | null
  warnings?: string | null
  createdAt: string
}

export interface ImportBatch {
  id: string
  clanId: string
  source: ImportSource
  status: ImportBatchStatus
  fileName: string
  totalRows: number
  acceptedRowsCount: number
  consentGiven: boolean
  createdAt: string
  rows: ImportRow[]
}

export interface CommitResult {
  isPendingApproval: boolean
  changeRequestId?: string | null
  createdPersonsCount: number
  message: string
}
