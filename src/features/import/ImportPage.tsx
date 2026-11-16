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
  ShieldCheck,
  History,
  Search,
  Pencil,
  ArrowRight,
  Info,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/api/errors'
import { usePreferredClan } from '@/features/f3/api'
import {
  downloadImportTemplate,
  uploadExcelImport,
  uploadWordImport,
  getImportBatch,
  getImportBatches,
  updateImportRow,
  commitImportBatch,
} from '@/lib/api/imports'
import {
  ImportSource,
  ImportRowStatus,
  ImportBatchStatus,
  type ImportRow,
  type ParsedRowData,
} from '@/types/import'
import { ClanStatus } from '@/types/clan'

export function ImportPage() {
  const queryClient = useQueryClient()
  const { clanId: selectedClanId, setClanId: setSelectedClanId, clansQuery } = usePreferredClan()
  const clans = clansQuery.data || []
  const currentClan = clans.find((c) => c.id === selectedClanId)

  const [activeBatchId, setActiveBatchId] = useState<string | null>(null)

  // Upload states
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [consentGiven, setConsentGiven] = useState(true)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [commitResult, setCommitResult] = useState<{ isPending: boolean; message: string } | null>(null)

  // Review & Staging state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [editingRow, setEditingRow] = useState<ImportRow | null>(null)
  const [editedData, setEditedData] = useState<ParsedRowData | null>(null)

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'new' | 'duplicate' | 'rejected'>('all')

  // Fetch History of Import Batches
  const { data: batchHistory, refetch: refetchHistory } = useQuery({
    queryKey: ['importBatches', selectedClanId],
    queryFn: () => getImportBatches(selectedClanId),
    enabled: Boolean(selectedClanId),
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
      setCommitResult(null)
      const initialSelected = new Set(
        newBatch.rows.filter((r) => r.status !== ImportRowStatus.Rejected).map((r) => r.id),
      )
      setSelectedRowIds(initialSelected)
      void refetchHistory()
    },
    onError: (err) => setUploadError(getApiErrorMessage(err)),
  })

  const uploadWordMutation = useMutation({
    mutationFn: (f: File) => uploadWordImport(selectedClanId, f, consentGiven),
    onSuccess: (newBatch) => {
      setActiveBatchId(newBatch.id)
      setFile(null)
      setUploadError(null)
      setCommitResult(null)
      const initialSelected = new Set(
        newBatch.rows.filter((r) => r.status !== ImportRowStatus.Rejected).map((r) => r.id),
      )
      setSelectedRowIds(initialSelected)
      void refetchHistory()
    },
    onError: (err) => setUploadError(getApiErrorMessage(err)),
  })

  // Update Row Mutation
  const updateRowMutation = useMutation({
    mutationFn: ({ rowId, json, status }: { rowId: string; json: string; status: ImportRowStatus }) =>
      updateImportRow(selectedClanId, activeBatchId!, rowId, json, status),
    onSuccess: () => {
      setEditingRow(null)
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
      void refetchHistory()
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
  const { validationErrors, missingFatherCodes } = useMemo(() => {
    if (!batch || !batch.rows) return { validationErrors: [], missingFatherCodes: new Set<string>() }

    const errors: string[] = []
    const missingFathers = new Set<string>()
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
        const isFatherInBatch = parsedRows.some(
          (p) => (p.data.maDong || p.data.tempId) === fatherCode,
        )

        if (isFatherInBatch && !selectedCodeSet.has(fatherCode)) {
          const childName = item.data.hoTen || item.data.fullName || `Dòng #${item.row.rowIndex}`
          errors.push(
            `Dòng '${childName}' (Dòng #${item.row.rowIndex}) có cha là mã '${fatherCode}' chưa được chọn.`,
          )
          missingFathers.add(fatherCode)
        }
      }
    }

    return { validationErrors: errors, missingFatherCodes: missingFathers }
  }, [batch, selectedRowIds])

  // Select helpers
  function toggleSelectAll(selectAll: boolean) {
    if (!batch) return
    if (selectAll) {
      setSelectedRowIds(new Set(batch.rows.map((r) => r.id)))
    } else {
      setSelectedRowIds(new Set())
    }
  }

  function selectOnlyValid() {
    if (!batch) return
    const validIds = batch.rows
      .filter((r) => r.status === ImportRowStatus.New || r.status === ImportRowStatus.Accepted)
      .map((r) => r.id)
    setSelectedRowIds(new Set(validIds))
  }

  function autoSelectMissingFathers() {
    if (!batch || missingFatherCodes.size === 0) return
    const next = new Set(selectedRowIds)
    for (const r of batch.rows) {
      const data = parseRow(r)
      const code = data.maDong || data.tempId
      if (code && missingFatherCodes.has(code)) {
        next.add(r.id)
      }
    }
    setSelectedRowIds(next)
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

  function handleOpenEdit(row: ImportRow) {
    setEditingRow(row)
    setEditedData(parseRow(row))
  }

  function handleSaveModalEdit() {
    if (!editingRow || !editedData) return
    updateRowMutation.mutate({
      rowId: editingRow.id,
      json: JSON.stringify(editedData),
      status: editingRow.status,
    })
  }

  // Filtered rows in batch
  const filteredRows = useMemo(() => {
    if (!batch?.rows) return []
    return batch.rows.filter((r) => {
      // Status filter
      if (statusFilter === 'new' && r.status !== ImportRowStatus.New) return false
      if (statusFilter === 'duplicate' && r.status !== ImportRowStatus.PossibleDuplicate) return false
      if (statusFilter === 'rejected' && r.status !== ImportRowStatus.Rejected) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const data = parseRow(r)
        const name = (data.hoTen || data.fullName || '').toLowerCase()
        const code = (data.maDong || data.tempId || '').toLowerCase()
        const father = (data.maCha || data.fatherTempId || '').toLowerCase()
        return name.includes(q) || code.includes(q) || father.includes(q)
      }

      return true
    })
  }, [batch?.rows, statusFilter, searchQuery])

  // Statistics count
  const stats = useMemo(() => {
    if (!batch?.rows) return { total: 0, newCount: 0, dupCount: 0, rejCount: 0 }
    return {
      total: batch.rows.length,
      newCount: batch.rows.filter((r) => r.status === ImportRowStatus.New).length,
      dupCount: batch.rows.filter((r) => r.status === ImportRowStatus.PossibleDuplicate).length,
      rejCount: batch.rows.filter((r) => r.status === ImportRowStatus.Rejected).length,
    }
  }, [batch?.rows])

  const isUploading = uploadExcelMutation.isPending || uploadWordMutation.isPending

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <PageHeader title="Nhập liệu Word / Excel" />
        <p className="text-sm text-stone-600 mt-1">
          Hệ thống bóc tách dữ liệu phả ký tự sự và bảng tính vào khu vực kiểm duyệt Staging có sự thẩm định của con người trước khi ghi vào phả hệ.
        </p>
      </div>

      {/* 1. Chọn Dòng họ làm việc & Thông tin xuất bản */}
      <div className="rounded-xl border border-stone-200/80 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1 max-w-md">
            <label className="field-label text-xs font-semibold text-stone-700 uppercase tracking-wider" htmlFor="clan-select">
              Dòng họ làm việc hiện tại
            </label>
            <div className="flex items-center gap-2">
              <select
                id="clan-select"
                className="text-input font-medium text-stone-900 border-stone-300 focus:border-brand-600"
                value={selectedClanId}
                onChange={(e) => {
                  setSelectedClanId(e.target.value)
                  setActiveBatchId(null)
                  setCommitResult(null)
                }}
              >
                {clans.length === 0 && <option value="">— Đang tải danh sách dòng họ —</option>}
                {clans.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.status === ClanStatus.Published ? '• [Đã xuất bản]' : '• [Bản nháp]'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentClan && (
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 ${
                  currentClan.status === ClanStatus.Published
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentClan.status === ClanStatus.Published ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
                <span>
                  {currentClan.status === ClanStatus.Published ? 'Dòng họ đã xuất bản' : 'Dòng họ đang soạn thảo (Bản nháp)'}
                </span>
              </div>

              <Button variant="secondary" onClick={handleDownloadTemplate} className="gap-2 text-xs shadow-sm">
                <Download className="h-4 w-4 text-emerald-700" />
                Tải mẫu Excel chuẩn (.xlsx)
              </Button>
            </div>
          )}
        </div>

        {/* Thông báo cơ chế duyệt nếu Clan đã Published */}
        {currentClan?.status === ClanStatus.Published && (
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-start gap-2.5 text-xs text-stone-600">
            <Info className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
            <p>
              <strong>Cơ chế bảo vệ phả hệ:</strong> Vì dòng họ này đã công bố chính thức, khi bạn bấm <em>Commit</em>, dữ liệu sẽ được tạo thành một <strong>Đề xuất thay đổi (ChangeRequest)</strong> để Ban quản trị / Người kiểm duyệt duyệt lần cuối trước khi ghi đè vào cây.
            </p>
          </div>
        )}
      </div>

      {/* 2. Quy trình làm việc 4 bước (Step Process Indicator) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 text-sm">
            1
          </div>
          <div className="text-xs">
            <p className="font-semibold text-stone-800">Chuẩn bị tệp dữ liệu</p>
            <p className="text-stone-500">Excel 10 cột hoặc Word theo đời</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 text-sm">
            2
          </div>
          <div className="text-xs">
            <p className="font-semibold text-stone-800">Tải lên & Phân tích Staging</p>
            <p className="text-stone-500">ClosedXML hoặc Gemini AI</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 text-sm">
            3
          </div>
          <div className="text-xs">
            <p className="font-semibold text-stone-800">Soát xét & Xử lý trùng</p>
            <p className="text-stone-500">Sửa trực tiếp, loại trừ bản ghi</p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-stone-200 bg-white flex items-center gap-3 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-brand-50 text-brand-700 font-bold flex items-center justify-center shrink-0 text-sm">
            4
          </div>
          <div className="text-xs">
            <p className="font-semibold text-stone-800">Thẩm định & Commit</p>
            <p className="text-stone-500">Cha trước con, bảo toàn cây</p>
          </div>
        </div>
      </div>

      {/* 3. Khu vực Tải lên Tệp (Upload Section) */}
      <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-base font-semibold text-stone-900 flex items-center gap-2">
              <Upload className="h-5 w-5 text-brand-600" />
              Tải lên tệp gia phả mới
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Hệ thống tự động phân loại tệp và kích hoạt bộ bóc tách tương ứng (ClosedXML cho Excel hoặc Gemini AI cho Word).
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
              .xlsx / .xls
            </span>
            <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 font-medium border border-blue-200">
              .docx (Word)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Dropzone chiếm 7 cột */}
          <div className="lg:col-span-7">
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
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-brand-500 bg-brand-50/50 scale-[0.99]'
                  : 'border-stone-300 hover:border-brand-500 hover:bg-stone-50/60 bg-stone-50/30'
              }`}
            >
              <div className="flex justify-center gap-2 mb-3">
                <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <FileText className="h-6 w-6" />
                </div>
              </div>

              <p className="text-sm font-semibold text-stone-800">
                Kéo thả tệp Word hoặc Excel vào đây
              </p>
              <p className="text-xs text-stone-500 mt-1">
                hoặc bấm vào ô bên dưới để chọn tệp từ máy tính
              </p>

              <input
                type="file"
                accept=".xlsx,.docx,.xls"
                className="mt-4 block w-full text-xs text-stone-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Cột 5: Tùy chọn, Cam kết bảo mật AI & Nút thực hiện */}
          <div className="lg:col-span-5 space-y-4">
            {file ? (
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 flex items-center gap-3.5">
                {file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls') ? (
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <FileSpreadsheet className="h-6 w-6" />
                  </div>
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-900 truncate">{file.name}</p>
                  <p className="text-xs text-stone-500">
                    {(file.size / 1024).toFixed(1)} KB •{' '}
                    {file.name.toLowerCase().endsWith('.docx') ? 'Tệp phả ký Word' : 'Bảng tính Excel'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                  title="Hủy chọn tệp"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-stone-200 text-stone-400 text-center text-xs">
                Chưa có tệp nào được chọn
              </div>
            )}

            {/* Điều khoản AI & che SĐT khi chọn file Word */}
            {file?.name.toLowerCase().endsWith('.docx') && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 space-y-2.5">
                <div className="flex items-start gap-2.5 text-blue-900">
                  <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      Bảo vệ dữ liệu & Trích xuất AI
                    </p>
                    <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                      Nội dung phả ký sẽ được cắt đoạn theo từng đời và gửi sang Google Gemini AI để cấu trúc hóa. 
                      Hệ thống tự động <strong>che số điện thoại</strong> trước khi gửi.
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1.5 border-t border-blue-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={(e) => setConsentGiven(e.target.checked)}
                    className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-blue-950">
                    Xác nhận đồng ý điều khoản bảo mật AI
                  </span>
                </label>
              </div>
            )}

            {uploadError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex items-start gap-2.5 text-red-700 text-xs">
                <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{uploadError}</span>
              </div>
            )}

            <Button
              onClick={handleStartUpload}
              disabled={!file || isUploading || (file.name.toLowerCase().endsWith('.docx') && !consentGiven)}
              className="w-full gap-2 py-3 text-sm font-semibold shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang bóc tách & phân tích Staging...
                </>
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  Bắt đầu phân tích & Nhập vào Staging
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Lịch sử các lô nhập gần đây của Dòng họ */}
      {batchHistory && batchHistory.length > 0 && (
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-stone-900 flex items-center gap-2">
              <History className="h-4 w-4 text-stone-500" />
              Lịch sử các đợt nhập của dòng họ ({batchHistory.length} đợt)
            </h4>
            <span className="text-xs text-stone-500">Bấm "Xem lại" để mở bảng soát xét của đợt tương ứng</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-stone-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-2.5">Thời gian</th>
                  <th className="p-2.5">Tên tệp</th>
                  <th className="p-2.5">Nguồn</th>
                  <th className="p-2.5 text-center">Số bản ghi</th>
                  <th className="p-2.5">Trạng thái</th>
                  <th className="p-2.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {batchHistory.slice(0, 5).map((h) => {
                  const isActive = h.id === activeBatchId
                  return (
                    <tr key={h.id} className={isActive ? 'bg-brand-50/50 font-medium' : 'hover:bg-stone-50/70'}>
                      <td className="p-2.5 whitespace-nowrap text-stone-500">
                        {new Date(h.createdAt).toLocaleString('vi-VN')}
                      </td>
                      <td className="p-2.5 font-medium text-stone-900 truncate max-w-xs">{h.fileName}</td>
                      <td className="p-2.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                            h.source === ImportSource.Excel
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {h.source === ImportSource.Excel ? 'Excel' : 'Word (AI)'}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {h.acceptedRowsCount > 0 ? `${h.acceptedRowsCount} / ${h.totalRows}` : h.totalRows}
                      </td>
                      <td className="p-2.5">
                        {h.status === ImportBatchStatus.Committed ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                            Đã commit vào cây
                          </span>
                        ) : h.status === ImportBatchStatus.Parsed ? (
                          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
                            Đã đọc vào Staging
                          </span>
                        ) : (
                          <span className="text-stone-500 bg-stone-50 px-2 py-0.5 rounded-full">Đang xử lý</span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveBatchId(h.id)
                            setCommitResult(null)
                          }}
                          className={`text-xs font-semibold hover:underline ${
                            isActive ? 'text-brand-800' : 'text-brand-600'
                          }`}
                        >
                          {isActive ? 'Đang mở' : 'Xem lại'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Bảng Staging Review & Inline Editing */}
      {isLoadingBatch && (
        <div className="p-16 text-center text-stone-500 bg-white rounded-xl border border-stone-200 shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-3 text-brand-600" />
          <p className="font-medium text-stone-800">Đang tải danh sách bản ghi Staging...</p>
          <p className="text-xs text-stone-400 mt-1">Hệ thống đang đối chiếu dữ liệu với phả hệ hiện tại</p>
        </div>
      )}

      {batch && (
        <div className="rounded-xl border border-stone-200 bg-white shadow-sm overflow-hidden space-y-4 p-6">
          {/* Header Bảng Soát xét & KPIs */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-stone-900">
                  Bảng soát xét dữ liệu Staging
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                  {batch.rows.length} đối tượng
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Lô nhập: <span className="font-mono text-stone-700">{batch.fileName}</span> • Nguồn:{' '}
                {batch.source === ImportSource.Excel ? 'Bảng tính Excel' : 'Tệp Word (Google Gemini)'} • Khởi tạo:{' '}
                {new Date(batch.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>

            {/* Quick KPI Stat Cards */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-xs text-stone-700">
                Tổng số: <strong className="font-semibold text-stone-900">{stats.total}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-xs text-blue-800">
                Mới: <strong className="font-semibold">{stats.newCount}</strong>
              </div>
              {stats.dupCount > 0 && (
                <div className="px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-xs text-amber-800">
                  Nghi trùng: <strong className="font-semibold">{stats.dupCount}</strong>
                </div>
              )}
              <div className="px-3 py-1.5 rounded-lg border border-brand-200 bg-brand-50 text-xs text-brand-900">
                Đã chọn: <strong className="font-bold">{selectedRowIds.size}</strong>
              </div>
            </div>
          </div>

          {/* Cảnh báo vi phạm toàn vẹn phả hệ (Tree Dependency Alert) */}
          {validationErrors.length > 0 && (
            <div className="rounded-xl border border-red-300 bg-red-50/80 p-4 space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5 text-red-900 font-semibold text-sm">
                  <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p>Phát hiện vi phạm phụ thuộc cha - con ({validationErrors.length} lỗi):</p>
                    <p className="text-xs font-normal text-red-700 mt-0.5">
                      Một số người con được chọn nhưng người cha trong file chưa được tích chọn. Để đảm bảo tính toàn vẹn của cây, cha phải luôn được tạo cùng con.
                    </p>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  onClick={autoSelectMissingFathers}
                  className="shrink-0 text-xs font-semibold bg-white border-red-300 text-red-800 hover:bg-red-50"
                >
                  <UserCheck className="h-4 w-4 mr-1 text-red-700" />
                  Tự động chọn các người cha còn thiếu
                </Button>
              </div>

              <ul className="list-disc list-inside text-xs text-red-700 pl-6 space-y-1">
                {validationErrors.slice(0, 3).map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
                {validationErrors.length > 3 && (
                  <li>...và {validationErrors.length - 3} trường hợp tương tự khác.</li>
                )}
              </ul>
            </div>
          )}

          {/* Thông báo kết quả commit */}
          {commitResult && (
            <div
              className={`rounded-xl p-4 flex items-start gap-3 text-sm ${
                commitResult.isPending
                  ? 'border border-blue-200 bg-blue-50 text-blue-900'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-900'
              }`}
            >
              <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-base">{commitResult.message}</p>
                {commitResult.isPending && (
                  <p className="text-xs mt-1 text-blue-700 leading-relaxed">
                    Yêu cầu đã được chuyển tới danh sách <strong>Duyệt đề xuất (Change Requests)</strong> của dòng họ. Người kiểm duyệt chỉ cần bấm "Phê duyệt" là toàn bộ nhân khẩu sẽ tự động xuất hiện trên Cây phả hệ.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Thanh lọc & Thao tác chọn nhanh */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2">
            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'all' ? 'bg-white shadow-xs text-stone-900 font-bold' : 'text-stone-600'
                  }`}
                >
                  Tất cả ({stats.total})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('new')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'new' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-stone-600'
                  }`}
                >
                  Mới ({stats.newCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('duplicate')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                    statusFilter === 'duplicate' ? 'bg-white shadow-xs text-amber-700 font-bold' : 'text-stone-600'
                  }`}
                >
                  Nghi trùng ({stats.dupCount})
                </button>
              </div>

              {/* Ô tìm kiếm */}
              <div className="relative">
                <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs rounded-lg border border-stone-200 pl-8 pr-3 py-1.5 w-48 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => toggleSelectAll(true)} className="text-xs py-1.5 px-3">
                Chọn tất cả
              </Button>
              <Button variant="secondary" onClick={() => toggleSelectAll(false)} className="text-xs py-1.5 px-3">
                Bỏ chọn
              </Button>
              <Button
                variant="secondary"
                onClick={selectOnlyValid}
                className="text-xs py-1.5 px-3 text-emerald-800 bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100"
              >
                Chỉ chọn dòng hợp lệ
              </Button>
            </div>
          </div>

          {/* Bảng dữ liệu Staging */}
          <div className="overflow-x-auto rounded-xl border border-stone-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50/90 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={batch.rows.length > 0 && selectedRowIds.size === batch.rows.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)}
                      className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4"
                    />
                  </th>
                  <th className="p-3 w-16">Mã</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3 w-24">Giới tính</th>
                  <th className="p-3 w-28">Năm sinh</th>
                  <th className="p-3 w-28">Năm mất</th>
                  <th className="p-3 w-24">Mã cha</th>
                  <th className="p-3">Trạng thái & Nghi trùng</th>
                  <th className="p-3 w-20 text-center">Sửa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-stone-400 text-xs">
                      Không tìm thấy bản ghi nào khớp với điều kiện lọc.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const data = parseRow(row)
                    const isSelected = selectedRowIds.has(row.id)
                    const isDuplicate = row.status === ImportRowStatus.PossibleDuplicate

                    const name = data.hoTen || data.fullName || '—'
                    const gender = data.gioiTinh || data.gender || 'Nam'
                    const birth = data.ngaySinh || data.birth?.year?.toString() || '—'
                    const death = data.ngayMat || data.death?.year?.toString() || '—'
                    const fatherCode = data.maCha || data.fatherTempId || '—'

                    return (
                      <tr
                        key={row.id}
                        className={`transition-colors ${
                          isSelected ? 'bg-brand-50/20' : ''
                        } ${isDuplicate ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-stone-50/80'}`}
                      >
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleRow(row.id)}
                            className="rounded border-stone-300 text-brand-600 focus:ring-brand-500 cursor-pointer h-4 w-4"
                          />
                        </td>
                        <td className="p-3 font-mono text-stone-500 text-[11px]">#{row.rowIndex}</td>

                        {/* Họ tên */}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                gender === 'Nữ'
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {name.charAt(0) || 'P'}
                            </div>
                            <div>
                              <p className="font-semibold text-stone-900">{name}</p>
                              {data.loaiCon && data.loaiCon !== 'Con ruột' && (
                                <span className="text-[10px] text-stone-500 font-normal">
                                  ({data.loaiCon})
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Giới tính */}
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              gender === 'Nữ'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {gender}
                          </span>
                        </td>

                        {/* Năm sinh */}
                        <td className="p-3 text-stone-700 font-medium">
                          {birth}
                          {data.birth?.calendar === 'Lunar' && (
                            <span className="text-[10px] text-amber-700 ml-1">(Âm)</span>
                          )}
                        </td>

                        {/* Năm mất */}
                        <td className="p-3 text-stone-600">
                          {death}
                          {data.death?.calendar === 'Lunar' && (
                            <span className="text-[10px] text-amber-700 ml-1">(Âm)</span>
                          )}
                        </td>

                        {/* Mã cha */}
                        <td className="p-3">
                          {fatherCode !== '—' ? (
                            <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-semibold border border-stone-200">
                              {fatherCode}
                            </span>
                          ) : (
                            <span className="text-stone-400">—</span>
                          )}
                        </td>

                        {/* Trạng thái & Nghi trùng */}
                        <td className="p-3">
                          {isDuplicate ? (
                            <div className="flex flex-col gap-1">
                              <span className="inline-flex items-center gap-1 text-amber-800 text-[11px] bg-amber-100/90 font-bold px-2 py-0.5 rounded-md w-fit">
                                <AlertTriangle className="h-3 w-3" />
                                Nghi trùng với cây
                              </span>
                              {row.warnings && (
                                <p className="text-[11px] text-amber-900 leading-tight" title={row.warnings}>
                                  {row.warnings}
                                </p>
                              )}
                            </div>
                          ) : row.status === ImportRowStatus.Accepted ? (
                            <span className="text-emerald-700 text-xs bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold">
                              Đã chấp nhận
                            </span>
                          ) : row.status === ImportRowStatus.Rejected ? (
                            <span className="text-stone-500 text-xs bg-stone-100 px-2.5 py-0.5 rounded-full font-medium">
                              Bỏ qua
                            </span>
                          ) : (
                            <span className="text-blue-700 text-xs bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full font-semibold">
                              Nhân khẩu mới
                            </span>
                          )}
                        </td>

                        {/* Thao tác Sửa */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(row)}
                            className="p-1.5 rounded-lg text-stone-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                            title="Chỉnh sửa thông tin dòng này"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Sticky Bottom Bar Commit */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-stone-200 bg-white">
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-stone-900">
                Đã chọn <span className="text-brand-700 text-base">{selectedRowIds.size}</span> / {batch.rows.length} người
              </p>
              <p className="text-xs text-stone-500">
                {validationErrors.length > 0
                  ? 'Vui lòng sửa các lỗi phụ thuộc cha - con trước khi commit.'
                  : 'Sẵn sàng ghi các nhân khẩu đã chọn vào hệ thống.'}
              </p>
            </div>

            <Button
              onClick={() => commitMutation.mutate()}
              disabled={selectedRowIds.size === 0 || validationErrors.length > 0 || commitMutation.isPending}
              className="gap-2 px-6 py-3 text-sm font-bold shadow-md"
            >
              {commitMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang ghi dữ liệu vào phả hệ...
                </>
              ) : currentClan?.status === ClanStatus.Published ? (
                'Tạo Đề xuất thay đổi (ChangeRequest)'
              ) : (
                'Commit trực tiếp vào cây gia phả'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Dòng Staging */}
      <Modal
        open={Boolean(editingRow)}
        title={`Chỉnh sửa thông tin dòng #${editingRow?.rowIndex || ''}`}
        onClose={() => {
          setEditingRow(null)
          setEditedData(null)
        }}
      >
        {editedData && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="field-label text-xs font-semibold">Họ và tên</label>
              <input
                type="text"
                className="text-input text-xs"
                value={editedData.hoTen || editedData.fullName || ''}
                onChange={(e) =>
                  setEditedData({
                    ...editedData,
                    hoTen: e.target.value,
                    fullName: e.target.value,
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-xs font-semibold">Giới tính</label>
                <select
                  className="text-input text-xs"
                  value={String(editedData.gioiTinh || editedData.gender || 'Nam')}
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
              </div>

              <div>
                <label className="field-label text-xs font-semibold">Mã cha (Mã dòng cha)</label>
                <input
                  type="text"
                  className="text-input text-xs font-mono"
                  placeholder="Ví dụ: 1 hoặc M01"
                  value={editedData.maCha || editedData.fatherTempId || ''}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      maCha: e.target.value,
                      fatherTempId: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-xs font-semibold">Năm sinh</label>
                <input
                  type="text"
                  className="text-input text-xs"
                  placeholder="Ví dụ: 1950"
                  value={editedData.ngaySinh || String(editedData.birth?.year || '')}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      ngaySinh: e.target.value,
                      birth: {
                        ...editedData.birth,
                        year: parseInt(e.target.value, 10) || null,
                      },
                    })
                  }
                />
              </div>

              <div>
                <label className="field-label text-xs font-semibold">Năm mất (để trống nếu còn sống)</label>
                <input
                  type="text"
                  className="text-input text-xs"
                  placeholder="Ví dụ: 2020"
                  value={editedData.ngayMat || String(editedData.death?.year || '')}
                  onChange={(e) =>
                    setEditedData({
                      ...editedData,
                      ngayMat: e.target.value,
                      death: {
                        ...editedData.death,
                        year: parseInt(e.target.value, 10) || null,
                      },
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="field-label text-xs font-semibold">Loại lịch</label>
                <select
                  className="text-input text-xs"
                  value={editedData.loaiLich || 'Dương lịch'}
                  onChange={(e) => setEditedData({ ...editedData, loaiLich: e.target.value })}
                >
                  <option value="Dương lịch">Dương lịch (Solar)</option>
                  <option value="Âm lịch">Âm lịch (Lunar)</option>
                </select>
              </div>

              <div>
                <label className="field-label text-xs font-semibold">Loại con</label>
                <select
                  className="text-input text-xs"
                  value={editedData.loaiCon || 'Con ruột'}
                  onChange={(e) => setEditedData({ ...editedData, loaiCon: e.target.value })}
                >
                  <option value="Con ruột">Con ruột (Biological)</option>
                  <option value="Con nuôi">Con nuôi (Adopted)</option>
                  <option value="Con thừa tự">Con thừa tự (Heir)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-stone-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingRow(null)
                  setEditedData(null)
                }}
              >
                Hủy
              </Button>
              <Button onClick={handleSaveModalEdit} disabled={updateRowMutation.isPending}>
                {updateRowMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
