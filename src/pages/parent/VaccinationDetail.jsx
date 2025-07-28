import { useParams } from 'react-router-dom'
import ParentTaskbar from './ParentTaskBar'
import ReturnButton from '../../components/ReturnButton'
import Loading from '../../components/Loading'
import {
  useStudentDetail,
  useUserData,
  useVaccinationDetail,
  useVaccineCategory,
  useVaccineEvent
} from '../../hooks/useVaccinationDetail'
import { formatDate } from '../../utils/dateparse'
import { useEffect, useState } from 'react'

export default function VaccinationDetail() {
  const [vaccineOutside, setVaccineOutside] = useState(false)
  const { id } = useParams()

  const { data: user, isLoading: userLoading, error: userError } = useUserData()
  const {
    vaccination,
    isLoading: vaccinationLoading,
    error: vaccinationError,
    statusDisplay
  } = useVaccinationDetail(id)

  useEffect(() => {
    if (vaccination?.eventId) {
      setVaccineOutside(true)
    } else {
      setVaccineOutside(false)
    }
  }, [vaccination?.eventId])

  const {
    data: vaccineEvent,
    isLoading: vaccineEventLoading,
    error: vaccineEventError
  } = useVaccineEvent(vaccination?.eventId)

  const { data: student, isLoading: studentLoading, error: studentError } = useStudentDetail(vaccination?.studentId)

  const { data: category } = useVaccineCategory(vaccination?.vaccine?.categoryId)

  if (userLoading || vaccinationLoading || vaccineEventLoading || studentLoading) {
    return (
      <div className="min-h-screen">
        <ParentTaskbar userData={user} />
        <div className="px-20 py-6">
          <ReturnButton linkNavigate={`/parent/vaccination`} />
          <div className="mt-10 flex items-center justify-center">
            <Loading />
          </div>
        </div>
      </div>
    )
  }

  if (userError || vaccinationError || vaccineEventError || studentError) {
    return (
      <div className="min-h-screen">
        <ParentTaskbar userData={user} />
        <div className="px-20 py-6">
          <ReturnButton linkNavigate={`/parent/vaccination`} />
          <div className="mt-10 rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 font-semibold text-red-800">Đã xảy ra lỗi</h2>
            <p className="text-red-600">
              {userError?.message || vaccinationError?.message || 'Không thể tải dữ liệu. Vui lòng thử lại.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleAbnormal = abnormal => {
    if (abnormal) {
      return 'Có'
    } else {
      return 'Không có'
    }
  }

  return (
    <div className="min-h-screen">
      <ParentTaskbar userData={user} />
      <div className="px-20 py-6">
        <ReturnButton linkNavigate={`/parent/vaccination`} />
        <div className="mt-10 flex justify-between rounded-lg bg-[#f5f5f5] px-10 py-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Tiêm chủng: {vaccination?.eventTitle ?? 'Cúm mùa'}</h1>
            <p className={`${statusDisplay?.bgColor || 'bg-[#DAEAF7]'} w-fit rounded-lg px-3 py-1 font-semibold`}>
              {statusDisplay.text || 'Chờ duyệt'}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p>Ngày tạo đơn: {formatDate(vaccination?.createdAt) || '20/05/2025'}</p>
            <p>Phụ trách: Y tá {vaccination?.event?.createdBy?.fullName || 'Nguyễn Văn A'}</p>
          </div>
        </div>
        <div className="mt-10 flex justify-between gap-20">
          <div>
            <div className="flex w-fit flex-col gap-3 rounded-lg border border-gray-300 p-8">
              <h2 className="text-2xl font-bold">Thông tin học sinh</h2>
              <p>Họ và tên: {student?.fullName ?? 'Nguyễn Văn A'}</p>
              <p>Mã số học sinh: {student?.studentCode ?? '123456'}</p>
              <p>Ngày sinh: {formatDate(student?.dateOfBirth) ?? '20/05/2025'}</p>
              <p>Giới tính: {student?.gender ?? 'Nam'}</p>
              <p>Lớp: {student?.classroom?.name ?? '1A'}</p>
              <p>Địa chỉ: {student?.address ?? '123 Đường ABC, Quận XYZ, TP. HCM'}</p>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div>
              {vaccineOutside ? (
                <div className="flex flex-col gap-3 rounded-lg border border-gray-300 p-8">
                  <h2 className="text-2xl font-bold">{vaccineEvent?.eventTitle ?? 'Sự kiện tiêm chủng'}</h2>
                  <p>Vaccine: {vaccination?.vaccine?.name ?? 'Cúm mùa'}</p>
                  <p>Ngày tiêm: {vaccineEvent?.eventDate ?? '20/05/2025'}</p>
                  <p>Địa điểm: {vaccineEvent?.location ?? 'Trung tâm y tế'}</p>
                  <p>Phụ trách: Y tá {vaccineEvent?.createdBy?.fullName ?? 'Nguyễn Văn A'}</p>
                  <p>Bất thường: {handleAbnormal(vaccination?.abnormal) ?? 'Không có'}</p>
                  <p>Theo dõi sau tiêm: {vaccination?.followUpNote ?? 'Không có'}</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 rounded-lg border border-gray-300 p-8">
                  <h2 className="text-2xl font-bold">Thông tin tiêm chủng</h2>
                  <p>Ngày tiêm chủng: {formatDate(vaccination?.createdAt) ?? '20/05/2025'}</p>
                  <p>Vaccine: {vaccination?.vaccine?.name ?? 'Cúm mùa'}</p>
                  <p>Nơi tiêm chủng: {vaccination?.location ?? 'Trung tâm y tế'}</p>
                  <p>Ghi chú: {vaccination?.note ?? 'Không có'}</p>
                  <p>Bất thường: {handleAbnormal(vaccination?.abnormal) ?? 'Không có'}</p>
                  <p>Theo dõi sau tiêm: {vaccination?.followUpNote ?? 'Không có'}</p>
                </div>
              )}
            </div>
            <div className="flex w-[750px] flex-col gap-3 rounded-lg border border-gray-300 p-8">
              <h2 className="text-2xl font-bold">Thông tin vaccine</h2>
              <p>Vaccine: {vaccination?.vaccine?.name ?? 'Influvac Tetra (0.5 ml)'}</p>
              <p>
                Mô tả:{' '}
                {vaccination?.vaccine?.description ??
                  'Vắc‑xin tứ giá bất hoạt, ngừa chủng A (H1N1, H3N2) và B (Victoria, Yamagata); dùng cho trẻ từ 6 tháng trở lên và người lớn'}
              </p>
              <p>Nhà sản xuất: {vaccination?.vaccine?.manufacturer ?? 'Abbott Biologicals B.V (Hà Lan)'}</p>
              <p>Số liều yêu cầu: {vaccination?.vaccine?.requiredDoses ?? '2'}</p>
              <p>Nhiệt độ lưu trữ: {vaccination?.vaccine?.storageTemperature ?? '2-8°C'}</p>
              <p>
                Tác dụng phụ có thể gặp:{' '}
                {vaccination?.vaccine?.sideEffects ?? 'Đau/sưng tại chỗ tiêm, sốt nhẹ, mệt mỏi, đau cơ, đau đầu'}
              </p>
              <p>Phòng bệnh: {category?.categoryName ?? 'Phòng bệnh'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
