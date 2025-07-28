import {
  Bell,
  CircleAlert,
  CircleCheckBig,
  Search,
  Plus,
  Trash2,
  Package,
  Activity,
  ChevronRight,
  Send
} from 'lucide-react'
import api from '../../../../utils/api'
import DetailBox from '../../../nurse/components/DetailBox.jsx'
import Loading from '../../../../components/Loading.jsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Input, Select } from 'antd'
import { formatDate, formatDateTime } from '../../../../utils/dateparse.jsx'
import { useNavigate } from 'react-router-dom'
import { useEmailToast } from '../../../../hooks/useEmailToast'
import { useUserData } from '../../../../hooks/useUserData'

const DialogCreate = ({ classes, students, onClose, onCreateSuccess }) => {
  const { user } = useUserData()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredClasses, setFilteredClasses] = useState([])
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false)
  const [filteredStudents, setFilteredStudents] = useState([])
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false)
  const [filteredMedicines, setFilteredMedicines] = useState([])
  const [formDate, setFormData] = useState({
    eventTitle: '',
    location: '',
    description: '',
    level: '',
    solution: '',
    recordBy: '',
    classSelected: null,
    classSearch: '',
    studentSelected: null,
    studentSearch: '',
    selectedMedicines: [],
    medicineSearch: ''
  })

  const {
    data: medicines,
    isLoading: medicinesLoading,
    isError: _medicinesError
  } = useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const response = await api.get('/medicines')
      return response.data
    }
  })

  const handleClassSelect = classSelected => {
    setFormData(prev => ({
      ...prev,
      classSelected: classSelected,
      classSearch: classSelected.name,
      studentSelected: null,
      studentSearch: ''
    }))
    setShowSuggestions(false)
    setShowStudentSuggestions(false)
    setFilteredStudents([])
  }

  const handleClassSearch = value => {
    setFormData(prev => ({ ...prev, classSearch: value }))

    if (value.length > 0) {
      const filtered = classes.filter(classItem => classItem.name.toLowerCase().includes(value.toLowerCase()))
      setFilteredClasses(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setFilteredClasses([])
    }
  }

  const handleStudentSelect = studentSelected => {
    setFormData(prev => ({
      ...prev,
      studentSelected: studentSelected,
      studentSearch: studentSelected.fullName
    }))
    setShowStudentSuggestions(false)
  }

  const handleStudentSearch = value => {
    setFormData(prev => ({ ...prev, studentSearch: value }))

    if (value.length > 0 && formDate.classSelected && students) {
      console.log('Selected class:', formDate.classSelected)
      console.log('All students:', students)

      const classCode = formDate.classSelected.classCode || formDate.classSelected.code || formDate.classSelected.name
      console.log('Using classCode:', classCode)

      const studentsInClass = students.filter(student => student.classCode === classCode)
      console.log('Students in class:', studentsInClass)
      const filtered = studentsInClass.filter(student => student.fullName.toLowerCase().includes(value.toLowerCase()))
      setFilteredStudents(filtered)
      setShowStudentSuggestions(true)
    } else {
      setShowStudentSuggestions(false)
      setFilteredStudents([])
    }
  }

  const handleMedicineSearch = value => {
    setFormData(prev => ({ ...prev, medicineSearch: value }))

    if (value.length > 0 && medicines) {
      const filtered = medicines.filter(
        medicine =>
          medicine.name.toLowerCase().includes(value.toLowerCase()) ||
          medicine.code.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredMedicines(filtered)
      setShowMedicineSuggestions(true)
    } else {
      setShowMedicineSuggestions(false)
      setFilteredMedicines([])
    }
  }

  const handleMedicineSelect = medicine => {
    const newMedicine = {
      id: Date.now(),
      medicineId: medicine.id,
      name: medicine.name,
      code: medicine.code,
      unit: medicine.unit || 'viên',
      quantity: 1,
      note: ''
    }
    setFormData(prev => ({
      ...prev,
      selectedMedicines: [...prev.selectedMedicines, newMedicine],
      medicineSearch: ''
    }))
    setShowMedicineSuggestions(false)
  }

  const handleMedicineQuantityChange = (id, quantity) => {
    setFormData(prev => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.map(med =>
        med.id === id ? { ...med, quantity: parseInt(quantity) || 0 } : med
      )
    }))
  }

  const handleMedicineNoteChange = (id, note) => {
    setFormData(prev => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.map(med => (med.id === id ? { ...med, note } : med))
    }))
  }

  const removeMedicine = id => {
    setFormData(prev => ({
      ...prev,
      selectedMedicines: prev.selectedMedicines.filter(med => med.id !== id)
    }))
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCancel = () => {
    setFormData({
      eventTitle: '',
      location: '',
      description: '',
      level: '',
      solution: '',
      classSelected: null,
      classSearch: '',
      studentSelected: null,
      studentSearch: '',
      selectedMedicines: [],
      medicineSearch: ''
    })

    onClose()
  }

  const handleSubmit = async () => {
    if (!formDate.studentSelected || !formDate.eventTitle) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc')
      return
    }

    const healthEventData = {
      studentId: formDate.studentSelected.studentId,
      problem: formDate.eventTitle,
      description: formDate.description,
      solution: formDate.solution,
      location: formDate.location,
      recordBy: user?.id,
      extent: formDate.level,
      eventTime: new Date().toISOString(),
      medicines: formDate.selectedMedicines.map(med => ({
        medicineId: med.medicineId,
        quantity: med.quantity,
        unit: med.unit,
        note: med.note
      }))
    }

    try {
      await api.post('/health-event', healthEventData)
      alert('Tạo sự kiện y tế thành công')
      handleCancel()
      onCreateSuccess()
    } catch (error) {
      console.error('Error creating health event:', error)
      alert('Có lỗi xảy ra khi tạo sự kiện y tế')
    }
  }

  return (
    <div className="font-inter fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="rounded-t-2xl bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-6 text-white">
          <h2 className="text-center text-2xl font-bold">TẠO SỰ KIỆN Y TẾ</h2>
          <p className="mt-2 text-center text-teal-100">Ghi nhận và xử lý tình huống sức khỏe học sinh</p>
        </div>

        <div className="p-8">
          <div className="mb-8 rounded-xl bg-teal-50 p-6">
            <h3 className="mb-4 flex items-center text-xl font-bold text-teal-700">
              <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                1
              </div>
              Thông tin học sinh
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Lớp *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formDate.classSearch}
                    onChange={e => handleClassSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                    placeholder="Nhập tên lớp cần tìm"
                  />
                  {showSuggestions && filteredClasses.length > 0 && (
                    <div className="absolute top-full left-0 z-10 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {filteredClasses.map(classItem => (
                        <div
                          key={classItem.id}
                          className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                          onClick={() => handleClassSelect(classItem)}
                        >
                          {classItem.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Học sinh *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formDate.studentSearch}
                    onChange={e => handleStudentSearch(e.target.value)}
                    className={`w-full rounded-lg border px-4 py-3 transition-all duration-200 ${
                      formDate.classSelected
                        ? 'cursor-text border-gray-300 bg-white text-gray-900 focus:border-transparent focus:ring-2 focus:ring-teal-600 focus:outline-none'
                        : 'cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400'
                    }`}
                    placeholder={formDate.classSelected ? 'Nhập tên học sinh' : 'Vui lòng chọn lớp trước'}
                    disabled={!formDate.classSelected}
                  />
                  {showStudentSuggestions && filteredStudents.length > 0 && (
                    <div className="absolute top-full left-0 z-10 max-h-40 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                      {filteredStudents.map(student => (
                        <div
                          key={student.id}
                          className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                          onClick={() => handleStudentSelect(student)}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-gray-500">Ngày sinh: {formatDate(student.dateOfBirth)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {formDate.studentSelected && (
              <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={formDate.studentSelected.avatar || '/default-avatar.png'}
                      alt={formDate.studentSelected.fullName}
                      className="h-16 w-16 rounded-full border-2 border-green-300 object-cover"
                      onError={e => {
                        e.target.src = '/default-avatar.png'
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">{formDate.studentSelected.fullName}</h4>
                    <p className="text-gray-600">
                      Mã HS: {formDate.studentSelected.studentCode} | Lớp: {formDate.studentSelected.classCode}
                    </p>
                    <p className="text-sm text-gray-500">
                      Ngày sinh: {formatDate(formDate.studentSelected.dateOfBirth)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mb-8 rounded-xl bg-emerald-50 p-6">
            <h3 className="mb-4 flex items-center text-xl font-bold text-teal-700">
              <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                2
              </div>
              Chi tiết sự kiện
            </h3>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Tên sự kiện *</label>
                <input
                  type="text"
                  value={formDate.eventTitle}
                  onChange={e => handleInputChange('eventTitle', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                  placeholder="Ví dụ: Đau bụng, Sốt cao, Chấn thương..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Mức độ nghiêm trọng</label>
                <Select
                  className="w-full"
                  size="large"
                  placeholder="Chọn mức độ"
                  options={[
                    { label: 'Tất cả', value: 'ALL' },
                    { label: 'Nghiêm trọng', value: 'DANGEROUS' },
                    { label: 'Bình thường', value: 'NORMAL' }
                  ]}
                  onChange={e => handleInputChange('level', e)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Địa điểm</label>
                <input
                  type="text"
                  value={formDate.location}
                  onChange={e => handleInputChange('location', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                  placeholder="Ví dụ: Phòng y tế, Lớp học, Sân chơi..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Xử lý</label>
                <input
                  type="text"
                  value={formDate.solution}
                  onChange={e => handleInputChange('solution', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                  placeholder="Mô tả cách xử lý tình huống"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Mô tả chi tiết</label>
              <textarea
                value={formDate.description}
                onChange={e => handleInputChange('description', e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                rows="4"
                placeholder="Mô tả chi tiết về tình trạng sức khỏe và các triệu chứng..."
              />
            </div>
          </div>

          <div className="mb-8 rounded-xl bg-amber-50 p-6">
            <h3 className="mb-4 flex items-center text-xl font-bold text-teal-700">
              <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white">
                3
              </div>
              Thuốc và vật dụng y tế
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-gray-700">Thêm thuốc/vật dụng</label>
              <div className="relative">
                <input
                  type="text"
                  value={formDate.medicineSearch}
                  onChange={e => handleMedicineSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-10 focus:border-transparent focus:ring-2 focus:ring-[#023E73] focus:outline-none"
                  placeholder="Tìm kiếm thuốc hoặc vật dụng y tế..."
                  disabled={medicinesLoading}
                />
                <Package className="absolute top-3.5 left-3 h-5 w-5 text-gray-400" />
                {showMedicineSuggestions && filteredMedicines.length > 0 && (
                  <div className="absolute top-full left-0 z-10 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredMedicines.map(medicine => (
                      <div
                        key={medicine.id}
                        className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-orange-50"
                        onClick={() => handleMedicineSelect(medicine)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{medicine.name}</div>
                            <div className="text-sm text-gray-500">
                              Mã: {medicine.code} | Còn lại: {medicine.quantityOnHand || 0} {medicine.unit}
                            </div>
                          </div>
                          <Plus className="h-4 w-4 text-teal-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {formDate.selectedMedicines.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-700">Thuốc/vật dụng đã chọn:</h4>
                {formDate.selectedMedicines.map(medicine => (
                  <div key={medicine.id} className="rounded-lg border border-orange-200 bg-white p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{medicine.name}</h5>
                        <p className="text-sm text-gray-500">Mã: {medicine.code}</p>
                      </div>
                      <button
                        onClick={() => removeMedicine(medicine.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Số lượng</label>
                        <input
                          type="number"
                          min="1"
                          value={medicine.quantity}
                          onChange={e => handleMedicineQuantityChange(medicine.id, e.target.value)}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#023E73] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Đơn vị</label>
                        <input
                          type="text"
                          value={medicine.unit}
                          readOnly
                          className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-600">Ghi chú</label>
                        <input
                          type="text"
                          value={medicine.note}
                          onChange={e => handleMedicineNoteChange(medicine.id, e.target.value)}
                          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:ring-1 focus:ring-[#023E73] focus:outline-none"
                          placeholder="Ghi chú sử dụng"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-b-2xl border-t border-gray-200 bg-gray-50 px-8 py-6">
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 px-8 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-8 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-teal-500/50 hover:brightness-110 active:scale-95"
            >
              <Plus className="h-5 w-5" />
              Tạo sự kiện y tế
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const MedicationEvent = () => {
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { sendEmailWithProgress, isSending } = useEmailToast()

  const {
    data: totalHealthEventStatus,
    isLoading: totalHealthEventStatusLoading,
    isError: totalHealthEventStatusError,
    error: totalHealthEventStatusErrorMessage
  } = useQuery({
    queryKey: ['totalHealthEventStatus'],
    queryFn: async () => {
      const response = await api.get('/health-event/statistics')
      return response.data
    }
  })

  const {
    data: medicationEvent,
    isLoading: medicationEventLoading,
    isError: medicationEventError,
    error: medicationEventErrorMessage
  } = useQuery({
    queryKey: ['medicationEvent'],
    queryFn: async () => {
      const response = await api.get('/health-event')
      return response.data
    }
  })

  const {
    data: classes,
    isLoading: classesLoading,
    isError: classesError,
    error: classesErrorMessage
  } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const response = await api.get('/classes')
      return response.data
    }
  })

  const {
    data: students,
    isLoading: studentsLoading,
    isError: studentsError,
    error: studentsErrorMessage
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students')
      return response.data
    }
  })

  const isLoading = totalHealthEventStatusLoading || medicationEventLoading || classesLoading || studentsLoading
  const isError = totalHealthEventStatusError || medicationEventError || classesError || studentsError
  const errorMessage =
    totalHealthEventStatusErrorMessage || medicationEventErrorMessage || classesErrorMessage || studentsErrorMessage

  if (isLoading) return <Loading />
  if (isError) return <div>Error: {errorMessage?.message || 'Failed to fetch health event statistics'}</div>

  let filteredEvents = medicationEvent.filter(
    event =>
      event.problem?.toLowerCase().includes(search.toLowerCase()) ||
      event.description?.toLowerCase().includes(search.toLowerCase()) ||
      event.solution?.toLowerCase().includes(search.toLowerCase()) ||
      event.student.fullName?.toLowerCase().includes(search.toLowerCase())
  )

  if (level && level !== 'ALL') {
    filteredEvents = filteredEvents.filter(event => event.extent === level)
  }

  filteredEvents = filteredEvents.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))

  const handleCreateHealthEvent = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries(['medicationEvent'])
  }

  const handleExtent = status => {
    if (!status) return { text: 'Lỗi trạng thái', bgColor: 'bg-[#FFF694]' }
    switch (status.toUpperCase()) {
      case 'DANGEROUS':
        return { text: 'Nghiêm trọng', bgColor: 'bg-[#FFCCCC]' }
      case 'NORMAL':
        return { text: 'Bình thường', bgColor: 'bg-[#D1FAE5]' }
      default:
        return { text: 'Trạng thái lạ', bgColor: 'bg-[#FFF694]' }
    }
  }

  const handleSendEmailNotification = async eventId => {
    await sendEmailWithProgress(eventId, 0, async () => {
      const response = await api.post(`/health-event/${eventId}/send-email-notifications`)
      return {
        ...response,
        data: {
          ...response.data,
          actualCount: response.data.totalParentsNotified || response.data.totalEmailsSent || 0
        }
      }
    })
  }

  return (
    <>
      <style>
        {`
					input:focus, textarea:focus {
						border-color: #10b981 !important;
						box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
						outline: none !important;
					}
					.ant-select-focused .ant-select-selector {
						border-color: #10b981 !important;
						box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
					}
					.ant-select:hover .ant-select-selector {
						border-color: #10b981 !important;
					}
					.ant-select-selection-search-input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
					.ant-select-selector input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
					.ant-select-dropdown .ant-select-item-option-selected {
						background-color: #10b981 !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item-option-active {
						background-color: #10b981 !important;
						color: white !important;
					}
				`}
      </style>
      <div className="font-inter">
        <div className="mb-10 flex max-w-full flex-col justify-between gap-10 md:flex-row md:gap-0">
          <DetailBox
            title="Tổng cộng"
            icon={<Bell size={28} />}
            number={totalHealthEventStatus.totalHealthEvent}
            width={350}
            gap={20}
            titleSize={22}
            bgColor="bg-gradient-to-r from-teal-500 to-teal-600"
          />
          <DetailBox
            title="Ca bình thường"
            icon={<CircleCheckBig size={28} />}
            number={totalHealthEventStatus.totalNormalCase}
            width={350}
            gap={20}
            titleSize={22}
            bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
          />
          <DetailBox
            title="Ca nguy hiểm"
            icon={<CircleAlert size={28} />}
            number={totalHealthEventStatus.totalDangerousCase}
            width={350}
            gap={20}
            titleSize={22}
            bgColor="bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
        <h1 className="mb-6 text-2xl font-bold">Danh sách sự kiện y tế</h1>
        <div className="flex w-full items-center justify-between">
          <Input
            prefix={<Search size={16} className="mr-4 text-gray-400" />}
            placeholder="Tìm kiếm sự kiện y tế"
            style={{ width: 280 }}
            className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <div className="flex items-center gap-6">
            <p className="text-lg font-bold">Mức độ nghiêm trọng</p>
            <Select
              className="custom-select-gray"
              placeholder="Chọn mức độ"
              options={[
                { label: 'Tất cả', value: 'ALL' },
                { label: 'Nghiêm trọng', value: 'DANGEROUS' },
                { label: 'Bình thường', value: 'NORMAL' }
              ]}
              onChange={e => setLevel(e)}
            />
          </div>

          <div className="flex gap-10">
            <button
              onClick={handleCreateHealthEvent}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 px-7 py-1.5 text-base font-semibold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-teal-500/50 hover:brightness-110 active:scale-95"
            >
              <Plus size={18} />
              Thêm sự kiện y tế
            </button>

            {isDialogOpen && (
              <DialogCreate
                classes={classes}
                students={students}
                onClose={handleCloseDialog}
                onCreateSuccess={handleCreateSuccess}
              />
            )}
          </div>
        </div>

        <div className="mt-6">
          {filteredEvents && filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 px-28 py-6">
              {filteredEvents.map((event, index) => {
                const { text: statusText, bgColor } = handleExtent(event.extent)
                return (
                  <div key={event.id || index} className="border-b p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex w-full flex-col gap-3">
                        <div className="flex w-full justify-between">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-6">
                              <div className="ml-4">
                                <Activity size={55} />
                              </div>
                              <div className="flex flex-col gap-3">
                                <h3 className="text-lg font-bold text-gray-900">Sự kiện: {event.problem}</h3>
                                <p>Học sinh: {event.student.fullName}</p>
                                <p>Địa điểm: {event.location}</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3">
                              <p className="max-w-2xl break-words">
                                <span className="font-bold">Xử lý:</span> {event.solution}
                              </p>
                              <p className="max-w-2xl break-words">
                                <span className="font-bold">Mô tả:</span> {event.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-8">
                            <div className="flex w-fit flex-col justify-center gap-2">
                              <p className={`rounded-full px-3 py-1 text-sm ${bgColor} text-center font-bold`}>
                                {statusText}
                              </p>
                              <button
                                onClick={() => handleSendEmailNotification(event.id)}
                                disabled={isSending(event.id)}
                                className={`flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                                  isSending(event.id)
                                    ? 'cursor-not-allowed bg-gray-400 text-gray-600 opacity-60'
                                    : 'cursor-pointer bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:scale-105 hover:shadow-md hover:shadow-teal-500/50 hover:brightness-110 active:scale-95'
                                }`}
                              >
                                {isSending(event.id) ? (
                                  <>
                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"></div>
                                    Đang gửi...
                                  </>
                                ) : (
                                  <>
                                    <Send size={12} />
                                    Gửi thông báo
                                  </>
                                )}
                              </button>
                              <p className="text-sm text-gray-500 italic">
                                Thời gian: {formatDateTime(event.eventTime)}
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/manager/medication-event/${event.id}`)}
                              className="group cursor-pointer rounded-lg p-2 transition-all duration-300 ease-in-out"
                            >
                              <ChevronRight
                                size={20}
                                className="text-gray-500 transition-all duration-300 ease-in-out group-hover:translate-x-1 group-hover:scale-110 group-hover:text-teal-600"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-500">Không có sự kiện y tế nào phù hợp với bộ lọc</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default MedicationEvent
