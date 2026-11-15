import { apiClient } from './client'
import type { CreateExportRequest, ExportJob } from '@/types/export'

export async function createExportJob(
  clanId: string,
  request: CreateExportRequest,
): Promise<ExportJob> {
  const response = await apiClient.post<ExportJob>(`/clans/${clanId}/exports`, request)
  return response.data
}

export async function getExportJobStatus(jobId: string): Promise<ExportJob> {
  const response = await apiClient.get<ExportJob>(`/exports/${jobId}`)
  return response.data
}

export async function getClanExports(clanId: string): Promise<ExportJob[]> {
  const response = await apiClient.get<ExportJob[]>(`/clans/${clanId}/exports`)
  return response.data
}

export async function downloadExportPdf(jobId: string, fileName: string): Promise<void> {
  const response = await apiClient.get(`/exports/${jobId}/download`, {
    responseType: 'blob',
  })

  const blob = new Blob([response.data], { type: 'application/pdf' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
