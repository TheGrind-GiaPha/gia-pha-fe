import { apiClient } from './client'
import type { ImportBatch, ImportRow, CommitResult, ImportRowStatus } from '@/types/import'

export async function downloadImportTemplate(): Promise<Blob> {
  const response = await apiClient.get('/clans/00000000-0000-0000-0000-000000000000/imports/template', {
    responseType: 'blob',
  })
  return response.data
}

export async function uploadExcelImport(clanId: string, file: File): Promise<ImportBatch> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await apiClient.post<ImportBatch>(`/clans/${clanId}/imports/excel`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function uploadWordImport(
  clanId: string,
  file: File,
  consentGiven: boolean,
): Promise<ImportBatch> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('consentGiven', String(consentGiven))

  const response = await apiClient.post<ImportBatch>(`/clans/${clanId}/imports/word`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}

export async function getImportBatch(clanId: string, batchId: string): Promise<ImportBatch> {
  const response = await apiClient.get<ImportBatch>(`/clans/${clanId}/imports/${batchId}`)
  return response.data
}

export async function getImportBatches(clanId: string): Promise<ImportBatch[]> {
  const response = await apiClient.get<ImportBatch[]>(`/clans/${clanId}/imports`)
  return response.data
}

export async function updateImportRow(
  clanId: string,
  batchId: string,
  rowId: string,
  extractedJson: string,
  status: ImportRowStatus,
): Promise<ImportRow> {
  const response = await apiClient.put<ImportRow>(
    `/clans/${clanId}/imports/${batchId}/rows/${rowId}`,
    {
      extractedJson,
      status,
    },
  )
  return response.data
}

export async function commitImportBatch(
  clanId: string,
  batchId: string,
  acceptedRowIds: string[],
): Promise<CommitResult> {
  const response = await apiClient.post<CommitResult>(
    `/clans/${clanId}/import-batches/${batchId}/commit`,
    {
      acceptedRowIds,
    },
  )
  return response.data
}
