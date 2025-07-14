import { DatePicker, Input } from 'antd'
import DetailBox from '../../components/DetailBox'
import { FileText, CircleAlert, CircleCheckBig, Calendar, Activity, ChevronRight, X, Search } from 'lucide-react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../../utils/api'
import { useEffect, useState } from 'react'
import { Dialog } from 'radix-ui'
import { Select } from 'antd'
import { Zoom, toast } from 'react-toastify'
import { Link } from 'react-router-dom'
import { parseDate, formatDate } from '../../../../utils/dateparse'
import Loading from '../../../../components/Loading'
import useActorNavigation from '../../../../hooks/useActorNavigation'

const DialogCreate = ({ open, onOpenChange, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    vaccineId: null,
    eventTitle: '',
    eventDate: null,
    eventScope: '',
    location: '',
    status: 'PENDING',
    classes: []
  })
  const [grades, setGrades] = useState([])
  const [selectedGrade, setSelectedGrade] = useState(null)
  const [vaccines, setVaccines] = useState([])
  const [classes, setClasses] = useState([])

  const queryClient = useQueryClient()
  const toastErrorPopup = message => {
    toast.error(message, {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Zoom
    })
  }

  const toastSuccessPopup = message => {
    toast.success(message, {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Zoom
    })
  }

  useEffect(() => {
    let mounted = true
    let shown = false

    const fetchBase = async () => {
      try {
        const [vRes, cRes, gRes] = await Promise.all([
          api.get('/vaccines'),
          api.get('/classes'),
          api.get('/classes/grades')
        ])
        if (!mounted) return
        setVaccines(vRes.data)
        setClasses(cRes.data)
        setGrades(gRes.data)
      } catch (err) {
        if (mounted && !shown) {
          toastErrorPopup('Error when fetching data: ' + err.message)
          shown = true
        }
      }
    }

    fetchBase()
    return () => (mounted = false)
  }, [])

  const handleInputChange = (field, value) => {
    if (field === 'eventScope') {
      setSelectedGrade(null)
      setFormData(prev => ({ ...prev, classes: [], [field]: value }))
      return
    }
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleGradeChange = async grade => {
    setSelectedGrade(grade)
    try {
      const res = await api.get('/classes/by-grade', { params: { grade } })
      const cls = res.data
      setClasses(cls)
      setFormData(prev => ({
        ...prev,
        classes: cls.map(c => c.name)
      }))
    } catch (err) {
      toastErrorPopup('Error when fetching classes: ' + err.message)
    }
  }

  const createEventMutation = useMutation({
    mutationFn: newEvent => api.post('/vaccine-events', newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-events'] })
      if (onCreateSuccess) onCreateSuccess()
    }
  })

  const handleSubmit = () => {
    if (formData.eventScope === 'GRADE') {
      formData.eventScope = 'CLASS'
    }
    createEventMutation.mutate(formData)
    toastSuccessPopup('Tạo sự kiện tiêm chủng thành công!')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} className="font-inter">
      <Dialog.Trigger asChild>
        <button className="rounded-lg bg-[#023E73] px-7 py-1.5 text-base font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-[#01294d] hover:shadow-lg active:scale-95">
          Tạo lịch tiêm chủng mới
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 max-h-[90vh] w-[90vw] max-w-[630px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-24 py-12 shadow-lg focus:outline-none">
          <Dialog.Title className="font-inter m-0 text-center text-2xl font-bold text-[#023E73]">
            Tạo lịch tiêm chủng mới
          </Dialog.Title>
          <Dialog.Description className="font-inter mt-2.5 mb-5 text-center text-[15px] leading-normal text-gray-600">
            Điền thông tin để tạo lịch tiêm chủng mới cho học sinh
          </Dialog.Description>

          <div className="flex flex-col">
            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="eventTitle">
                Tên sự kiện
              </label>
              <input
                className="h-[30px] w-full rounded-sm border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="eventTitle"
                value={formData.eventTitle}
                onChange={e => handleInputChange('eventTitle', e.target.value)}
                placeholder="Ví dụ: Tiêm chủng, Viêm gan B,..."
              />
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="vaccineId">
                Loại Vaccine
              </label>
              <Select
                className="custom-select w-full"
                placeholder="Chọn loại vaccine"
                value={formData.vaccineId}
                onChange={value => handleInputChange('vaccineId', value)}
                options={vaccines.map(v => ({
                  value: v.vaccineId,
                  label: v.name
                }))}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="eventScope">
                Phạm vi tiêm chủng
              </label>
              <Select
                className="custom-select w-full"
                placeholder="Chọn phạm vi tiêm chủng"
                onChange={value => handleInputChange('eventScope', value)}
                options={[
                  { value: 'SCHOOL', label: 'Học sinh toàn trường' },
                  { value: 'CLASS', label: 'Theo lớp' },
                  { value: 'GRADE', label: 'Theo khối' }
                ]}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </fieldset>

            {formData.eventScope === 'GRADE' && (
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="grade">
                  Khối
                </label>
                <Select
                  className="custom-select w-full"
                  placeholder="Chọn khối"
                  value={selectedGrade}
                  onChange={handleGradeChange}
                  options={grades.map(g => ({ value: g, label: `Khối ${g}` }))}
                  getPopupContainer={t => t.parentNode}
                />
              </fieldset>
            )}

            {formData.eventScope === 'CLASS' && (
              <fieldset className="mb-[15px] flex items-center gap-5">
                <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="eventScope">
                  Lớp
                </label>
                <Select
                  mode="multiple"
                  disabled={formData.eventScope === 'SCHOOL'}
                  className="custom-select w-full"
                  placeholder="Chọn lớp"
                  onChange={value => handleInputChange('classes', value)}
                  options={classes.map(c => ({
                    value: c.name,
                    label: c.name
                  }))}
                  getPopupContainer={trigger => trigger.parentNode}
                />
              </fieldset>
            )}

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="eventDate">
                Ngày bắt đầu
              </label>
              <DatePicker
                className="custom-picker w-full"
                format="DD/MM/YY"
                placeholder="Chọn ngày bắt đầu"
                onChange={date => handleInputChange('eventDate', date ? date.format('YYYY-MM-DD') : '')}
              />
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="eventDate">
                Ngày kết thúc
              </label>
              <DatePicker
                className="custom-picker w-full"
                format="DD/MM/YY"
                placeholder="Chọn ngày kết thúc"
                onChange={date => handleInputChange('eventDate', date ? date.format('YYYY-MM-DD') : '')}
              />
            </fieldset>

            <fieldset className="mb-[15px] flex items-center gap-5">
              <label className="w-[210px] text-left text-[15px] font-semibold" htmlFor="location">
                Địa điểm
              </label>
              <input
                className="h-[30px] w-full rounded-sm border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="location"
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder="Nhập địa điểm tiêm chủng"
              />
            </fieldset>
          </div>

          <div className="mt-[25px] flex justify-end gap-3">
            <Dialog.Close asChild>
              <button className="font-inter inline-flex h-[35px] items-center justify-center rounded bg-gray-200 px-[15px] leading-none font-medium text-gray-800 outline-none hover:bg-gray-300">
                Hủy
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="inline-flex h-[35px] items-center justify-center rounded bg-[#023E73] px-[15px] leading-none font-medium text-white outline-none hover:bg-[#01294d]"
                onClick={handleSubmit}
                disabled={createEventMutation.isPending}
              >
                {createEventMutation.isPending ? 'Đang tạo...' : 'Tạo lịch'}
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-2.5 right-2.5 inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-200 focus:outline-none"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const Vaccination = () => {
  const { navigateWithHistory } = useActorNavigation('nurse')
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState(null)
  const queryClient = useQueryClient()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const onChange = (date, dateString) => {
    setSelectedYear(dateString)
  }

  const handleCreateSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['vaccine-events'] })
    setIsDialogOpen(false)
  }

  const results = useQueries({
    queries: [
      {
        queryKey: ['vaccine-consent-total'],
        queryFn: async () => {
          const response = await api.get('/vaccine-consents')
          return response.data
        }
      },
      {
        queryKey: ['vaccine-events', selectedYear],
        queryFn: async () => {
          const url = selectedYear ? `/vaccine-events/year/${selectedYear}` : '/vaccine-events'
          const response = await api.get(url)
          const eventsWithStats = await Promise.all(
            response.data.map(async event => {
              try {
                const statsResponse = await api.get(`/vaccine-consents/event/${event.id}/results`)
                return { ...event, consentStats: statsResponse.data }
              } catch {
                return { ...event, consentStats: null }
              }
            })
          )

          return eventsWithStats
        },
        enabled: true
      },
      {
        queryKey: ['upcoming-vaccine-events'],
        queryFn: async () => {
          const response = await api.get('/vaccine-events/upcoming')
          return response.data
        }
      }
    ]
  })

  const isLoading = results.some(result => result.isLoading)
  const isError = results.some(result => result.isError)

  if (isLoading) {
    return <Loading />
  }

  if (isError) {
    return <div>Error loading data</div>
  }

  const [consentTotal, vaccineEvents, upcomingEvents] = results.map(result => result.data)
  const sortedEvents = [...(vaccineEvents || [])]
    .filter(event => (event.eventTitle ?? '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))

  const getStatusDisplay = (status, date) => {
    if (!status) return { text: 'Lỗi trạng thái', bgColor: 'bg-[#DAEAF7]' }

    switch (status.toUpperCase()) {
      case 'APPROVED':
        if (date === new Date().toLocaleDateString()) {
          return { text: 'Đang diễn ra', bgColor: 'bg-[#DAEAF7]' }
        }
        return { text: 'Đã duyệt', bgColor: 'bg-[#DAEAF7]' }
      case 'PENDING':
        return { text: 'Chờ duyệt', bgColor: 'bg-[#FFF694]' }
      case 'CANCELLED':
        return { text: 'Đã hủy', bgColor: 'bg-[#FFCCCC]' }
      case 'COMPLETED':
        return { text: 'Hoàn thành', bgColor: 'bg-[#D1FAE5]' }
      default:
        return { text: 'Trạng thái lạ', bgColor: 'bg-[#DAEAF7]' }
    }
  }

  return (
    <div className="font-inter">
      <div className="mb-16 flex max-w-full justify-between">
        <DetailBox title="Đã gửi" icon={<FileText size={28} />} number={consentTotal.totalConsents} />
        <DetailBox title="Đã phản hồi" icon={<CircleCheckBig size={28} />} number={consentTotal.respondedConsents} />
        <DetailBox title="Chưa phản hồi" icon={<CircleAlert size={28} />} number={consentTotal.pendingConsents} />
        <DetailBox title="Sự kiện sắp tới" icon={<Calendar size={28} />} number={upcomingEvents.length} />
      </div>
      <div className="flex justify-between px-[100px]">
        <div className="flex max-w-fit items-center gap-8">
          <p className="text-xl font-bold">Năm học</p>
          <DatePicker placeholder="Chọn năm học" onChange={onChange} picker="year" size="large" />
          <Input
            prefix={<Search size={16} className="mr-4 text-gray-400" />}
            placeholder="Tìm kiếm chiến dịch tiêm chủng"
            style={{ width: 250 }}
            className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-10">
          <button
            className="rounded-lg bg-[#023E73] px-7 py-1.5 text-base font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-[#01294d] hover:shadow-lg active:scale-95"
            onClick={() => navigateWithHistory('vaccine-list')}
          >
            Xem danh sách Vaccine
          </button>
          <DialogCreate onCreateSuccess={handleCreateSuccess} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
      </div>
      <div className="mt-8 flex flex-col justify-center space-y-4">
        {vaccineEvents && vaccineEvents.length > 0 ? (
          sortedEvents.map(event => {
            const { text: statusText, bgColor } = getStatusDisplay(event.status, event.event_date)

            const totalConsents = event.consentStats?.totalConsents || 0
            const respondedConsents = event.consentStats?.respondedConsents || 0

            return (
              <Link to={`vaccine-event/${event.id}`}>
                <div
                  key={event.id}
                  className="group mx-auto flex w-full max-w-[80rem] cursor-pointer justify-between border-t-1 border-b-1 border-gray-300 p-6 transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-center justify-center gap-10">
                    <Activity size={50} />
                    <div className="flex flex-col gap-2">
                      <p className="text-xl font-bold">{event.eventTitle || event.vaccine?.name || 'Không có tên'}</p>
                      <p>Đối tượng tiêm chủng: {event.eventScope === 'SCHOOL' ? 'Học sinh toàn trường' : 'Theo lớp'}</p>
                      <p className="text-sm text-gray-500 italic">Ngày tạo: {formatDate(event.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="flex min-w-[200px] flex-col items-center gap-2">
                      {statusText === 'Đã hủy' ? (
                        <>
                          <p className={`text-center ${bgColor} w-fit rounded-4xl px-9 py-1 font-bold`}>{statusText}</p>
                        </>
                      ) : (
                        <>
                          <p className={`text-center ${bgColor} w-fit rounded-4xl px-9 py-1 font-bold`}>{statusText}</p>
                          <p className="italic">
                            Phản hồi: {respondedConsents ?? 'NA'}/{totalConsents ?? 'NA'} học sinh
                          </p>
                        </>
                      )}
                    </div>
                    <button>
                      <ChevronRight
                        size={30}
                        className="text-[#023E73] transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110"
                      />
                    </button>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="mt-24 flex items-center justify-center bg-[#DAEAF7] py-10 text-center font-semibold">
            Không có sự kiện tiêm chủng nào
          </div>
        )}
      </div>
    </div>
  )
}

export default Vaccination
