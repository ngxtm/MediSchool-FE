import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import api from '../../utils/api'
import { useStudent } from '../../context/StudentContext'
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const MedicalRecord = () => {
  const queryClient = useQueryClient()

  const { selectedStudent } = useStudent()
  const rowBlue = 'flex justify-between flex-col md:flex-row bg-[#DAEAF7] px-6 py-3 rounded-xl'
  const rowWhite = 'flex justify-between flex-col md:flex-row px-6 py-3'
  const header = 'font-bold mb-4 text-2xl mb-6'

  const {
    data: healthProfile,
    isLoading: healthProfileLoading,
    isError: healthProfileError
  } = useQuery({
    queryKey: ['healthProfile', selectedStudent?.studentId],
    queryFn: async () => {
      if (!selectedStudent?.studentId) return null
      const response = await api.get(`/checkup-basic-info/student/${selectedStudent.studentId}`)
      return response.data
    },
    enabled: !!selectedStudent?.studentId
  })

  const {
    data: healthEvents,
    isLoading: healthEventsLoading,
    isError: healthEventsError
  } = useQuery({
    queryKey: ['healthEvents', selectedStudent?.studentId],
    queryFn: async () => {
      if (!selectedStudent?.studentId) return []
      const response = await api.get('/health-event')
      return response.data.filter(event => event.student.studentId === selectedStudent.studentId)
    },
    enabled: !!selectedStudent?.studentId
  })

  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    height: '',
    weight: '',
    bloodType: '',
    visionLeft: '',
    visionRight: '',
    underlyingDiseases: '',
    allergies: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOpenDialog = () => {
    if (!selectedStudent?.studentId) return
    setForm({
      height: healthProfile?.height || '',
      weight: healthProfile?.weight || '',
      bloodType: healthProfile?.bloodType || '',
      visionLeft: healthProfile?.visionLeft || '',
      visionRight: healthProfile?.visionRight || '',
      underlyingDiseases: healthProfile?.underlyingDiseases || '',
      allergies: healthProfile?.allergies || ''
    })
    setError('')
    setDialogOpen(true)
  }

  const handleFormChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedStudent?.studentId) return
    setLoading(true)
    setError('')
    try {
      await api.put(`/checkup-basic-info/student/${selectedStudent.studentId}`, {
        ...healthProfile,
        ...form
      })
      queryClient.invalidateQueries({ queryKey: ['healthProfile', selectedStudent.studentId] })
      setDialogOpen(false)
    } catch {
      setError('Cập nhật thất bại. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = dateString => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB')
  }

  const getStatusInfo = extent => {
    switch (extent?.toUpperCase()) {
      case 'DANGEROUS':
        return {
          text: 'NGUY HIỂM',
          bgColor: 'bg-[#FFCCCC]',
          textColor: 'text-[#D32F2F]'
        }
      case 'NORMAL':
        return {
          text: 'NHẸ',
          bgColor: '',
          textColor: 'text-[#2E7D32]'
        }
      default:
        return {
          text: 'KHÔNG XÁC ĐỊNH',
          bgColor: 'bg-[#FFF3CD]',
          textColor: 'text-[#856404]'
        }
    }
  }

  const renderHealthEventItem = (event, index) => {
    const statusInfo = getStatusInfo(event.extent)
    const medicines = event.eventMedicines || []
    const medicineText =
      medicines.length > 0 ? medicines.map(med => `${med.medicine.name}`).join(', ') : 'Không có thuốc'

    return (
      <div
        key={event.id || index}
        className={`group m-0 grid cursor-pointer grid-cols-12 rounded-xl px-8 py-4 ${statusInfo.bgColor} transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:border hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200 active:scale-[0.98] active:shadow-md`}
      >
        <div className="col-span-3 flex flex-col gap-3 border-r-2 border-gray-400 transition-colors duration-300 group-hover:border-gray-500">
          <p className={`font-bold transition-colors duration-300 ${statusInfo.textColor} group-hover:text-opacity-80`}>
            {statusInfo.text}
          </p>
          <p className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-gray-600">
            {formatDate(event.eventTime)}
          </p>
        </div>
        <div className="col-span-9">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-2 pl-5">
              <p className="font-medium transition-colors duration-300 group-hover:text-gray-800">{event.problem}</p>
              <p className="font-semibold text-gray-700 transition-colors duration-300 group-hover:text-blue-600">
                {medicineText}
              </p>
            </div>
            <div className="transition-all duration-300 group-hover:translate-x-1 group-hover:scale-110 group-hover:text-blue-600">
              <ChevronRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:gap-30">
      <div className="md:w-1/2">
        <div className="mb-6">
          <h1 className={header}>Thông tin sức khoẻ cơ bản</h1>
          {healthProfileLoading ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : healthProfileError ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-600">Không thể tải thông tin sức khỏe</p>
            </div>
          ) : (
            <>
              <div className={rowBlue}>
                <p className="w-fit font-bold">Chiều cao</p>
                <p className="w-fit">{healthProfile?.height ? `${healthProfile.height} (cm)` : 'Chưa cập nhật'}</p>
              </div>
              <div className={rowWhite}>
                <p className="w-fit font-bold">Cân nặng</p>
                <p className="w-fit">{healthProfile?.weight ? `${healthProfile.weight} (kg)` : 'Chưa cập nhật'}</p>
              </div>
              <div className={rowBlue}>
                <p className="w-fit font-bold">Nhóm máu</p>
                <p className="w-fit">{healthProfile?.bloodType || 'Chưa cập nhật'}</p>
              </div>
            </>
          )}
        </div>
        <div className="mb-6">
          <h1 className={header}>Thị lực</h1>
          {healthProfileLoading ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : healthProfileError ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-600">Không thể tải thông tin thị lực</p>
            </div>
          ) : (
            <>
              <div className={rowBlue}>
                <p className="w-fit font-bold">Mắt phải không kính</p>
                <p className="w-fit">{healthProfile?.visionRight ? `${healthProfile.visionRight}` : 'Chưa cập nhật'}</p>
              </div>
              <div className={rowWhite}>
                <p className="w-fit font-bold">Mắt trái không kính</p>
                <p className="w-fit">{healthProfile?.visionLeft ? `${healthProfile.visionLeft}` : 'Chưa cập nhật'}</p>
              </div>
            </>
          )}
        </div>
        <div className="mb-6">
          <h1 className={header}>Khác</h1>
          {healthProfileLoading ? (
            <div className="py-4 text-center">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
            </div>
          ) : healthProfileError ? (
            <div className="py-4 text-center">
              <p className="text-sm text-red-600">Không thể tải thông tin khác</p>
            </div>
          ) : (
            <>
              <div className={rowBlue}>
                <p className="w-fit font-bold">Bệnh nền</p>
                <p className="w-fit">{healthProfile?.chronicConditions || 'Không'}</p>
              </div>
              <div className={rowWhite}>
                <p className="w-fit font-bold">Dị ứng</p>
                <p className="w-fit">{healthProfile?.allergies || 'Không'}</p>
              </div>
            </>
          )}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              onClick={handleOpenDialog}
              disabled={healthProfileLoading}
              className="w-full rounded-xl bg-[#023E73] py-2 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:border-1 hover:shadow-lg hover:shadow-gray-300"
            >
              Cập nhập thông tin
            </button>
          </DialogTrigger>
          <DialogContent className="border-blue-200 bg-[#DAEAF7] shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-[#023E73]">
                Cập nhật thông tin sức khoẻ cơ bản
              </DialogTitle>
              <DialogDescription className="text-blue-900">
                Chỉnh sửa và lưu thông tin sức khoẻ cho học sinh.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="height" className="text-[#023E73]">
                  Chiều cao (cm)
                </Label>
                <Input
                  id="height"
                  name="height"
                  value={form.height}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="weight" className="text-[#023E73]">
                  Cân nặng (kg)
                </Label>
                <Input
                  id="weight"
                  name="weight"
                  value={form.weight}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="bloodType" className="text-[#023E73]">
                  Nhóm máu
                </Label>
                <Input
                  id="bloodType"
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="visionLeft" className="text-[#023E73]">
                  Mắt trái không kính
                </Label>
                <Input
                  id="visionLeft"
                  name="visionLeft"
                  value={form.visionLeft}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="visionRight" className="text-[#023E73]">
                  Mắt phải không kính
                </Label>
                <Input
                  id="visionRight"
                  name="visionRight"
                  value={form.visionRight}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="underlyingDiseases" className="text-[#023E73]">
                  Bệnh nền
                </Label>
                <Input
                  id="underlyingDiseases"
                  name="underlyingDiseases"
                  value={form.underlyingDiseases}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              <div>
                <Label htmlFor="allergies" className="text-[#023E73]">
                  Dị ứng
                </Label>
                <Input
                  id="allergies"
                  name="allergies"
                  value={form.allergies}
                  onChange={handleFormChange}
                  className="border-blue-200 bg-white focus:border-[#023E73]"
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#023E73] font-semibold text-white hover:bg-[#01294d]"
                >
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline" className="border-blue-200 text-[#023E73]">
                    Hủy
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="md:w-1/2">
        <h1 className={header}>Thông tin tai nạn y tế</h1>
        <div className="space-y-3">
          {healthEventsLoading ? (
            <div className="py-8 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          ) : healthEventsError ? (
            <div className="py-8 text-center">
              <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
            </div>
          ) : healthEvents && healthEvents.length > 0 ? (
            <>
              {healthEvents
                .sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
                .map((event, index) => renderHealthEventItem(event, index))}
            </>
          ) : (
            <div className="py-8 text-center">
              <p className="text-gray-500">Không có thông tin tai nạn y tế</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalRecord
