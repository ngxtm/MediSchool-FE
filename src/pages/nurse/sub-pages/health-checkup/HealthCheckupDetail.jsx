import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import api from '@/utils/api'
import { format } from 'date-fns'
import vi from 'date-fns/locale/vi'
import { FileText, CalendarDays, AlertCircle, CheckCircle, AlertTriangle, Search, ChevronRight } from 'lucide-react'
import Loading from '@/components/Loading'
import ReturnButton from '../../../../components/ReturnButton.jsx'
import React, { useState } from 'react'
import dayjs from 'dayjs'
import { parseDate } from '../../../../utils/dateparse'

function formatDate(dateInput) {
  if (!dateInput) return 'N/A'
  try {
    return format(new Date(dateInput), 'dd/MM/yyyy', { locale: vi })
  } catch {
    return 'N/A'
  }
}

export default function HealthCheckupDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)

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

  if (isLoading || !eventData) return <Loading />

  const {
    eventTitle,
    schoolYear,
    startDate,
    endDate,
    createdAt,
    createdBy,
    totalSent = 0,
    totalReplied = 0,
    status: eventStatus
  } = eventData

  const status =
    eventStatus === 'PENDING'
      ? 'Chờ duyệt'
      : eventStatus === 'APPROVED'
        ? 'Đã duyệt'
        : eventStatus === 'DONE'
          ? 'Đã hoàn thành'
          : 'Không xác định'

  const notReplied = Math.max(totalSent - totalReplied, 0)

  const handleSendConsentForms = async () => {
    setSending(true)
    try {
      const res = await api.post(`/checkup-consents/event/${id}/send-all`)
      toast.success(`Đã gửi ${res.data.consents_sent} đơn thành công!`)
    } catch (err) {
      toast.error('Gửi đơn thất bại')
    } finally {
      setSending(false)
    }
  }

  function renderStatusBadge(consentStatus) {
    switch (consentStatus) {
      case 'NOT_SENT':
        return (
          <span className="text-m font-lg inline-block rounded bg-green-100 px-4 py-2 font-bold text-green-800">
            Chưa gửi đơn
          </span>
        )
      case 'PENDING':
        return (
          <span className="text-m font-lg inline-block rounded bg-yellow-100 px-4 py-2 font-bold text-yellow-800">
            Chưa phản hồi
          </span>
        )
      case 'APPROVED':
        return (
          <span className="text-m font-lg inline-block rounded bg-blue-100 px-4 py-2 font-bold text-blue-800">
            Đồng ý
          </span>
        )
      case 'REJECTED':
        return (
          <span className="text-m font-lg inline-block rounded bg-red-100 px-4 py-2 font-bold text-red-800">
            Từ chối
          </span>
        )
      default:
        return (
          <span className="text-m font-lg inline-block rounded bg-gray-100 px-4 py-2 font-bold text-gray-800">
            Không rõ
          </span>
        )
    }
  }

  return (
    <div className="font-inter mx-auto max-w-screen-xl text-gray-900">
      <div className="mt-4 mb-6 flex items-center justify-between">
        <ReturnButton linkNavigate={-1} actor="nurse" />
      </div>

      <div>
        <h1 className="mb-1 text-2xl font-bold">{eventTitle}</h1>
        <p className="mb-2 text-gray-600">Năm học: {schoolYear}</p>
        <span className="mt-2 inline-block rounded-full bg-[#E3F2FD] px-4 py-1 text-sm font-semibold text-[#1565C0]">
          {status}
        </span>
      </div>

      {isConsent && (
        <div className="mt-6 mb-4 flex flex-wrap items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative mr-10 w-[350px]">
              <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-600" size={16} />
              <input
                type="text"
                placeholder="Tìm kiếm học sinh hoặc phụ huynh"
                className="text-md w-full rounded-md border py-3 pr-4 pl-9"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-5">
              <span className="font-semibold">Trạng thái</span>
              <select className="rounded-md border px-2 py-3">
                <option>Tất cả</option>
                <option>Chưa phản hồi</option>
                <option>Đồng ý</option>
                <option>Từ chối</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              className="rounded-md bg-[#023E73] px-4 py-2 font-semibold text-white hover:bg-[#034a8a] disabled:opacity-50"
              onClick={handleSendConsentForms}
              disabled={sending}
            >
              {sending ? 'Đang gửi...' : 'Gửi đơn'}
            </button>
            <button
              className="rounded-md bg-[#023E73] px-4 py-2 font-semibold text-white hover:bg-[#034a8a]"
              onClick={() => console.log('Gửi lời nhắc')}
            >
              Gửi lời nhắc
            </button>
            <button
              className="rounded-md bg-[#023E73] px-4 py-2 font-semibold text-white hover:bg-[#034a8a]"
              onClick={() => console.log('Xuất PDF')}
            >
              Xuất PDF
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
                  className={`flex justify-between rounded-md px-6 py-3 ${i % 2 === 0 ? 'bg-[#E3F2FD]' : 'bg-white'}`}
                >
                  <span className="font-bold">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            <h2 className="mt-6 mb-3 text-xl font-bold">Hạng mục khám</h2>
            <div className="flex w-[80%] flex-wrap gap-2">
              {categoryList.map(cat => (
                <span key={cat.id} className="rounded-full bg-[#E3F2FD] px-4 py-1 text-sm font-medium text-[#0D47A1]">
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
                ['Chưa phản hồi', notReplied, <AlertTriangle size={20} />, 'bg-[#F9F9F9]'],
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
                <button
                  onClick={() => navigate(`/nurse/health-checkup/${id}/consents`)}
                  className="flex-center items-center gap-2 rounded-lg bg-[#023E73] px-4 py-2 text-lg font-semibold text-white hover:bg-[#034a8a]"
                >
                  Danh sách đơn
                </button>
                <button
                  onClick={() => navigate(`/nurse/health-checkup/${id}/results`)}
                  className="flex-center items-center gap-2 rounded-lg bg-[#023E73] px-4 py-2 text-lg font-semibold text-white hover:bg-[#034a8a]"
                >
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
          <table className="w-full overflow-hidden rounded-md border text-sm">
            <thead className="bg-gray-100 text-center font-semibold">
              <tr>
                <th className="p-3">MSHS</th>
                <th className="p-3">Học sinh</th>
                <th className="p-3">Lớp</th>
                <th className="p-3">Phụ huynh</th>
                <th className="p-3">Liên lạc</th>
                <th className="p-3">Trạng thái</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {consentList.map(row => (
                <tr key={row.id} className="border-t text-center hover:bg-gray-50">
                  <td className="p-3">{row.studentCode}</td>
                  <td className="p-3">{row.studentName}</td>
                  <td className="p-3">{row.classCode}</td>
                  <td className="p-3">{row.parentName}</td>
                  <td className="p-3">{row.contactPhone}</td>
                  <td className="p-3 font-semibold text-yellow-600">{renderStatusBadge(row.consentStatus)}</td>
                  <td>
                    <div className="cursor-pointer" onClick={() => navigate(`/nurse/health-checkup/consent/${row.id}`)}>
                      <ChevronRight className="text-black transition-transform hover:scale-110" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isResult && (
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-bold">Hồ sơ khám sức khỏe</h2>
          <table className="w-full overflow-hidden rounded-md border text-sm">
            <thead className="bg-gray-100 text-left font-semibold">
              <tr>
                <th className="p-3">Học sinh</th>
                <th className="p-3">Lớp</th>
                <th className="p-3">Vấn đề</th>
                <th className="p-3">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {resultList.map(row => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{row.studentName}</td>
                  <td className="p-3">{row.className}</td>
                  <td className="p-3">{row.healthIssue}</td>
                  <td className="p-3">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
