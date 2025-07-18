import { useParams } from 'react-router-dom'
import ReturnButton from '../../../../components/ReturnButton'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { ChevronRight, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input, Table, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import { successToast, errorToast } from '../../../../components/ToastPopup'
import { useEmailToast } from '../../../../hooks/useEmailToast'
import BulkActionBar from '../../../../components/BulkActionBar'

const TealSelectStyles = () => (
  <style>{`
		/* Custom Select Teal Style */
		.custom-select-teal .ant-select-selector {
			border-color: #0d9488 !important; /* teal-600 */
			border-radius: 8px !important;
			transition: all 0.2s ease-in-out !important;
		}

		.custom-select-teal .ant-select-selector:hover {
			border-color: #0f766e !important; /* teal-700 on hover */
		}

		.custom-select-teal.ant-select-focused .ant-select-selector {
			border-color: #0d9488 !important; /* teal-600 when focused */
			box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2) !important; /* teal glow */
		}

		/* Custom dropdown styles for teal select */
		.ant-select-dropdown .ant-select-item-option-selected {
			background-color: #0d9488 !important; /* teal-600 background */
			color: white !important;
		}

		.ant-select-dropdown .ant-select-item-option-selected:hover {
			background-color: #0f766e !important; /* darker teal on hover */
		}

		.ant-select-dropdown .ant-select-item-option:hover {
			background-color: #f0fdfa !important; /* teal-50 for normal hover */
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
	`}</style>
)

const StudentListInEvent = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả')
  const [disabledSendConsent, setDisabledSendConsent] = useState(false)

  const [selectedStudents, setSelectedStudents] = useState([])
  const [selectedRowKeys, setSelectedRowKeys] = useState([])

  const { sendEmailWithProgress, isSending } = useEmailToast()

  const successToastPopup = successToast
  const errorToastPopup = errorToast

  const sendConsentMutation = useMutation({
    mutationFn: () => api.post(`/vaccine-events/${id}/send-consents`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
    }
  })

  const sendReminderMutation = useMutation({
    mutationFn: () => {
      console.log('=== SEND REMINDER API CALL ===')
      console.log('Event ID:', id)
      console.log('API URL:', `/vaccine-events/${id}/send-email-notifications`)
      return api.post(`/vaccine-events/${id}/send-email-notifications`)
    },
    onSuccess: response => {
      console.log('=== SEND REMINDER SUCCESS ===')
      console.log('Response:', response)
      queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
    },
    onError: error => {
      console.error('=== SEND REMINDER ERROR ===')
      console.error('Error:', error)
      console.error('Error response:', error.response)
    }
  })

  const sendSelectiveEmailMutation = useMutation({
    mutationFn: consentIds => {
      console.log('=== SEND SELECTIVE EMAIL API CALL ===')
      console.log('Event ID:', id)
      console.log('Consent IDs:', consentIds)
      console.log('API URL:', `/vaccine-events/${id}/send-selective-emails`)
      console.log('Request body:', { consentIds })
      return api.post(`/vaccine-events/${id}/send-selective-emails`, { consentIds })
    },
    onSuccess: response => {
      console.log('=== SEND SELECTIVE EMAIL SUCCESS ===')
      console.log('Response:', response)
      queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
      setSelectedStudents([])
      setSelectedRowKeys([])
    },
    onError: error => {
      console.error('=== SEND SELECTIVE EMAIL ERROR ===')
      console.error('Error:', error)
      console.error('Error response:', error.response)
    }
  })

  const exportPDFMutation = useMutation({
    mutationFn: async eventId => {
      const response = await api.get(`/vaccination-history/event/${eventId}/pdf`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `vaccination-history-event-${eventId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
      window.URL.revokeObjectURL(url)
    }
  })

  const [
    { data: vaccineEvent, isLoading: isVaccineEventLoading, isError: isVaccineEventError },
    { data: studentsList, isLoading: isStudentsListLoading, isError: isStudentsListError }
  ] = useQueries({
    queries: [
      {
        queryKey: ['vaccine-event', id],
        queryFn: async () => {
          const response = await api.get(`/vaccine-events/${id}`)
          return response.data
        }
      },
      {
        queryKey: ['vaccine-consent', id, 'students'],
        retry: false,
        queryFn: async () => {
          const response = await api.get(`/vaccine-consents/${id}/students`)
          console.log('=== STUDENTS LIST API RESPONSE ===')
          console.log('Raw response:', response.data)
          if (response.data && response.data.length > 0) {
            console.log('First student sample:', response.data[0])
            console.log('Available fields:', Object.keys(response.data[0]))
          }
          return response.data
        }
      }
    ]
  })

  useEffect(() => {
    if (vaccineEvent?.status === 'APPROVED') {
      setDisabledSendConsent(true)
    } else {
      setDisabledSendConsent(false)
    }
  }, [vaccineEvent])

  const reverseStatusMap = {
    APPROVE: 'Chấp thuận',
    REJECT: 'Từ chối',
    null: 'Chưa phản hồi'
  }

  const safeStudentsList = studentsList || []
  const filteredStudentsList = safeStudentsList.filter(student => {
    const matchesSearch =
      student.studentName.toLowerCase().includes(search.toLowerCase()) ||
      student.parentName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'Tất cả' || reverseStatusMap[student.status] === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusDisplay = status => {
    switch (status) {
      case 'PENDING':
        return {
          text: 'Chờ phê duyệt',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        }
      case 'APPROVED':
        return {
          text: 'Đã phê duyệt',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        }
      case 'REJECTED':
        return {
          text: 'Từ chối',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        }
      case 'ACTIVE':
        return {
          text: 'Đang hoạt động',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300'
        }
      case 'COMPLETED':
        return {
          text: 'Hoàn thành',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        }
      case 'CANCELLED':
        return {
          text: 'Hủy bỏ',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        }
      default:
        return {
          text: 'Không xác định',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        }
    }
  }

  const getConsentStatusDisplay = status => {
    switch (status) {
      case 'APPROVE':
        return {
          text: 'Chấp thuận',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-300'
        }
      case 'REJECT':
        return {
          text: 'Từ chối',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        }
      case null:
        return {
          text: 'Chưa phản hồi',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        }
      default:
        return {
          text: 'Không xác định',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        }
    }
  }

  const { text: statusText, bgColor, textColor, borderColor } = getStatusDisplay(vaccineEvent?.status)

  const handleSendConsent = () => {
    sendConsentMutation.mutate()
    successToastPopup('Gửi đơn thành công!')
  }

  if (isVaccineEventLoading || isStudentsListLoading) {
    return <Loading />
  }

  if (isVaccineEventError || isStudentsListError) {
    return <div>Error fetching api & load data</div>
  }

  const handleSendReminder = async () => {
    const unrespondedConsents = safeStudentsList.filter(student => student.status == null)

    if (unrespondedConsents.length === 0) {
      errorToastPopup('Không có phụ huynh nào cần gửi email nhắc nhở. Tất cả đã phản hồi!')
      return
    }

    await sendEmailWithProgress(id, unrespondedConsents.length, () => sendReminderMutation.mutateAsync())
  }

  const handleExportPDF = () => {
    exportPDFMutation.mutate(id, {
      onSuccess: () => {
        successToastPopup('Xuất PDF thành công!', 'top-right', 2000)
      }
    })
  }

  const handleSendSelectedEmails = async () => {
    if (selectedStudents.length === 0) {
      errorToastPopup('Vui lòng chọn ít nhất một học sinh để gửi email!')
      return
    }

    console.log('=== SELECTED STUDENTS DEBUG ===')
    console.log('Selected students:', selectedStudents)
    console.log('Selected students length:', selectedStudents.length)

    if (selectedStudents.length > 0) {
      console.log('First selected student fields:', Object.keys(selectedStudents[0]))
      console.log('First selected student data:', selectedStudents[0])
    }

    const consentIds = selectedStudents
      .map(student => {
        console.log('Processing student:', student)
        console.log('Available fields:', Object.keys(student))

        const consentId = student.consentId
        console.log('Extracted consent ID:', consentId)

        return consentId
      })
      .filter(id => id != null)

    console.log('=== FINAL CONSENT IDS ===')
    console.log('Extracted consent IDs:', consentIds)
    console.log('Consent IDs length:', consentIds.length)

    if (consentIds.length === 0) {
      errorToastPopup('Không thể xác định ID consent. Vui lòng kiểm tra dữ liệu!')
      return
    }

    await sendEmailWithProgress(`${id}-selective`, selectedStudents.length, () =>
      sendSelectiveEmailMutation.mutateAsync(consentIds)
    )
  }

  const handleClearSelection = () => {
    setSelectedStudents([])
    setSelectedRowKeys([])
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log('Selection changed:', { selectedRowKeys, selectedRows })
      setSelectedRowKeys(selectedRowKeys)
      setSelectedStudents(selectedRows)
    },
    getCheckboxProps: record => ({
      disabled: record.status !== null,
      name: record.studentName
    }),
    type: 'checkbox'
  }

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      align: 'center',
      width: 180,
      render: text => <span className="font-semibold">{text}</span>
    },
    {
      title: 'Lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      align: 'center',
      width: 180,
      onHeaderCell: () => ({ style: { fontWeight: 'bold' } })
    },
    {
      title: 'Bố-Mẹ / Người giám hộ',
      dataIndex: 'parentName',
      key: 'parent',
      width: 180,
      align: 'center',
      render: text => <span className="font-semibold">{text}</span>
    },
    {
      title: 'Thông tin liên lạc',
      dataIndex: 'contact',
      key: 'contact',
      align: 'center',
      width: 180,
      render: (_, record) => (
        <div className="flex flex-col items-center leading-5">
          <span>{record.email}</span>
          <span>{record.phoneNumber}</span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 180,
      render: (_, record) => {
        const result = getConsentStatusDisplay(record.status)
        return (
          <p
            className={`mx-auto flex items-center justify-center ${result.bgColor} ${result.textColor} ${result.borderColor} w-fit rounded-4xl px-9 py-1 font-bold`}
          >
            {result.text}
          </p>
        )
      }
    },
    {
      title: '',
      key: 'action',
      align: 'center',
      width: 50,
      render: (_, record) => {
        return (
          <button
            onClick={() => navigate(`/manager/vaccination/vaccine-event/consent/${record.consentId}`)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-teal-600 transition-colors duration-200 hover:bg-teal-400 hover:text-white"
          >
            <ChevronRight size={20} />
          </button>
        )
      }
    }
  ]

  return (
    <div className="font-inter">
      <style>
        {`
					.custom-pagination .ant-pagination-item {
						border-color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-item a {
						color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-item-active {
						background-color: #0d9488 !important;
						border-color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-item-active a {
						color: white !important;
					}
					.custom-pagination .ant-pagination-prev,
					.custom-pagination .ant-pagination-next {
						border-color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-prev a,
					.custom-pagination .ant-pagination-next a {
						color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-jump-prev,
					.custom-pagination .ant-pagination-jump-next {
						color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-options-size-changer.ant-select .ant-select-selector {
						border-color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-options-changer.ant-select .ant-select-arrow {
						color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-options-changer.ant-select-focused .ant-select-selector {
						border-color: #0d9488 !important;
						box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2) !important;
					}
					.custom-pagination .ant-pagination-options-quick-jumper input {
						border-color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-options-quick-jumper input:focus {
						border-color: #0d9488 !important;
						box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.2) !important;
					}
					.ant-select-dropdown .ant-select-item-option-selected {
						background-color: #0d9488 !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item-option-active {
						background-color: #0d9488 !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item:hover {
						background-color: #0d9488 !important;
						color: white !important;
					}
					.custom-pagination .ant-table-tbody > tr:hover > td {
						background-color: #f0fdfa !important;
					}

					/* Row Selection Styling */
					.ant-table-tbody > tr.ant-table-row-selected > td {
						background-color: #ccfbf1 !important; /* teal-100 */
					}
					.ant-table-tbody > tr.ant-table-row-selected:hover > td {
						background-color: #99f6e4 !important; /* teal-200 */
					}

					/* Checkbox Styling */
					.ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #0d9488 !important; /* teal-600 */
						border-color: #0d9488 !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-checked::after {
						border-color: #0d9488 !important;
					}
					.ant-checkbox-wrapper:hover .ant-checkbox-inner,
					.ant-checkbox:hover .ant-checkbox-inner {
						border-color: #0d9488 !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner {
						background-color: #0d9488 !important;
						border-color: #0d9488 !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner::after {
						background-color: white !important;
					}

					/* Table header checkbox */
					.ant-table-thead .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #0d9488 !important;
						border-color: #0d9488 !important;
					}
				`}
      </style>
      <TealSelectStyles />
      <ReturnButton linkNavigate={`/manager/vaccination/vaccine-event/${id}`} actor="manager" />
      <div>
        <div className="mt-10 flex flex-col gap-4">
          <h1 className="text-2xl font-bold">Chiến dịch: {vaccineEvent?.eventTitle || 'N/A'}</h1>
          <p
            className={`text-center ${bgColor} ${textColor} ${borderColor} w-fit rounded-lg border-1 px-6 py-1 font-bold`}
          >
            {statusText}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 px-10">
        <Input
          prefix={<Search size={16} className="mr-4 text-gray-400" />}
          placeholder="Tìm kiếm học sinh hoặc phụ huynh"
          style={{ width: 350 }}
          className="h-[38px] rounded-[8px] !border-[#0d9488]"
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div>
          <div className="flex items-center gap-4">
            <p className="font-medium">Trạng thái</p>
            <Select
              value={statusFilter}
              onChange={value => setStatusFilter(value)}
              size="middle"
              style={{
                width: 180
              }}
              className="custom-select-teal"
              options={[
                { value: 'Tất cả', label: 'Tất cả' },
                { value: 'Chấp thuận', label: 'Chấp thuận' },
                { value: 'Từ chối', label: 'Từ chối' },
                { value: 'Chưa phản hồi', label: 'Chưa phản hồi' }
              ]}
            />
          </div>
        </div>
        <div className="my-6 flex gap-4">
          <button
            className={`rounded-md border border-transparent px-6 py-2 font-semibold transition-all duration-200 ${
              !disabledSendConsent
                ? 'pointer-events-none cursor-not-allowed bg-gray-400 text-gray-600 opacity-60'
                : 'cursor-pointer bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm hover:border-teal-600 hover:bg-white hover:bg-none hover:text-teal-600 hover:shadow-lg'
            }`}
            onClick={handleSendConsent}
            disabled={!disabledSendConsent}
          >
            Gửi đơn
          </button>
          <button
            onClick={handleSendReminder}
            disabled={sendReminderMutation.isPending || isSending(id)}
            className={`flex items-center gap-2 rounded-md border border-transparent px-6 py-2 font-semibold transition-all duration-200 ${
              sendReminderMutation.isPending || isSending(id)
                ? 'cursor-not-allowed bg-gray-400 text-gray-200'
                : 'cursor-pointer bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-sm hover:border-teal-600 hover:bg-white hover:bg-none hover:text-teal-600 hover:shadow-lg'
            }`}
            title={(() => {
              const unrespondedCount = safeStudentsList.filter(student => student.status == null).length
              return unrespondedCount > 0
                ? `Gửi email nhắc nhở tới ${unrespondedCount} phụ huynh chưa phản hồi`
                : 'Tất cả phụ huynh đã phản hồi'
            })()}
          >
            {(sendReminderMutation.isPending || isSending(id)) && (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {(() => {
              if (sendReminderMutation.isPending || isSending(id)) {
                return 'Đang gửi...'
              }
              const unrespondedCount = safeStudentsList.filter(student => student.status == null).length
              return unrespondedCount > 0 ? `Gửi lời nhắc (${unrespondedCount})` : 'Gửi lời nhắc'
            })()}
          </button>
          <button
            onClick={handleExportPDF}
            className="rounded-md border border-transparent bg-gradient-to-r from-teal-500 to-teal-600 px-6 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:border-teal-600 hover:bg-white hover:bg-none hover:text-teal-600 hover:shadow-lg"
          >
            Xuất PDF
          </button>
        </div>
      </div>

      {selectedStudents.length > 0 && (
        <BulkActionBar
          selectedCount={selectedStudents.length}
          onSendEmail={handleSendSelectedEmails}
          onCancel={handleClearSelection}
          isSending={isSending(`${id}-selective`)}
          theme="teal"
        />
      )}

      <Table
        className="custom-pagination"
        columns={columns}
        dataSource={filteredStudentsList}
        loading={isStudentsListLoading}
        rowKey="consentId"
        rowSelection={rowSelection}
        components={{
          header: {
            cell: props => <th {...props} style={{ ...props.style, backgroundColor: '#a7f3d0' }} />
          }
        }}
      />
    </div>
  )
}

export default StudentListInEvent
