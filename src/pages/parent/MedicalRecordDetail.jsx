import { useParams } from 'react-router-dom'
import ReturnButton from '../../components/ReturnButton'
import api from '../../utils/api'
import { useQuery } from '@tanstack/react-query'
import { formatDateTime } from '../../utils/dateparse'

export default function MedicalRecordDetail() {
  const { id } = useParams()

  const {
    data: event,
    isError,
    isLoading
  } = useQuery({
    queryKey: ['event', id],
    queryFn: async () => {
      const response = await api.get(`/health-event/${id}`)
      return response.data
    }
  })

  const handleExtent = extent => {
    switch (extent) {
      case 'DANGEROUS':
        return {
          text: 'Nghiêm trọng',
          bgColor: '#ffcccc'
        }
      case 'NORMAL':
        return {
          text: 'Nhẹ',
          bgColor: '#cce5ff'
        }
      default:
        return {
          text: 'Chưa xác định',
          bgColor: '#f5f5f5'
        }
    }
  }

  if (isLoading) {
    return <div>Đang tải...</div>
  }

  if (isError) {
    return <div>Có lỗi khi xem thông tin về sự kiện y tế này</div>
  }

  if (!event) {
    return <div>Không tìm thấy thông tin sự kiện</div>
  }

  return (
    <>
      <ReturnButton linkNavigate={'/parent/medical-record'} />
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-5">
          <h1 className="text-center text-2xl font-bold">Thông tin sự kiện y tế</h1>
          <div className="mx-auto flex w-[50%] flex-col gap-6">
            <div className="flex items-start justify-between">
              <div className="flex min-w-[500px] flex-col gap-2 rounded-2xl bg-[#F5F5F5] px-4 py-6">
                <h2 className="text-2xl font-bold">Tai nạn: {event.problem}</h2>
                <p>Thời gian: {formatDateTime(event.eventTime)}</p>
                <p>Địa điểm: {event.location}</p>
                <p>Phụ trách: {event.recordByUser.fullName ?? 'Chưa xác định'}</p>
              </div>
              <p
                className="rounded-2xl bg-[#F5F5F5] px-8 py-1 font-bold"
                style={{ backgroundColor: handleExtent(event.extent).bgColor }}
              >
                {handleExtent(event.extent).text}
              </p>
            </div>
            <p className="rounded-2xl bg-[#DAEAF7] px-4 py-2">
              <span className="font-bold">Mô tả:</span> {event.description}
            </p>
            <p className="rounded-2xl bg-[#DAEAF7] px-4 py-2">
              <span className="font-bold">Xử lí:</span> {event.solution}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
