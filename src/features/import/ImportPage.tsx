import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { getClans } from '@/lib/api/clans'
import { getApiErrorMessage } from '@/lib/api/errors'
import {
  downloadImportTemplate,
  uploadExcelImport,
  uploadWordImport,
  getImportBatch,
  updateImportRow,
  commitImportBatch,
} from '@/lib/api/imports'
import {
  ImportSource,
  ImportRowStatus,
  type ImportRow,
  type ParsedRowData,
} from '@/types/import'

export function ImportPage() {
  const queryClient = useQueryClient()
  const [selectedClanId, setSelectedClanId] = useState('')
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [consentGiven, setConsentGiven] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [commitResult, setCommitResult] = useState<{ isPending: boolean; message: string } | null>(null)

  // Review & Staging state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [editedData, setEditedData] = useState<ParsedRowData | null>(null)

  // Fetch Clans
  const { data: clans } = useQuery({
    queryKey: ['clans'],
    queryFn: () => getClans(),
  })

  // Fetch Active Batch
  const {
    data: batch,
    isLoading: isLoadingBatch,
    refetch: refetchBatch,
  } = useQuery({
    queryKey: ['importBatch', selectedClanId, activeBatchId],
    queryFn: () => getImportBatch(selectedClanId, activeBatchId!),
    enabled: Boolean(selectedClanId && activeBatchId),
  })

  // Upload Mutations
  const uploadExcelMutation = useMutation({
    mutationFn: (f: File) => uploadExcelImport(selectedClanId, f),
    onSuccess: (newBatch) => {
      setActiveBatchId(newBatch.id)
      setFile(null)
      setUploadError(null)
      // Mặc định chọn tất cả các dòng không bị Rejected
      const initialSelected = new Set(
        newBatch.rows.filter((r) => r.status !== ImportRowStatus.Rejected).map((r) => r.id),
      )
      setSelectedRowIds(initialSelected)
    },
    onError: (err) => setUploadError(getApiErrorMessage(err)),
  })

  const uploadWordMutation = useMutation({
    mutationFn: (f: File) => uploadWordImport(selectedClanId, f, consentGiven),
    onSuccess: (newBatch) => {
      setActiveBatchId(newBatch.id)
      setFile(null)
      setUploadError(null)
      const initialSelected = new Set(
        newBatch.rows.filter((r) => r.status !== ImportRowStatus.Rejected).map((r) => r.id),
      )
      setSelectedRowIds(initialSelected)
    },
    onError: (err) => setUploadError(getApiErrorMessage(err)),
  })

  // Update Row Mutation
  const updateRowMutation = useMutation({
    mutationFn: ({ rowId, json, status }: { rowId: string; json: string; status: ImportRowStatus }) =>
      updateImportRow(selectedClanId, activeBatchId!, rowId, json, status),
    onSuccess: () => {
      setEditingRowId(null)
      setEditedData(null)
      void refetchBatch()
    },
  })

  // Commit Mutation
  const commitMutation = useMutation({
    mutationFn: () => commitImportBatch(selectedClanId, activeBatchId!, Array.from(selectedRowIds)),
    onSuccess: (res) => {
      setCommitResult({
        isPending: res.isPendingApproval,
        message: res.message,
      })
      void refetchBatch()
      void queryClient.invalidateQueries({ queryKey: ['tree', selectedClanId] })
    },
    onError: (err) => setUploadError(getApiErrorMessage(err)),
  })

  // Template Download
  async function handleDownloadTemplate() {
    try {
      const blob = await downloadImportTemplate()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Genealogy_Import_Template.xlsx'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Không thể tải template mẫu: ' + getApiErrorMessage(e))
    }
  }

  // Handle File Upload
  function handleStartUpload() {
    if (!file || !selectedClanId) return
    setUploadError(null)
    setCommitResult(null)

    const lower = file.name.toLowerCase()
    if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) {
      uploadExcelMutation.mutate(file)
    } else if (lower.endsWith('.docx')) {
      if (!consentGiven) {
        setUploadError('Vui lòng xác nhận đồng ý điều khoản bảo mật AI trước khi tải lên file Word.')
        return
      }
      uploadWordMutation.mutate(file)
    } else {
      setUploadError('Chỉ hỗ trợ tệp định dạng .xlsx (Excel) hoặc .docx (Word).')
    }
  }

  // Parse row json helper
  function parseRow(row: ImportRow): ParsedRowData {
    try {
      const raw = JSON.parse(row.extractedJson) as Record<string, any>
      const birthObj = raw.birth || raw.Birth
      const deathObj = raw.death || raw.Death
      const birthYear =
        birthObj?.year ?? birthObj?.Year ?? (raw.ngaySinh || raw.NgaySinh ? String(raw.ngaySinh || raw.NgaySinh) : undefined)
      const deathYear =
        deathObj?.year ?? deathObj?.Year ?? (raw.ngayMat || raw.NgayMat ? String(raw.ngayMat || raw.NgayMat) : undefined)

      const rawGender = String(raw.gioiTinh || raw.GioiTinh || raw.gender || raw.Gender || 'Nam')
      const normGender =
        rawGender.toLowerCase() === 'female' || rawGender.toLowerCase() === 'nữ' || rawGender.toLowerCase() === 'nu'
          ? 'Nữ'
          : 'Nam'

      const fullName = String(raw.hoTen || raw.HoTen || raw.fullName || raw.FullName || '').trim()
      const code = String(raw.maDong ?? raw.MaDong ?? raw.tempId ?? raw.TempId ?? row.rowIndex).trim()
      const father = raw.maCha || raw.MaCha || raw.fatherTempId || raw.FatherTempId || undefined

      return {
        maDong: code,
        tempId: code,
        hoTen: fullName,
        fullName: fullName,
        gioiTinh: normGender,
        gender: normGender,
        ngaySinh: birthYear ? String(birthYear) : undefined,
        birth: {
          year: typeof birthYear === 'number' ? birthYear : parseInt(birthYear, 10) || null,
          calendar: birthObj?.calendar || birthObj?.Calendar || 'Solar',
        },
        ngayMat: deathYear ? String(deathYear) : undefined,
        death: {
          year: typeof deathYear === 'number' ? deathYear : parseInt(deathYear, 10) || null,
          calendar: deathObj?.calendar || deathObj?.Calendar || 'Solar',
        },
        maCha: father ? String(father).trim() : undefined,
        fatherTempId: father ? String(father).trim() : undefined,
        maMe: raw.maMe || raw.MaMe,
        loaiCon: raw.loaiCon || raw.LoaiCon || 'Con ruột',
        loaiLich: raw.loaiLich || raw.LoaiLich || 'Dương lịch',
        thuTuVo: raw.thuTuVo || raw.ThuTuVo,
        spouses: raw.spouses || raw.Spouses,
      }
    } catch {
      return {}
    }
  }

  // Tree Dependency Validation: Dòng được chọn mà cha chưa được chọn thì báo lỗi!
  const validationErrors = useMemo(() => {
    if (!batch || !batch.rows) return []

    const errors: string[] = []
    const parsedRows = batch.rows.map((r) => ({
      row: r,
      data: parseRow(r),
    }))

    const selectedCodeSet = new Set<string>()
    for (const item of parsedRows) {
      if (selectedRowIds.has(item.row.id)) {
        const code = item.data.maDong || item.data.tempId
        if (code) selectedCodeSet.add(code)
      }
    }

    for (const item of parsedRows) {
      if (!selectedRowIds.has(item.row.id)) continue

      const fatherCode = item.data.maCha || item.data.fatherTempId
      if (fatherCode) {
        // Kiểm tra xem cha có phải là một dòng trong lô này không
        const isFatherInBatch = parsedRows.some(
          (p) => (p.data.maDong || p.data.tempId) === fatherCode,
        )

        if (isFatherInBatch && !selectedCodeSet.has(fatherCode)) {
          const childName = item.data.hoTen || item.data.fullName || `Dòng #${item.row.rowIndex}`
          errors.push(
            `Dòng '${childName}' (Dòng #${item.row.rowIndex}) có cha là mã '${fatherCode}' chưa được chọn. Vui lòng chọn cả người cha.`,
          )
        }
      }
    }

    return errors
  }, [batch, selectedRowIds])

  // Select all / Deselect all
  function toggleSelectAll(selectAll: boolean) {
    if (!batch) return
    if (selectAll) {
      setSelectedRowIds(new Set(batch.rows.map((r) => r.id)))
    } else {
      setSelectedRowIds(new Set())
    }
  }

  function toggleRow(rowId: string) {
    const next = new Set(selectedRowIds)
    if (next.has(rowId)) {
      next.delete(rowId)
    } else {
      next.add(rowId)
    }
    setSelectedRowIds(next)
  }

  function handleStartEdit(row: ImportRow) {
    setEditingRowId(row.id)
    setEditedData(parseRow(row))
  }

  function handleSaveEdit(row: ImportRow) {
    if (!editedData) return
    updateRowMutation.mutate({
      rowId: row.id,
      json: JSON.stringify(editedData),
      status: row.status,
    })
  }

  const isUploading = uploadExcelMutation.isPending || uploadWordMutation.isPending

  return (
    <div className="space-y-6">
      <PageHeader title="Nhập liệu Word / Excel" />

      {/* 1. Chọn dòng họ */}
      <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
        <label className="field-label font-medium" htmlFor="clan-select">
          Chọn dòng họ làm việc
        </label>
        <div className="flex flex-wrap items-center gap-4">
          <select
            id="clan-select"
            className="text-input max-w-sm"
            value={selectedClanId}
            onChange={(e) => {
              setSelectedClanId(e.target.value)
              setActiveBatchId(null)
              setCommitResult(null)
            }}
          >
            <option value="">— Chọn dòng họ —</option>
            {clans?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.status === 1 ? 'Đã xuất bản' : 'Bản nháp'})
              </option>
            ))}
          </select>

          <Button variant="secondary" onClick={handleDownloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Tải mẫu Excel chuẩn (.xlsx)
          </Button>
        </div>
      </div>

      {selectedClanId && (
        <>
          {/* 2. Vùng tải lên tệp */}
          <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-stone-900 mb-3">Tải lên tệp gia phả mới</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Dropzone với hỗ trợ kéo thả thực tế */}
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  const dropped = e.dataTransfer.files?.[0]
                  if (dropped) setFile(dropped)
                }}
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-stone-300 hover:border-brand-500 bg-stone-50/50'
                }`}
              >
                <Upload className="h-10 w-10 mx-auto text-stone-400 mb-2" />
                <p className="text-sm font-medium text-stone-700">Kéo thả tệp hoặc bấm để chọn</p>
                <p className="text-xs text-stone-500 mt-1">Hỗ trợ tệp .xlsx (Excel) hoặc .docx (Word)</p>
                <input
                  type="file"
                  accept=".xlsx,.docx,.xls"
                  className="mt-4 block w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>

              {/* Tùy chọn & Xác nhận Consent */}
              <div className="space-y-4">
                {file && (
                  <div className="p-3 rounded border border-stone-200 bg-white flex items-center gap-3">
                    {file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? (
                      <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                    ) : (
                      <FileText className="h-6 w-6 text-blue-600" />
                    )}
                    <div className="flex-1 truncate">
                      <p className="text-sm font-medium text-stone-900 truncate">{file.name}</p>
                      <p className="text-xs text-stone-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}

                {file?.name.toLowerCase().endsWith('.docx') && (
                  <div className="rounded border border-amber-200 bg-amber-50 p-4 space-y-2">
                    <div className="flex items-start gap-2 text-amber-800">
                      <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold">Quy định Bảo mật & AI Trích xuất</p>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Tệp Word sẽ được cắt thành các đoạn theo đời và gửi tới Google Gemini AI để nhận diện phả hệ.
                          Hệ thống tự động che số điện thoại và thông tin liên lạc cá nhân trước khi xử lý.
                        </p>
                      </div>
                    </div>
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="rounded border-stone-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span className="text-xs font-medium text-stone-800">
                        Tôi xác nhận đại diện dòng họ cho phép trích xuất thông tin bằng AI
                      </span>
                    </label>
                  </div>
                )}

                {uploadError && (
                  <div className="rounded border border-red-200 bg-red-50 p-3 flex items-start gap-2 text-red-700 text-xs">
                    <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}

                <Button
                  onClick={handleStartUpload}
                  disabled={!file || isUploading || (file.name.toLowerCase().endsWith('.docx') && !consentGiven)}
                  className="w-full gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang phân tích dữ liệu...
                    </>
                  ) : (
                    'Bắt đầu phân tích & Nhập vào Staging'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 3. Bảng Staging Review & Inline Editing */}
          {isLoadingBatch && (
            <div className="p-12 text-center text-stone-500">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-brand-600" />
              Đang tải danh sách bản ghi staging...
            </div>
          )}

          {batch && (
            <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">
                    Bảng soát xét dữ liệu ({batch.rows.length} người)
                  </h3>
                  <p className="text-xs text-stone-500">
                    Nguồn: {batch.source === ImportSource.Excel ? 'Excel' : 'Word (AI trích xuất)'} • Tệp: {batch.fileName}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="secondary" onClick={() => toggleSelectAll(true)}>
                    Chọn tất cả
                  </Button>
                  <Button variant="secondary" onClick={() => toggleSelectAll(false)}>
                    Bỏ chọn
                  </Button>
                </div>
              </div>

              {/* Banner cảnh báo toàn vẹn cây */}
              {validationErrors.length > 0 && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-red-800 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Phát hiện vi phạm toàn vẹn phả hệ (Không thể commit):</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-red-700 pl-2 space-y-0.5">
                    {validationErrors.slice(0, 3).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                    {validationErrors.length > 3 && (
                      <li>...và {validationErrors.length - 3} lỗi ràng buộc khác.</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Thông báo kết quả commit */}
              {commitResult && (
                <div
                  className={`rounded-lg p-4 flex items-start gap-3 text-sm ${
                    commitResult.isPending
                      ? 'border border-blue-200 bg-blue-50 text-blue-900'
                      : 'border border-emerald-200 bg-emerald-50 text-emerald-900'
                  }`}
                >
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{commitResult.message}</p>
                    {commitResult.isPending && (
                      <p className="text-xs mt-1 text-blue-700">
                        Vui lòng chuyển tới mục 'Duyệt đề xuất' để người có thẩm quyền phê duyệt đưa vào phả hệ.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto rounded border border-stone-200">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-600">
                      <th className="p-3 w-10 text-center">Chọn</th>
                      <th className="p-3 w-16">Dòng</th>
                      <th className="p-3">Họ và tên</th>
                      <th className="p-3 w-24">Giới tính</th>
                      <th className="p-3 w-32">Năm sinh</th>
                      <th className="p-3 w-32">Năm mất</th>
                      <th className="p-3 w-28">Mã cha</th>
                      <th className="p-3">Trạng thái & Nghi trùng</th>
                      <th className="p-3 w-28 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {batch.rows.map((row) => {
                      const data = parseRow(row)
                      const isSelected = selectedRowIds.has(row.id)
                      const isEditing = editingRowId === row.id

                      const name = data.hoTen || data.fullName || '—'
                      const gender = data.gioiTinh || data.gender || 'Nam'
                      const birth = data.ngaySinh || data.birth?.year?.toString() || '—'
                      const death = data.ngayMat || data.death?.year?.toString() || '—'
                      const fatherCode = data.maCha || data.fatherTempId || '—'

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-stone-50/80 transition-colors ${
                            row.status === ImportRowStatus.PossibleDuplicate ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleRow(row.id)}
                              className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                          </td>
                          <td className="p-3 text-xs text-stone-500 font-mono">#{row.rowIndex}</td>

                          {/* Họ tên */}
                          <td className="p-3 font-medium text-stone-900">
                            {isEditing ? (
                              <input
                                type="text"
                                className="text-input py-1 text-xs"
                                value={editedData?.hoTen || editedData?.fullName || ''}
                                onChange={(e) =>
                                  setEditedData({
                                    ...editedData,
                                    hoTen: e.target.value,
                                    fullName: e.target.value,
                                  })
                                }
                              />
                            ) : (
                              name
                            )}
                          </td>

                          {/* Giới tính */}
                          <td className="p-3 text-stone-700">
                            {isEditing ? (
                              <select
                                className="text-input py-1 text-xs"
                                value={String(editedData?.gioiTinh || editedData?.gender || 'Nam')}
                                onChange={(e) =>
                                  setEditedData({
                                    ...editedData,
                                    gioiTinh: e.target.value,
                                    gender: e.target.value,
                                  })
                                }
                              >
                                <option value="Nam">Nam</option>
                                <option value="Nữ">Nữ</option>
                                <option value="Khác">Khác</option>
                              </select>
                            ) : (
                              String(gender)
                            )}
                          </td>

                          {/* Năm sinh */}
                          <td className="p-3 text-stone-600 text-xs">
                            {isEditing ? (
                              <input
                                type="text"
                                className="text-input py-1 text-xs"
                                value={editedData?.ngaySinh || String(editedData?.birth?.year || '')}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, ngaySinh: e.target.value })
                                }
                              />
                            ) : (
                              birth
                            )}
                          </td>

                          {/* Năm mất */}
                          <td className="p-3 text-stone-600 text-xs">
                            {isEditing ? (
                              <input
                                type="text"
                                className="text-input py-1 text-xs"
                                value={editedData?.ngayMat || String(editedData?.death?.year || '')}
                                onChange={(e) =>
                                  setEditedData({ ...editedData, ngayMat: e.target.value })
                                }
                              />
                            ) : (
                              death
                            )}
                          </td>

                          {/* Mã cha */}
                          <td className="p-3 text-xs font-mono text-stone-600">{fatherCode}</td>

                          {/* Trạng thái & Nghi trùng */}
                          <td className="p-3">
                            {row.status === ImportRowStatus.PossibleDuplicate ? (
                              <div className="flex items-center gap-1.5 text-amber-700 text-xs bg-amber-100/80 px-2.5 py-1 rounded-full w-fit">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span className="font-semibold">Nghi trùng</span>
                                {row.warnings && (
                                  <span className="text-[11px] text-amber-900 truncate max-w-xs" title={row.warnings}>
                                    ({row.warnings.slice(0, 40)}...)
                                  </span>
                                )}
                              </div>
                            ) : row.status === ImportRowStatus.Accepted ? (
                              <span className="text-emerald-700 text-xs bg-emerald-100 px-2.5 py-0.5 rounded-full font-medium">
                                Đã duyệt
                              </span>
                            ) : row.status === ImportRowStatus.Rejected ? (
                              <span className="text-stone-500 text-xs bg-stone-100 px-2.5 py-0.5 rounded-full font-medium">
                                Bỏ qua
                              </span>
                            ) : (
                              <span className="text-blue-700 text-xs bg-blue-50 px-2.5 py-0.5 rounded-full font-medium">
                                Mới
                              </span>
                            )}
                          </td>

                          {/* Thao tác */}
                          <td className="p-3 text-center">
                            {isEditing ? (
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(row)}
                                  className="text-xs font-semibold text-emerald-700 hover:underline"
                                >
                                  Lưu
                                </button>
                                <span>•</span>
                                <button
                                  type="button"
                                  onClick={() => setEditingRowId(null)}
                                  className="text-xs text-stone-500 hover:underline"
                                >
                                  Hủy
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartEdit(row)}
                                className="text-xs font-semibold text-brand-700 hover:underline"
                              >
                                Sửa
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Commit Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-200">
                <p className="text-sm text-stone-600">
                  Đã chọn: <strong className="text-stone-900">{selectedRowIds.size}</strong> / {batch.rows.length} người
                </p>

                <Button
                  onClick={() => commitMutation.mutate()}
                  disabled={selectedRowIds.size === 0 || validationErrors.length > 0 || commitMutation.isPending}
                  className="gap-2"
                >
                  {commitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang xử lý commit...
                    </>
                  ) : (
                    'Commit vào cây gia phả'
                  )}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
