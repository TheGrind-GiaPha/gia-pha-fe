import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  BookOpen,
  Network,
  Download,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClans } from '@/lib/api/clans'
import { getApiErrorMessage } from '@/lib/api/errors'
import { createExportJob, getExportJobStatus, getClanExports, downloadExportPdf } from '@/lib/api/exports'
import { ExportType, ExportJobStatus, type ExportJob } from '@/types/export'

export function ExportPage() {
  const [selectedClanId, setSelectedClanId] = useState('')
  const [exportType, setExportType] = useState<ExportType>(ExportType.Book)
  const [pageSize, setPageSize] = useState('A4')
  const [activeJobId, setActiveJobId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Fetch Clans
  const { data: clans } = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  // Poll Active Job
  const { data: activeJob } = useQuery({
    queryKey: ['exportJob', activeJobId],
    queryFn: () => getExportJobStatus(activeJobId!),
    enabled: Boolean(activeJobId),
    refetchInterval: (query) => {
      const data = query.state.data
      if (!data) return 2000
      if (data.status === ExportJobStatus.Completed || data.status === ExportJobStatus.Failed) {
        return false // Dừng polling khi đã xong
      }
      return 2000 // Poll mỗi 2 giây
    },
  })

  // Fetch Clan's Past Exports
  const { data: pastExports, refetch: refetchExports } = useQuery({
    queryKey: ['clanExports', selectedClanId],
    queryFn: () => getClanExports(selectedClanId),
    enabled: Boolean(selectedClanId),
  })

  // Create Export Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      createExportJob(selectedClanId, {
        type: exportType,
        pageSize,
      }),
    onSuccess: (newJob) => {
      setActiveJobId(newJob.id)
      setErrorMsg(null)
      void refetchExports()
    },
    onError: (err) => setErrorMsg(getApiErrorMessage(err)),
  })

  async function handleDownload(job: ExportJob) {
    if (!job.fileName) return
    try {
      await downloadExportPdf(job.id, job.fileName)
    } catch (e) {
      alert('Không thể tải tệp: ' + getApiErrorMessage(e))
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Xuất phả ký & Phả đồ PDF" />

      {/* 1. Chọn dòng họ */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <label className="field-label font-medium" htmlFor="export-clan">
          Chọn dòng họ cần xuất
        </label>
        <select
          id="export-clan"
          className="text-input max-w-sm"
          value={selectedClanId}
          onChange={(e) => {
            setSelectedClanId(e.target.value)
            setActiveJobId(null)
            setErrorMsg(null)
          }}
        >
          <option value="">— Chọn dòng họ —</option>
          {clans?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedClanId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Cột trái: Cấu hình xuất */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-6">
              <h3 className="text-base font-semibold text-stone-900">1. Chọn loại ấn phẩm</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lựa chọn 1: Sách phả ký */}
                <div
                  onClick={() => {
                    setExportType(ExportType.Book)
                    setPageSize('A4')
                  }}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    exportType === ExportType.Book
                      ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <BookOpen className={`h-8 w-8 mb-3 ${exportType === ExportType.Book ? 'text-brand-700' : 'text-stone-500'}`} />
                  <h4 className="font-semibold text-stone-900">Sách Phả Ký (Book PDF)</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Trang bìa trang trọng, phả ký và quy ước dòng họ, bảng phả hệ phân chia theo từng đời, font Be Vietnam Pro chuẩn tiếng Việt.
                  </p>
                </div>

                {/* Lựa chọn 2: Phả đồ khổ lớn */}
                <div
                  onClick={() => {
                    setExportType(ExportType.Chart)
                    setPageSize('A0')
                  }}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                    exportType === ExportType.Chart
                      ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Network className={`h-8 w-8 mb-3 ${exportType === ExportType.Chart ? 'text-brand-700' : 'text-stone-500'}`} />
                  <h4 className="font-semibold text-stone-900">Phả Đồ Khổ Lớn (Vector A1/A0)</h4>
                  <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                    Thuật toán Tidy Tree vẽ vector đường kẻ vuông góc, tự động tách tờ theo Chi họ khi vượt quá khổ giấy, in khổ A0/A1 sắc nét.
                  </p>
                </div>
              </div>

              {/* Tùy chọn khổ giấy */}
              <div className="border-t border-stone-200 pt-5 space-y-3">
                <h3 className="text-base font-semibold text-stone-900">2. Cấu hình định dạng</h3>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <label className="field-label text-xs" htmlFor="page-size">
                      Khổ giấy
                    </label>
                    <select
                      id="page-size"
                      className="text-input w-40 text-sm"
                      value={pageSize}
                      onChange={(e) => setPageSize(e.target.value)}
                    >
                      {exportType === ExportType.Book ? (
                        <>
                          <option value="A4">Khổ A4 (Chuẩn sách)</option>
                          <option value="A3">Khổ A3</option>
                        </>
                      ) : (
                        <>
                          <option value="A0">Khổ A0 (1189 x 841 mm)</option>
                          <option value="A1">Khổ A1 (841 x 594 mm)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded border border-red-200 bg-red-50 p-3 text-red-700 text-xs">
                  {errorMsg}
                </div>
              )}

              <Button
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending}
                className="w-full gap-2"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang gửi yêu cầu...
                  </>
                ) : (
                  'Bắt đầu tạo bản xuất'
                )}
              </Button>
            </div>
          </div>

          {/* Cột phải: Tiến trình & Lịch sử xuất */}
          <div className="space-y-6">
            {/* Tiến trình xuất hiện tại */}
            {activeJob && (
              <div className="rounded-lg border border-brand-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-stone-900">Tiến trình tác vụ xuất</h4>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                      activeJob.status === ExportJobStatus.Completed
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeJob.status === ExportJobStatus.Failed
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800 animate-pulse'
                    }`}
                  >
                    {activeJob.status === ExportJobStatus.Completed
                      ? 'Hoàn thành'
                      : activeJob.status === ExportJobStatus.Failed
                        ? 'Thất bại'
                        : `Đang xử lý ${activeJob.progressPercentage}%`}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-500 rounded-full ${
                      activeJob.status === ExportJobStatus.Completed
                        ? 'bg-emerald-600'
                        : activeJob.status === ExportJobStatus.Failed
                          ? 'bg-red-600'
                          : 'bg-brand-600'
                    }`}
                    style={{ width: `${activeJob.progressPercentage}%` }}
                  />
                </div>

                {activeJob.status === ExportJobStatus.Completed && (
                  <div className="pt-2">
                    <Button onClick={() => handleDownload(activeJob)} className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800">
                      <Download className="h-4 w-4" />
                      Tải tệp PDF về máy ({((activeJob.fileSizeBytes || 0) / 1024).toFixed(0)} KB)
                    </Button>
                  </div>
                )}

                {activeJob.status === ExportJobStatus.Failed && (
                  <div className="text-xs text-red-600">
                    Lỗi: {activeJob.errorMessage || 'Không thể xuất tệp.'}
                  </div>
                )}
              </div>
            )}

            {/* Lịch sử ấn phẩm */}
            <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm space-y-3">
              <h4 className="font-semibold text-sm text-stone-900">Lịch sử bản xuất</h4>

              {!pastExports || pastExports.length === 0 ? (
                <p className="text-xs text-stone-500">Chưa có bản xuất nào cho dòng họ này.</p>
              ) : (
                <div className="divide-y divide-stone-100 max-h-80 overflow-y-auto">
                  {pastExports.map((exp) => (
                    <div key={exp.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                      <div className="truncate">
                        <p className="font-medium text-stone-800 truncate">
                          {exp.type === ExportType.Book ? '📖 Sách phả ký' : '🌳 Phả đồ lớn'}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {new Date(exp.createdAt).toLocaleDateString('vi-VN')} •{' '}
                          {((exp.fileSizeBytes || 0) / 1024).toFixed(0)} KB
                        </p>
                      </div>

                      {exp.status === ExportJobStatus.Completed ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(exp)}
                          className="p-1.5 rounded hover:bg-stone-100 text-brand-700 font-medium"
                          title="Tải về"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-stone-400">Đang chờ</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
