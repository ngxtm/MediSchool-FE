import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { format } from 'date-fns'
import vi from 'date-fns/locale/vi'
import {
  CalendarDays,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Search,
  ChevronRight,
  FileText,
  Mail,
  Pencil
} from 'lucide-react'
import { Table } from 'antd'
import Loading from '@/components/Loading'
import ReturnButton from '../../../../components/ReturnButton.jsx'
import BulkActionBar from '@/components/BulkActionBar'
import { useEmailToast } from '@/hooks/useEmailToast'
import React, { useState, useMemo } from 'react'
import dayjs from 'dayjs'
import EditCheckupResultDialog from '../../../nurse/sub-pages/health-checkup/EditCheckupResultDialog.jsx'

function formatDate(dateInput) {
  if (!dateInput) return 'N/A'
  try {
    return format(new Date(dateInput), 'dd/MM/yyyy', { locale: vi })
  } catch {
    return 'N/A'
  }
}

function renderResultStatusBadge(status) {
  const baseClass = 'px-3 py-1 rounded-full text-sm font-semibold inline-block'

  switch (status) {
    case 'NORMAL':
      return <span className={`${baseClass} bg-green-100 text-green-700`}>Bình thường</span>
    case 'ABNORMAL':
      return <span className={`${baseClass} bg-yellow-100 text-yellow-800`}>Theo dõi</span>
    case 'SERIOUS':
      return <span className={`${baseClass} bg-red-100 text-red-700`}>Nguy hiểm</span>
    case 'NO_RESULT':
      return <span className={`${baseClass} bg-gray-100 text-gray-800`}>Chưa có kết quả</span>
    default:
      return <span className={`${baseClass} bg-gray-200 text-gray-600`}>Không rõ</span>
  }
}

export function parseDate(array) {
  if (!Array.isArray(array) || array.length < 3) return null
  const [year, month, day, hour = 0, minute = 0, second = 0] = array
  return new Date(year, month - 1, day, hour, minute, second)
}

export function useCheckupStats(id) {
  return useQuery({
    queryKey: ['checkup-stats', id],
    queryFn: () => api.get(`/health-checkup/${id}/stats`).then(res => res.data),
    enabled: !!id
  })
}

