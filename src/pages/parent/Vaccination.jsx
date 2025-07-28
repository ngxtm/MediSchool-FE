import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import api from '../../utils/api'
import { useStudent } from '../../context/StudentContext'
import { UserAuth } from '../../context/AuthContext'
import { formatDate } from '../../utils/dateparse'
import { useLocation, useNavigate } from 'react-router-dom'
import { useVaccineCategories } from '../../hooks/useVaccineCategories'
import successToast, { errorToast } from '../../components/ToastPopup'
import { FileDown, Plus } from 'lucide-react'

const RejectReasonModal = ({ isOpen, onClose, onSubmit }) => {
  const [rejectNote, setRejectNote] = useState('')

  if (!isOpen) return null

  const handleSubmit = () => {
    if (!rejectNote.trim()) {
      alert('Vui lòng nhập lý do từ chối tham gia')
      return
    }
    onSubmit(rejectNote.trim())
    setRejectNote('')
  }

  const handleCancel = () => {
    setRejectNote('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-6">
          <h2 className="text-center text-xl font-bold text-black">Phụ huynh vui lòng thông tin thêm</h2>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-black">Lý do từ chối tham gia</label>
            <textarea
              value={rejectNote}
              onChange={e => setRejectNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="4"
              placeholder="Lý do từ chối tham gia"
            />
          </div>
        </div>

        <div className="flex gap-4 px-6 py-4">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-[#023E73] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#034a8a]"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

const AddVaccinationHistoryModal = ({
  isOpen,
  onClose,
  onSubmit,
  studentId,
  categories,
  categoriesLoading,
  categoriesError
}) => {
  const { session } = UserAuth()
  const [formData, setFormData] = useState({
    selectedVaccine: null,
    vaccineSearch: '',
    vaccinationDate: '',
    location: '',
    note: ''
  })
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredVaccines, setFilteredVaccines] = useState([])
  const errorToastPopup = errorToast

  const vaccinesQuery = useQuery({
    queryKey: ['vaccines'],
    queryFn: () => api.get('/vaccines'),
    enabled: isOpen
  })

  if (!isOpen) return null

  const vaccines = vaccinesQuery.data?.data || []

  const handleVaccineSearch = value => {
    setFormData(prev => ({ ...prev, vaccineSearch: value }))

    if (value.length > 0) {
      const filtered = vaccines.filter(vaccine => vaccine.name.toLowerCase().includes(value.toLowerCase()))
      setFilteredVaccines(filtered)
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
      setFilteredVaccines([])
    }
  }

  const handleVaccineSelect = vaccine => {
    setFormData(prev => ({
      ...prev,
      selectedVaccine: vaccine,
      vaccineSearch: vaccine.name
    }))
    setShowSuggestions(false)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (!formData.selectedVaccine || !formData.vaccinationDate || !formData.location) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    const historyData = {
      studentId: studentId,
      eventId: null,
      vaccine: {
        vaccineId: formData.selectedVaccine.vaccineId,
        name: formData.selectedVaccine.name,
        description: formData.selectedVaccine.description,
        manufacturer: formData.selectedVaccine.manufacturer,
        dosesRequired: formData.selectedVaccine.dosesRequired,
        storageTemperature: formData.selectedVaccine.storageTemperature,
        sideEffects: formData.selectedVaccine.sideEffects,
        categoryId: formData.selectedVaccine.categoryId
      },
      vaccinationDate: formData.vaccinationDate,
      location: formData.location,
      note: formData.note,
      createdBy: session?.user?.id || null,
      createdAt: new Date().toISOString()
    }

    try {
      await api.post('/vaccination-history', historyData)
      onSubmit()
      handleCancel()
    } catch {
      errorToastPopup('Đã tiêm đủ mũi cho chủng bệnh này không thể thêm lịch sử tiêm chủng')
    }
  }

  const handleCancel = () => {
    setFormData({
      selectedVaccine: null,
      vaccineSearch: '',
      vaccinationDate: '',
      location: '',
      note: ''
    })
    setShowSuggestions(false)
    onClose()
  }

  const getSelectedCategory = () => {
    if (!formData.selectedVaccine) {
      return ''
    }

    const categoryId = formData.selectedVaccine.categoryId

    const category = categories.find(cat => cat.categoryId === categoryId)

    return category?.categoryName || ''
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
        <div className="border-b border-gray-200 px-6 py-6">
          <h2 className="text-center text-xl font-bold text-black">THÔNG TIN HỒ SƠ TIÊM CHỦNG</h2>
        </div>

        <div className="space-y-6 p-6">
          <div className="relative">
            <label className="mb-2 block text-sm font-semibold text-black">Vaccine</label>
            <input
              type="text"
              value={formData.vaccineSearch}
              onChange={e => handleVaccineSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nhập tên vaccine..."
            />

            {showSuggestions && filteredVaccines.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                {filteredVaccines.map(vaccine => (
                  <div
                    key={vaccine.vaccineId}
                    onClick={() => handleVaccineSelect(vaccine)}
                    className="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 hover:bg-blue-50"
                  >
                    <div className="font-medium">{vaccine.name}</div>
                    {vaccine.manufacturer && <div className="text-sm text-gray-500">{vaccine.manufacturer}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Phòng bệnh</label>
            <textarea
              value={getSelectedCategory()}
              readOnly
              className="min-h-[48px] w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-600"
              placeholder={
                categoriesLoading
                  ? 'Đang tải danh mục...'
                  : categoriesError
                    ? 'Lỗi tải danh mục'
                    : 'Sẽ tự động điền khi chọn vaccine'
              }
              rows="2"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Ngày tiêm</label>
            <input
              type="date"
              value={formData.vaccinationDate}
              onChange={e => handleInputChange('vaccinationDate', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Địa điểm</label>
            <input
              type="text"
              value={formData.location}
              onChange={e => handleInputChange('location', e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ví dụ: VNVC, Trạm y tế phường A,..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-black">Ghi chú (tùy chọn)</label>
            <textarea
              value={formData.note}
              onChange={e => handleInputChange('note', e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="3"
              placeholder="Ghi chú thêm về mũi tiêm..."
            />
          </div>
        </div>

        <div className="flex gap-4 px-6 py-4">
          <button
            onClick={handleCancel}
            className="flex-1 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-black transition-colors hover:bg-gray-400"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 rounded-lg bg-[#023E73] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#034a8a]"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  )
}

const ConsentModal = ({ consent, isOpen, onClose, onSubmit, onReject }) => {
  if (!isOpen || !consent) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 p-4 backdrop-blur-md before:absolute before:inset-0 before:-z-10 before:bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Đơn đề nghị tiêm chủng</h2>
            <button onClick={onClose} className="text-white transition-colors hover:text-gray-200">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-xl bg-blue-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-bold text-blue-900">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Thông tin vaccine
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Tên vaccine</p>
                <p className="font-semibold text-gray-900">{consent?.event?.vaccine?.name || 'Chưa có thông tin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày dự kiến</p>
                <p className="font-semibold text-gray-900">
                  {formatDate(consent?.event?.eventDate) ?? 'Chưa xác định'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa điểm</p>
                <p className="font-semibold text-gray-900">{consent.location || 'Trường học'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phòng bệnh</p>
                <p className="font-semibold text-gray-900">{consent?.category?.categoryName || '1'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-green-50 p-4">
            <h3 className="mb-3 flex items-center text-lg font-bold text-green-900">
              <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Thông tin học sinh
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-semibold text-gray-900">{consent?.student?.fullName || 'Chưa có thông tin'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Lớp</p>
                <p className="font-semibold text-gray-900">{consent?.student?.classCode || 'Chưa có thông tin'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-r-xl border-l-4 border-yellow-400 bg-yellow-50 p-4">
            <div className="flex">
              <svg
                className="mt-0.5 mr-3 h-5 w-5 text-yellow-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="font-semibold text-yellow-800">Lưu ý quan trọng</h4>
                <p className="mt-1 text-sm text-yellow-700">
                  Việc tiêm chủng là tự nguyện. Quý phụ huynh vui lòng tham khảo ý kiến bác sĩ nếu con em có tiền sử dị
                  ứng hoặc bệnh lý đặc biệt.
                </p>
              </div>
            </div>
          </div>

          {consent.note && (
            <div className="rounded-xl bg-gray-50 p-4">
              <h3 className="mb-3 text-lg font-bold text-gray-900">Ghi chú từ trường</h3>
              <p className="text-gray-700">{consent.note}</p>
            </div>
          )}
        </div>

        <div className="rounded-b-2xl bg-gray-50 px-6 py-4">
          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              onClick={() => onSubmit('REMIND_LATER')}
              className="rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Để sau quyết định
            </button>
            <button
              onClick={onReject}
              className="rounded-lg bg-red-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
            >
              Không tham gia
            </button>
            <button
              onClick={() => onSubmit('APPROVE')}
              className="rounded-lg bg-green-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-600"
            >
              Đồng ý tham gia
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const Vaccination = () => {
  const { selectedStudent, selectStudent, studentsList } = useStudent()
  const [selectedConsent, setSelectedConsent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddHistoryModalOpen, setIsAddHistoryModalOpen] = useState(false)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isLoadingStudent, setIsLoadingStudent] = useState(false)
  const queryClient = useQueryClient()
  const location = useLocation()
  const navigate = useNavigate()
  const errorToastPopup = errorToast
  const successToastPopup = successToast
  const categoriesQuery = useVaccineCategories()

  const consentsQuery = useQuery({
    queryKey: ['vaccine-consents', selectedStudent?.studentId],
    queryFn: () => api.get(`/vaccine-consents/student/${selectedStudent?.studentId}/detail_list`),
    enabled: !!selectedStudent?.studentId
  })

  const exportPDFMutation = useMutation({
    mutationFn: async studentId => {
      const response = await api.get(`/vaccination-history/student/${studentId}/pdf`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `vaccination-history-student-${studentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)

      return { success: true }
    }
  })

  const consents = useMemo(() => consentsQuery.data?.data || [], [consentsQuery.data])

  useEffect(() => {
    const query = new URLSearchParams(location.search)
    const consentId = query.get('consentId')

    if (consentId) {
      const foundConsent = consents.find(c => String(c.id) === String(consentId))
      if (foundConsent && selectedStudent) {
        setSelectedConsent(foundConsent)
        setIsModalOpen(true)
        return
      }

      if (!foundConsent && studentsList.length > 0) {
        setIsLoadingStudent(true)
        api
          .get(`/vaccine-consents/${consentId}`)
          .then(res => {
            const consent = res.data
            if (consent && consent.student) {
              const targetStudent = studentsList.find(s => s.studentId === consent.student.studentId)
              if (targetStudent) {
                selectStudent(targetStudent)
              }
            }
          })
          .catch(error => {
            console.error('Error fetching consent:', error)
          })
          .finally(() => setIsLoadingStudent(false))
      }
    }
  }, [location.search, selectedStudent, consents, studentsList, selectStudent])

  const vaccinationHistoryQuery = useQuery({
    queryKey: ['vaccination-history', selectedStudent?.studentId],
    queryFn: () => api.get(`/vaccination-history/student/${selectedStudent?.studentId}/by-category`),
    enabled: !!selectedStudent?.studentId
  })

  const updateConsentMutation = useMutation({
    mutationFn: ({ consentId, status, note }) =>
      api.put(`/vaccine-consents/${consentId}/status`, {
        status: status,
        note: note || ''
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['vaccine-consents', selectedStudent?.studentId])
      setIsModalOpen(false)
      setSelectedConsent(null)
    },
    onError: () => {
      errorToastPopup('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.')
    }
  })

  const handleViewConsent = consent => {
    setSelectedConsent(consent)
    setIsModalOpen(true)
  }

  const handleSubmitConsent = status => {
    if (selectedConsent) {
      updateConsentMutation.mutate({
        consentId: selectedConsent.id,
        status: status,
        note: ''
      })
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedConsent(null)
    const params = new URLSearchParams(location.search)
    params.delete('consentId')
    navigate({ search: params.toString() }, { replace: true })
  }

  const handleAddHistory = () => {
    setIsAddHistoryModalOpen(true)
  }

  const handleCloseAddHistoryModal = () => {
    setIsAddHistoryModalOpen(false)
  }

  const handleSubmitAddHistory = () => {
    queryClient.invalidateQueries(['vaccination-history', selectedStudent?.studentId])
    setIsAddHistoryModalOpen(false)
  }

  const handleRejectConsent = () => {
    setIsRejectModalOpen(true)
  }

  const handleCloseRejectModal = () => {
    setIsRejectModalOpen(false)
  }

  const handleSubmitReject = note => {
    if (selectedConsent) {
      updateConsentMutation.mutate({
        consentId: selectedConsent.id,
        status: 'REJECT',
        note: note
      })
    }
    setIsRejectModalOpen(false)
  }

  if (isLoadingStudent) {
    return <div className="flex h-64 items-center justify-center">Đang tải học sinh...</div>
  }
  if (!selectedStudent) {
    return <div className="flex h-64 items-center justify-center">Vui lòng chọn học sinh</div>
  }

  if (consentsQuery.isLoading || vaccinationHistoryQuery.isLoading) {
    return <div className="flex h-64 items-center justify-center">Đang tải...</div>
  }

  if (consentsQuery.error || vaccinationHistoryQuery.error) {
    return <div className="flex h-64 items-center justify-center text-red-500">Có lỗi xảy ra khi tải dữ liệu</div>
  }

  const upcomingConsents = consents.filter(
    consent =>
      consent.consentStatus === null || consent.consentStatus === undefined || consent.consentStatus === 'REMIND_LATER'
  )

  const vaccinationHistory = vaccinationHistoryQuery.data?.data || {}

  const handleExportPDF = () => {
    exportPDFMutation.mutate(selectedStudent?.studentId)
    successToastPopup('Đã xuất file PDF thành công', 'top-right', 2000)
  }

  return (
    <>
      <div className="font-inter flex flex-col justify-between gap-4 md:flex-row md:gap-30">
        <div className="flex flex-col gap-6 md:w-1/2">
          <h1 className="text-2xl font-bold">Mũi tiêm kế tiếp</h1>
          <div className="max-h-[55vh] min-h-0 flex-1 overflow-y-auto rounded-lg">
            {upcomingConsents.length > 0 ? (
              <div className="space-y-6">
                {upcomingConsents.map((consent, index) => (
                  <div key={index} className="flex flex-row justify-between rounded-xl bg-[#DAEAF7] px-12 py-5">
                    <div className="flex flex-col gap-4">
                      <p className="text-xl font-bold">{consent?.event?.vaccine?.name || 'Tên vaccine'}</p>
                      <p>{formatDate(consent?.event?.eventDate) ?? 'Chưa có lịch'}</p>
                    </div>
                    <div className="flex flex-col gap-4">
                      <p className="italic">
                        {consent?.consentStatus === 'APPROVE'
                          ? 'Đã phê duyệt'
                          : consent?.consentStatus === 'REJECT'
                            ? 'Đã từ chối'
                            : 'Chờ phê duyệt'}
                      </p>
                      <button
                        onClick={() => handleViewConsent(consent)}
                        className="underline transition-colors hover:text-blue-600"
                      >
                        Xem giấy đồng thuận
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-gray-100 px-12 py-5 text-center">
                <p className="text-gray-600">Không có mũi tiêm nào đang chờ phê duyệt</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-6 md:w-1/2">
          <h1 className="text-2xl font-bold">Lịch sử tiêm chủng</h1>
          <div className="max-h-[55vh] min-h-0 flex-1 overflow-y-auto rounded-lg">
            {Object.keys(vaccinationHistory).length > 0 ? (
              Object.entries(vaccinationHistory).map(([categoryName, historyList]) => (
                <div key={categoryName} className="mb-6">
                  <h1 className="mb-0 rounded-xl bg-[#DAEAF7] px-6 py-3 text-xl font-bold">{categoryName}</h1>
                  {historyList.map(history => (
                    <div
                      key={history.historyId}
                      className="flex justify-between border-b border-gray-200 last:border-b-0"
                    >
                      <div className="px-6 py-3">
                        <p className="text-lg font-semibold">Mũi {history.doseNumber || 1}</p>
                        <p className="text-gray-500">{formatDate(history.vaccinationDate)}</p>
                      </div>
                      <div className="px-6 py-3">
                        <p className="text-gray-600">{history.location || 'Trường học'}</p>
                        <p className="font-bold">{history.vaccine?.manufacturer || history.vaccine?.name}</p>
                      </div>
                      <button
                        className="flex items-center px-6"
                        onClick={() => navigate(`/parent/vaccination/${history.historyId}`)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-chevron-right-icon lucide-chevron-right cursor-pointer"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-gray-100 px-6 py-8 text-center">
                <p className="text-gray-600">Chưa có lịch sử tiêm chủng</p>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleExportPDF}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#023E73] px-4 py-3 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-[#034a8a] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <FileDown
                size={22}
                className="transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-12 group-hover:text-blue-200 group-hover:drop-shadow-lg"
              />
              Xuất PDF
            </button>
            <button
              onClick={handleAddHistory}
              className="group flex w-full items-center justify-center gap-2 rounded-lg bg-[#023E73] px-4 py-3 text-lg font-semibold text-white transition-all duration-300 ease-in-out hover:scale-[1.02] hover:bg-[#034a8a] hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
            >
              <Plus
                size={22}
                className="transition-all duration-300 ease-in-out group-hover:scale-110 group-hover:rotate-90 group-hover:drop-shadow-lg"
              />
              Thêm lịch sử tiêm chủng
            </button>
          </div>
        </div>
      </div>

      <ConsentModal
        consent={selectedConsent}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitConsent}
        onReject={handleRejectConsent}
      />

      <RejectReasonModal isOpen={isRejectModalOpen} onClose={handleCloseRejectModal} onSubmit={handleSubmitReject} />

      <AddVaccinationHistoryModal
        isOpen={isAddHistoryModalOpen}
        onClose={handleCloseAddHistoryModal}
        onSubmit={handleSubmitAddHistory}
        studentId={selectedStudent?.studentId}
        categories={categoriesQuery.data?.data || []}
        categoriesLoading={categoriesQuery.isLoading}
        categoriesError={categoriesQuery.error}
      />
    </>
  )
}

export default Vaccination
