import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import vi from 'date-fns/locale/vi'
import { ArrowLeft, Download, Pencil } from 'lucide-react'
import api from '@/utils/api'
import Loading from '@/components/Loading'
import React, { useState } from 'react'
import EditCheckupResultDialog from './EditCheckupResultDialog'
import ReturnButton from '../../../../components/ReturnButton.jsx'

function formatDate(date) {
  try {
    return format(new Date(date), 'dd/MM/yyyy', { locale: vi })
  } catch {
    return 'N/A'
  }
}

function parseDateToString(dateArray) {
  if (!Array.isArray(dateArray) || dateArray.length < 3) return 'N/A'
  const [year, month, day] = dateArray
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export default function CheckupResultDetail({ isResultList = false }) {
  const { resultId } = useParams()
  const navigate = useNavigate()
  const [editingSection, setEditingSection] = useState(null)

  if (!resultId) {
    return <p className="mt-10 text-center text-red-500">Không tìm thấy kết quả khám sức khỏe.</p>
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['checkup-result-detail', resultId],
    queryFn: () => api.get(`/checkup-results/${resultId}`).then(res => res.data)
  })

  if (isLoading) return <Loading />

  if (isError || !data) {
    return <p className="mt-10 text-center text-red-500">Không thể tải dữ liệu kết quả khám sức khỏe.</p>
  }

  const {
    eventTitle,
    academicYear,
    createdDate,
    eventDate,
    status,
    note,
    studentName,
    studentCode,
    classCode,
    gender,
    dob,
    parentName,
    parentEmail,
    parentPhone,
    categoryResults = []
  } = data

  const statusColorMap = {
    NO_RESULT: 'px-3 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg',
    NORMAL: 'px-3 py-2 bg-green-200 text-green-900 text-md font-semibold rounded-lg',
    ABNORMAL: 'px-3 py-2 bg-yellow-200 text-yellow-900 text-md font-semibold rounded-lg',
    SERIOUS: 'px-3 py-2 bg-red-200 text-red-900 text-md font-semibold rounded-lg'
  }

  const statusOrder = {
    NO_RESULT: 1,
    SERIOUS: 2,
    ABNORMAL: 3,
    NORMAL: 4
  }

  return (
    <div className="font-inter mx-auto max-w-6xl text-gray-900">
      <div className="mt-4 mb-6 flex items-center justify-between">
        <ReturnButton linkNavigate={-1} actor="nurse" />
      </div>

      <div className="mb-6 flex flex-col items-start justify-between lg:flex-row">
        <div>
          <h1 className="mb-2 text-2xl font-bold">{eventTitle}</h1>
          <p className="mb-2">Ngày tạo đơn: {createdDate}</p>
          <p className="mb-2">Ngày khám: {eventDate}</p>
          <p className="mb-2">Năm học: {academicYear}</p>
          <div className={`rounded-lg py-2`}>
            <span className={`${statusColorMap[status] || 'bg-gray-100 px-3 py-1 text-gray-700'}`}>
              {status === 'NO_RESULT'
                ? 'Chưa có kết quả'
                : status === 'NORMAL'
                  ? 'Bình thường'
                  : status === 'ABNORMAL'
                    ? 'Theo dõi'
                    : status === 'SERIOUS'
                      ? 'Nguy hiểm'
                      : 'Không rõ'}
            </span>
          </div>
          <p className="mt-3">
            <strong>Ghi chú: </strong>
            {note}
          </p>
        </div>

        <div className="mt-6 w-full space-y-3 lg:mt-0 lg:w-1/3">
          <div className="rounded-md border p-4">
            <h2 className="mb-2 font-semibold">Thông tin học sinh</h2>
            <p>Họ và tên: {studentName}</p>
            <p>Mã số học sinh: {studentCode}</p>
            <p>Ngày sinh: {formatDate(dob)}</p>
            <p>Giới tính: {gender === 'MALE' ? 'Nam' : 'Nữ'}</p>
            <p>Lớp: {classCode}</p>
          </div>

          <div className="rounded-md border p-4">
            <h2 className="mb-2 font-semibold">Thông tin phụ huynh</h2>
            <p>Họ và tên: {parentName}</p>
            <p>Email: {parentEmail}</p>
            <p>Số điện thoại: {parentPhone}</p>
          </div>
        </div>
      </div>

      <div className="mb-8 space-y-6">
        {categoryResults
          .sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
          .map((section, index) => (
            <div key={index} className="rounded-md border">
              <div className="flex items-center justify-between rounded-t-md bg-blue-100 px-4 py-2">
                <div>
                  <p className="font-semibold">{section.name}</p>
                  <p className="text-sm">
                    Trạng thái:{' '}
                    {section.status === 'NO_RESULT'
                      ? 'Chưa có kết quả'
                      : section.status === 'NORMAL'
                        ? 'Bình thường'
                        : section.status === 'ABNORMAL'
                          ? 'Theo dõi'
                          : section.status === 'SERIOUS'
                            ? 'Nguy hiểm'
                            : 'Không rõ'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingSection(section)}
                    className="flex items-center text-sm text-blue-600 hover:underline"
                  >
                    <Pencil className="mr-1 h-4 w-4" />
                    Chỉnh sửa
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="font-medium">Kết quả: {section.value ?? 'Chưa có'}</p>
              </div>
            </div>
          ))}
      </div>

      <EditCheckupResultDialog
        section={editingSection}
        open={!!editingSection}
        onOpenChange={open => !open && setEditingSection(null)}
        onSaved={() => window.location.reload()}
      />
    </div>
  )
}