export default function ManagerHealthCheckupDetail() {
  const [editingResultId, setEditingResultId] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const { id } = useParams()
  const { data: stats } = useCheckupStats(id)
  const totalSent = stats?.totalSent ?? 0
  const totalReplied = stats?.totalReplied ?? 0
  const totalNotReplied = stats?.totalNotReplied ?? 0
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)

  // Selection state variables for bulk actions
  const [selectedConsents, setSelectedConsents] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  // Import and configure useEmailToast hook with teal theme
  const { sendEmailWithProgress, isSending } = useEmailToast('teal')

  const isConsent = location.pathname.endsWith('/consents')
  const isResult = location.pathname.endsWith('/results')

  const { data: eventData, isLoading } = useQuery({
    queryKey: ['health-checkup', id],
    queryFn: () => api.get(`/health-checkup/${id}`).then(res => res.data)
  })

  const { data: categoryList = [] } = useQuery({
    queryKey: ['checkup-categories', id],
    queryFn: () => api.get(`/checkup-categories/by-event/${id}`).then(res => res.data)
  })

  const { data: consentList = [] } = useQuery({
    queryKey: ['checkup-consents', id],
    enabled: isConsent,
    queryFn: () => api.get(`/checkup-consents/event/${id}`).then(res => res.data)
  })

  const { data: resultList = [] } = useQuery({
    queryKey: ['checkup-result', id],
    enabled: isResult,
    queryFn: () => api.get(`/checkup-results/event/${id}`).then(res => res.data)
  })

  const { data: editingResultData } = useQuery({
    queryKey: ['checkup-result-detail', editingResultId],
    enabled: !!editingResultId && isDialogOpen,
    queryFn: () => api.get(`/checkup-results/${editingResultId}`).then(res => res.data)
  })

  // Mutation configurations for email sending and PDF export
  const sendReminderMutation = useMutation({
    mutationFn: () => {
      // Get all unresponded consents to send reminder emails
      const unrespondedConsents = consentList.filter(consent => consent.consentStatus === 'PENDING')
      const consentIds = unrespondedConsents.map(consent => consent.id)

      return api.post(`/health-checkup/${id}/send-selective-emails`, {
        consentIds: consentIds,
        templateType: 'HEALTH_CHECKUP'
      })
    },
    onSuccess: () => queryClient.invalidateQueries(['checkup-consents', id])
  })

  const sendSelectiveEmailMutation = useMutation({
    mutationFn: consentIds =>
      api.post(`/health-checkup/${id}/send-selective-emails`, {
        consentIds,
        templateType: 'HEALTH_CHECKUP'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['checkup-consents', id])
      setSelectedConsents([])
      setSelectedRowKeys([])
    }
  })

  // Email sending handler functions
  const handleSendReminder = async () => {
    const unrespondedConsents = consentList.filter(consent => consent.consentStatus === 'PENDING')

    if (unrespondedConsents.length === 0) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-500" size={18} />
          <div>
            <p className="font-medium">Không thể gửi email nhắc nhở</p>
            <p className="text-sm text-gray-600">Không có phụ huynh nào cần gửi email nhắc nhở. Tất cả đã phản hồi!</p>
          </div>
        </div>,
        { position: 'bottom-center', autoClose: 5000 }
      )
      return
    }

    await sendEmailWithProgress(id, unrespondedConsents.length, () => sendReminderMutation.mutateAsync())
  }

  const handleSendSelectedEmails = async () => {
    if (selectedConsents.length === 0) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-500" size={18} />
          <div>
            <p className="font-medium">Không thể gửi email</p>
            <p className="text-sm text-gray-600">Vui lòng chọn ít nhất một học sinh để gửi email!</p>
          </div>
        </div>,
        { position: 'bottom-center', autoClose: 5000 }
      )
      return
    }

    const consentIds = selectedConsents.map(consent => consent.id).filter(id => id != null)

    if (consentIds.length === 0) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-500" size={18} />
          <div>
            <p className="font-medium">Lỗi dữ liệu</p>
            <p className="text-sm text-gray-600">Không thể xác định ID consent. Vui lòng kiểm tra dữ liệu!</p>
          </div>
        </div>,
        { position: 'bottom-center', autoClose: 5000 }
      )
      return
    }

    await sendEmailWithProgress(`${id}-selective`, selectedConsents.length, () =>
      sendSelectiveEmailMutation.mutateAsync(consentIds)
    )
  }

  const handleClearSelection = () => {
    setSelectedConsents([])
    setSelectedRowKeys([])
  }

  const filteredConsents = useMemo(() => {
    if (!isConsent || !consentList) return []
    const lowerSearch = search.toLowerCase()
    return consentList.filter(
      item =>
        item.studentName.toLowerCase().includes(lowerSearch) ||
        item.studentCode.toLowerCase().includes(lowerSearch) ||
        item.classCode?.toLowerCase().includes(lowerSearch)
    )
  }, [consentList, isConsent, search])

  const filteredResults = useMemo(() => {
    if (!isResult || !resultList) return []
    const lowerSearch = search.toLowerCase()
    return resultList.filter(
      item =>
        item.studentName.toLowerCase().includes(lowerSearch) ||
        item.studentCode.toLowerCase().includes(lowerSearch) ||
        item.classCode?.toLowerCase().includes(lowerSearch)
    )
  }, [resultList, isResult, search])

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys)
      setSelectedConsents(selectedRows)
    },
    getCheckboxProps: record => ({
      disabled: record.consentStatus !== 'PENDING', // Only allow selection of unresponded consents
      name: record.studentName
    }),
    type: 'checkbox'
  }

  const consentColumns = [
    {
      title: 'MSHS',
      dataIndex: 'studentCode',
      key: 'studentCode',
      align: 'center'
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'center'
    },
    {
      title: 'Lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      align: 'center'
    },
    {
      title: 'Phụ huynh',
      dataIndex: 'parentName',
      key: 'parentName',
      align: 'center'
    },
    {
      title: 'Liên lạc',
      key: 'contact',
      align: 'center',
      render: (_, record) => (
        <div>
          <p>{record.parentEmail}</p>
          <p>{record.parentPhone}</p>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'consentStatus',
      key: 'consentStatus',
      align: 'center',
      render: status => renderStatusBadge(status)
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <div className="cursor-pointer" onClick={() => navigate(`/manager/health-checkup/consent/${record.id}`)}>
          <ChevronRight className="text-teal-600 transition-transform hover:scale-110" />
        </div>
      )
    }
  ]

  if (isLoading || !eventData) return <Loading />

  const { eventTitle, schoolYear, startDate, endDate, createdAt, createdBy, status: eventStatus } = eventData

  const statusOrder = {
    APPROVED: 1,
    REJECTED: 2,
    PENDING: 3
  }

  const status =
    eventStatus === 'PENDING'
      ? 'Chờ duyệt'
      : eventStatus === 'APPROVED'
        ? 'Đã lên lịch'
        : eventStatus === 'DONE'
          ? 'Hoàn thành'
          : 'Không xác định'

  const notReplied = Math.max(totalSent - totalReplied, 0)

  const handleSendConsentForms = async () => {
    setSending(true)
    try {
      const res = await api.post(`/checkup-consents/event/${id}/send-all`)
      toast.success(
        <div className="flex items-center gap-2">
          <CheckCircle className="text-teal-600" size={18} />
          <div>
            <p className="font-medium">Gửi đơn thành công!</p>
            <p className="text-sm text-gray-600">Đã gửi {res.data.consents_sent} đơn đến phụ huynh</p>
          </div>
        </div>,
        { position: 'bottom-center', autoClose: 4000 }
      )
      queryClient.invalidateQueries(['checkup-consents', id])
      queryClient.invalidateQueries(['checkup-stats', id])
    } catch (err) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-500" size={18} />
          <div>
            <p className="font-medium">Gửi đơn thất bại</p>
            <p className="text-sm text-gray-600">
              {err?.response?.data?.message || 'Có lỗi xảy ra khi gửi đơn. Vui lòng thử lại sau.'}
            </p>
          </div>
        </div>,
        { position: 'bottom-center', autoClose: 5000 }
      )
    } finally {
      setSending(false)
    }
  }

  function renderStatusBadge(consentStatus) {
    switch (consentStatus) {
      case 'NOT_SENT':
        return (
          <span className="inline-block rounded bg-green-100 px-4 py-2 font-semibold text-green-800">Chưa gửi đơn</span>
        )
      case 'PENDING':
        return (
          <span className="inline-block rounded bg-yellow-100 px-4 py-2 font-semibold text-yellow-800">
            Chưa phản hồi
          </span>
        )
      case 'APPROVED':
        return <span className="inline-block rounded bg-blue-100 px-4 py-2 font-semibold text-blue-800">Đồng ý</span>
      case 'REJECTED':
        return <span className="inline-block rounded bg-red-100 px-4 py-2 font-semibold text-red-800">Từ chối</span>
      default:
        return <span className="inline-block rounded bg-gray-100 px-4 py-2 font-semibold text-gray-800">Không rõ</span>
    }
  }

  return (
    <div className="font-inter mx-auto max-w-screen-xl text-gray-900">
      <div className="mt-4 mb-6 flex items-center justify-between">
        <ReturnButton linkNavigate={-1} actor="manager" />
      </div>

      <div>
        <h1 className="mb-1 text-2xl font-bold">{eventTitle}</h1>
        <p className="mb-2 text-gray-600">Năm học: {schoolYear}</p>
        <span className="mt-2 inline-block rounded-full bg-teal-200 px-4 py-1 text-sm font-semibold text-teal-900">
          {status}
        </span>
      </div>

      {(isConsent || isResult) && (
        <div className="mt-6 mb-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative mr-10 w-[350px]">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-black" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh"
                className="text-md teal-search-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-5">
              <span className="font-semibold">Trạng thái</span>
              <select className="rounded-md border border-teal-300 bg-teal-50/50 px-2 py-3 text-teal-800 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none">
                <option>Tất cả</option>
                <option>Chưa phản hồi</option>
                <option>Đồng ý</option>
                <option>Từ chối</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            {isConsent && (
              <button className="teal-button" onClick={handleSendConsentForms} disabled={sending}>
                {sending ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Đang gửi...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span>Gửi đơn</span>
                  </div>
                )}
              </button>
            )}
            <button
              className="teal-button"
              onClick={handleSendReminder}
              disabled={sendReminderMutation.isPending || isSending(id)}
              title={`Gửi email nhắc nhở đến ${consentList.filter(consent => consent.consentStatus === 'PENDING').length} phụ huynh chưa phản hồi`}
            >
              {sendReminderMutation.isPending || isSending(id) ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Đang gửi...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span>Gửi lời nhắc</span>
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {!isConsent && !isResult && (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-xl font-bold">Thông tin chung</h2>
            <div className="w-[80%] space-y-3">
              {[
                ['Ngày bắt đầu', formatDate(startDate)],
                ['Ngày kết thúc', formatDate(endDate)],
                ['Ngày tạo sự kiện', dayjs(parseDate(createdAt)).format('DD/MM/YYYY')],
                ['Người phụ trách', createdBy?.fullName || 'Không rõ']
              ].map(([label, value], i) => (
                <div
                  key={i}
                  className={`flex justify-between rounded-md px-6 py-3 ${i % 2 === 0 ? 'bg-teal-200' : 'bg-white'}`}
                >
                  <span className="font-bold">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <h2 className="mt-6 mb-3 text-xl font-bold">Hạng mục khám</h2>
            <div className="flex w-[80%] flex-wrap gap-2">
              {categoryList.map(cat => (
                <span key={cat.id} className="rounded-full bg-teal-200 px-4 py-1 text-sm font-semibold text-teal-900">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xl font-bold">Mức độ phản hồi</h2>
            <div className="mb-8 flex items-center gap-2 rounded-md bg-yellow-100 px-4 py-3 font-bold text-yellow-900">
              <AlertCircle size={18} />
              <span>
                Chưa có phản hồi từ {notReplied}/{totalSent} phụ huynh
              </span>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-5">
              {[
                ['Đã gửi', totalSent, <FileText size={20} />, 'bg-[#DAEAF7]'],
                ['Đã phản hồi', totalReplied, <CheckCircle size={20} />, 'bg-[#C8E6C9]'],
                ['Chưa phản hồi', totalNotReplied, <AlertTriangle size={20} />, 'bg-[#F9F9F9]'],
                ['Hạng mục khám', categoryList.length, <CalendarDays size={20} />, 'bg-[#E3F2FD]']
              ].map(([label, value, icon, bg], i) => (
                <div key={i} className={`${bg} rounded-xl p-5`}>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold">{label}</p>
                    {icon}
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {eventStatus !== 'PENDING' && (
              <div className="grid grid-cols-2 gap-5">
                <button onClick={() => navigate(`/manager/health-checkup/${id}/consents`)} className="teal-button-lg">
                  Danh sách đơn
                </button>
                <button onClick={() => navigate(`/manager/health-checkup/${id}/results`)} className="teal-button-lg">
                  Kết quả khám
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {isConsent && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold">Danh sách đơn phản hồi</h2>
          {selectedConsents.length > 0 && (
            <BulkActionBar
              selectedCount={selectedConsents.length}
              onSendEmail={handleSendSelectedEmails}
              onCancel={handleClearSelection}
              isSending={sendSelectiveEmailMutation.isPending}
              theme="teal"
            />
          )}
          <Table
            rowSelection={rowSelection}
            columns={consentColumns}
            dataSource={filteredConsents
              .sort((a, b) => statusOrder[a.consentStatus] - statusOrder[b.consentStatus])
              .map(item => ({ ...item, key: item.id }))}
            pagination={{
              className: 'teal-pagination',
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50'],
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} mục`
            }}
            size="middle"
            className="teal-table rounded-md border"
          />
        </div>
      )}

      {isResult && (
        <div className="p-6">
          <table className="teal-themed-table w-full overflow-hidden rounded-md border px-3 py-3 text-sm">
            <thead className="bg-teal-50 text-center font-semibold text-teal-800">
              <tr>
                <th className="border-b border-teal-200 p-5">MSHS</th>
                <th className="border-b border-teal-200 p-5">Học sinh</th>
                <th className="border-b border-teal-200 p-5">Lớp</th>
                <th className="border-b border-teal-200 p-5">Phụ huynh</th>
                <th className="border-b border-teal-200 p-5">Liên lạc</th>
                <th className="border-b border-teal-200 p-5">Ngày khám</th>
                <th className="border-b border-teal-200 p-5">Hạng mục khám</th>
                <th className="border-b border-teal-200 p-5">Kết quả</th>
                <th className="border-b border-teal-200 p-5">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((item, index) => (
                <tr
                  key={item.resultId}
                  className={`border-t text-center ${index % 2 === 0 ? 'bg-white' : 'bg-teal-50/30'} hover:bg-teal-50`}
                >
                  <td className="p-3">{item.studentCode}</td>
                  <td className="p-3">{item.studentName}</td>
                  <td className="p-3">{item.classCode}</td>
                  <td className="p-3">{item.parentName}</td>
                  <td className="p-3">
                    <p>{item.parentEmail}</p>
                    <p>{item.parentPhone}</p>
                  </td>
                  <td className="p-3">{item.eventDate}</td>
                  <td className="p-3">
                    {item.categoryResults.length}/{categoryList.length}
                  </td>
                  <td className="px-4 py-4">
                    <span>{renderResultStatusBadge(item.status)}</span>
                  </td>

                  <td className="h-full p-3">
                    <div className="flex h-full items-center justify-center gap-4">
                      <ChevronRight
                        size={20}
                        className="cursor-pointer text-teal-600 transition-transform hover:scale-110"
                        onClick={() => navigate(`/manager/checkup-results/${item.resultId}`)}
                      />
                      <Pencil
                        size={20}
                        className="cursor-pointer text-gray-700 hover:text-blue-600"
                        onClick={() => {
                          setEditingResultId(item.resultId)
                          setIsDialogOpen(true)
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredResults.length && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                  g
                </tr>
              )}
            </tbody>
          </table>

          {editingResultData && (
            <EditCheckupResultDialog
              open={isDialogOpen}
              onOpenChange={setIsDialogOpen}
              resultId={editingResultId}
              section={{
                status: editingResultData?.status,
                note: editingResultData?.note,
                eventDate: editingResultData?.eventDate,
                startDate: editingResultData?.startDate,
                endDate: editingResultData?.endDate
              }}
              isOverall
              onSaved={() => {
                queryClient.invalidateQueries(['checkup-result', id])
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
