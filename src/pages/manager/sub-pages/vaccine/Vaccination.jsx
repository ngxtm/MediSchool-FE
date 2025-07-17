import { DatePicker, Input } from 'antd'
import { FileText, CircleAlert, CircleCheckBig, Calendar, Activity, ChevronRight, X, Search } from 'lucide-react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../../../utils/api'
import { useEffect, useState } from 'react'
import { Dialog } from 'radix-ui'
import { Select } from 'antd'
import { Zoom, toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { parseDate, formatDate } from '../../../../utils/dateparse'
import Loading from '../../../../components/Loading'
import DetailBox from '../../../nurse/components/DetailBox'
import { errorToast } from '../../../../components/ToastPopup'

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
    let isMounted = true
    let hasShownError = false
    const fetchDataInPopup = async () => {
      try {
        const response = await api.get('/vaccines')
        if (isMounted) setVaccines(response.data)
      } catch (error) {
        console.error('Error fetching vaccines:', error)
        if (isMounted && !hasShownError) {
          toastErrorPopup('Error when fetching data: ' + error.message)
          hasShownError = true
        }
      }

      try {
        const response = await api.get('/classes')
        if (isMounted) setClasses(response.data)
      } catch (err) {
        console.error('Error when fetching classes: ', err)
        if (isMounted && !hasShownError) {
          toastErrorPopup('Error when fetching data: ' + err.message)
          hasShownError = true
        }
      }
    }

    fetchDataInPopup()

    return () => {
      isMounted = false
    }
  }, [])

  const createEventMutation = useMutation({
    mutationFn: newEvent => api.post('/vaccine-events', newEvent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-events'] })
      if (onCreateSuccess) onCreateSuccess()
    }
  })

  const handleSubmit = () => {
    createEventMutation.mutate(formData)
    toastSuccessPopup('Tạo sự kiện tiêm chủng thành công!')
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} className="font-inter">
      <Dialog.Trigger asChild>
        <button className="rounded-lg bg-teal-600 px-7 py-1.5 text-base font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-teal-700 hover:shadow-lg active:scale-95">
          Tạo chiến dịch tiêm chủng mới
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 max-h-[90vh] w-[90vw] max-w-[630px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white px-24 py-12 shadow-lg focus:outline-none">
          <Dialog.Title className="m-0 text-center text-2xl font-bold text-teal-600">
            Tạo chiến dịch tiêm chủng mới
          </Dialog.Title>
          <Dialog.Description className="mt-2.5 mb-5 text-center text-[15px] leading-normal text-gray-600">
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
                  { value: 'CLASS', label: 'Theo lớp' }
                ]}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </fieldset>

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
              <button className="inline-flex h-[35px] items-center justify-center rounded bg-gray-200 px-[15px] leading-none font-medium text-gray-800 outline-none hover:bg-gray-300">
                Hủy
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                className="inline-flex h-[35px] items-center justify-center rounded bg-gradient-to-r from-teal-600 to-teal-700 px-[15px] leading-none font-medium text-white transition-all duration-300 outline-none hover:scale-105 hover:shadow-teal-500/50 hover:brightness-110 active:scale-95 disabled:opacity-60"
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
  const navigate = useNavigate()
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

  if (isLoading) {
    return <Loading bgColor="#00bc92" />
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
        return {
          text: 'Đã duyệt',
          bgColor: 'bg-[#eefdf8]',
          textColor: 'text-[#065f46]',
          borderColor: 'border-teal-800'
        }
      case 'PENDING':
        return {
          text: 'Chờ duyệt',
          bgColor: 'bg-[#FFF694]',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-800'
        }
      case 'CANCELLED':
        return { text: 'Đã hủy', bgColor: 'bg-[#FFCCCC]', textColor: 'text-red-800', borderColor: 'border-red-300' }
      case 'COMPLETED':
        return {
          text: 'Hoàn thành',
          bgColor: 'bg-[#D1FAE5]',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        }
      default:
        return { text: 'Trạng thái lạ', bgColor: 'bg-[#DAEAF7]' }
    }
  }

  return (
    <>
      <style>
        {`
					input:focus {
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
					.ant-picker-focused {
						border-color: #10b981 !important;
						box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
					}
					.ant-picker:hover {
						border-color: #10b981 !important;
					}
					.ant-select-dropdown .ant-select-item-option-selected {
						background-color: #10b981 !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item-option-active {
						background-color: #10b981 !important;
						color: white !important;
					}
					.ant-select-selection-search-input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
					.ant-picker-input > input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
					.ant-select-selector input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
					.ant-picker-input input:focus {
						outline: none !important;
						border: none !important;
						box-shadow: none !important;
					}
				`}
      </style>
      <div className="font-inter">
        <div className="mb-16 flex max-w-full justify-between">
          <DetailBox
            title="Đã gửi"
            icon={<FileText size={28} />}
            number={consentTotal?.totalConsents ?? 'N/A'}
            bgColor="bg-gradient-to-r from-teal-500 to-teal-600"
          />
          <DetailBox
            title="Đã phản hồi"
            icon={<CircleCheckBig size={28} />}
            number={consentTotal?.respondedConsents ?? 'N/A'}
            bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
          />
          <DetailBox
            title="Chưa phản hồi"
            icon={<CircleAlert size={28} />}
            number={consentTotal?.pendingConsents ?? 'N/A'}
            bgColor="bg-gradient-to-r from-amber-500 to-orange-500"
          />
          <DetailBox
            title="Sự kiện sắp tới"
            icon={<Calendar size={28} />}
            number={upcomingEvents?.length ?? 'N/A'}
            bgColor="bg-gradient-to-r from-cyan-500 to-blue-500"
          />
        </div>
        <div className="flex justify-between">
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
              className="rounded-lg border-1 border-teal-300 bg-transparent px-7 py-1.5 text-base font-bold text-teal-600 transition-all duration-200 ease-in-out hover:scale-105 hover:bg-teal-50 hover:shadow-lg active:scale-95"
              onClick={() => navigate('vaccine-list')}
            >
              Xem danh sách Vaccine
            </button>
            <DialogCreate onCreateSuccess={handleCreateSuccess} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
          </div>
        </div>
        <div className="mt-8 flex flex-col justify-center space-y-4">
          {vaccineEvents && vaccineEvents.length > 0 ? (
            sortedEvents.map(event => {
              const {
                text: statusText,
                bgColor,
                textColor,
                borderColor
              } = getStatusDisplay(event.status, event.event_date)

              const totalConsents = event.consentStats?.totalConsents || 0
              const respondedConsents = event.consentStats?.respondedConsents || 0

              return (
                <Link to={`vaccine-event/${event.id}`}>
                  <div
                    key={event.id}
                    className="group mx-auto flex w-full max-w-[80rem] cursor-pointer justify-between rounded-xl border-t-1 border-b-1 border-gray-300 bg-white p-6 transition-colors hover:bg-gray-50 hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-10">
                      <Activity size={50} />
                      <div className="flex flex-col gap-2">
                        <p className="text-xl font-bold">{event.eventTitle || event.vaccine?.name || 'Không có tên'}</p>
                        <p>
                          Đối tượng tiêm chủng: {event.eventScope === 'SCHOOL' ? 'Học sinh toàn trường' : 'Theo lớp'}
                        </p>
                        <p className="text-sm text-gray-500 italic">Ngày tạo: {formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-10">
                      <div className="flex min-w-[200px] flex-col items-center gap-2">
                        {statusText === 'Đã hủy' ? (
                          <>
                            <p
                              className={`border-1 text-center ${borderColor} ${bgColor} ${textColor} w-fit rounded-4xl px-9 py-1 font-bold`}
                            >
                              {statusText}
                            </p>
                          </>
                        ) : (
                          <>
                            <p
                              className={`border-1 text-center ${borderColor} ${bgColor} ${textColor} w-fit rounded-4xl px-9 py-1 font-bold`}
                            >
                              {statusText}
                            </p>
                            <p className="italic">
                              Phản hồi: {respondedConsents ?? 'NA'}/{totalConsents ?? 'NA'} học sinh
                            </p>
                          </>
                        )}
                      </div>
                      <button>
                        <ChevronRight
                          size={30}
                          className="text-teal-600 transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110"
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
    </>
  )
}

export default Vaccination
