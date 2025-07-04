import { useParams } from 'react-router-dom'
import ReturnButton from '../../../../components/ReturnButton'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { ChevronRight, Search, Mail, CheckCircle, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Input, Table, Select, Progress, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { successToast, errorToast } from '../../../../components/ToastPopup'

// Custom styles for teal select
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
	`}</style>
)

// Loading Modal Component for Email Sending Progress
const EmailSendingModal = ({ isVisible, onClose, progress, status, message }) => {
	const getStatusIcon = () => {
		switch (status) {
			case 'sending':
				return <Mail className="w-8 h-8 text-blue-500 animate-pulse" />
			case 'success':
				return <CheckCircle className="w-8 h-8 text-green-500" />
			case 'error':
				return <XCircle className="w-8 h-8 text-red-500" />
			default:
				return <Mail className="w-8 h-8 text-gray-500" />
		}
	}

	const getStatusText = () => {
		switch (status) {
			case 'sending':
				return 'Đang gửi email nhắc nhở...'
			case 'success':
				return 'Gửi email thành công!'
			case 'error':
				return 'Có lỗi xảy ra khi gửi email'
			default:
				return 'Chuẩn bị gửi email...'
		}
	}

	const getProgressColor = () => {
		switch (status) {
			case 'sending':
				return '#1890ff'
			case 'success':
				return '#52c41a'
			case 'error':
				return '#ff4d4f'
			default:
				return '#d9d9d9'
		}
	}

	return (
		<Modal
			open={isVisible}
			onCancel={onClose}
			footer={null}
			closable={status !== 'sending'}
			maskClosable={status !== 'sending'}
			width={500}
			centered
		>
			<div className="text-center py-6">
				<div className="flex justify-center mb-4">{getStatusIcon()}</div>

				<h3 className="text-xl font-semibold mb-4">{getStatusText()}</h3>

				<div className="mb-4">
					<Progress
						percent={progress}
						strokeColor={getProgressColor()}
						size="default"
						showInfo={false}
						status={status === 'error' ? 'exception' : status === 'success' ? 'success' : 'active'}
					/>
				</div>

				{message && <p className="text-gray-600 mb-4">{message}</p>}

				{status === 'success' && (
					<button
						onClick={onClose}
						className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
					>
						Đóng
					</button>
				)}

				{status === 'error' && (
					<div className="space-x-3">
						<button
							onClick={onClose}
							className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition-colors"
						>
							Đóng
						</button>
					</div>
				)}
			</div>
		</Modal>
	)
}

const StudentListInEvent = ({ actor }) => {
	const navigate = useNavigate()
	const queryClient = useQueryClient()
	const { id } = useParams()
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState('Tất cả')
	const [disabledSendConsent, setDisabledSendConsent] = useState(false)

	// Email sending progress states
	const [emailProgress, setEmailProgress] = useState(0)
	const [emailStatus, setEmailStatus] = useState('idle') // idle, sending, success, error
	const [emailMessage, setEmailMessage] = useState('')
	const [showEmailModal, setShowEmailModal] = useState(false)

	const successToastPopup = successToast
	const errorToastPopup = errorToast

	const sendConsentMutation = useMutation({
		mutationFn: () => api.post(`/vaccine-events/${id}/send-consents`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
		}
	})

	const sendReminderMutation = useMutation({
		mutationFn: () => api.post(`/vaccine-events/${id}/send-email-notifications`),
		onMutate: () => {
			// Calculate number of unresponded consents (those who need email reminders)
			const unrespondedConsents = safeStudentsList.filter(student => student.status == null)
			const totalEmailsToSend = unrespondedConsents.length

			// Safety check (though handleSendReminder should prevent this)
			if (totalEmailsToSend === 0) {
				throw new Error('Không có email nào cần gửi')
			}

			// Estimate time: 2.5 seconds per email on average
			const estimatedTimePerEmail = 2500 // milliseconds
			const totalEstimatedTime = Math.max(totalEmailsToSend * estimatedTimePerEmail, 3000) // minimum 3 seconds

			// Start the loading process
			setEmailProgress(0)
			setEmailStatus('sending')
			setEmailMessage(`Bắt đầu gửi email nhắc nhở tới ${totalEmailsToSend} phụ huynh...`)
			setShowEmailModal(true)

			// Create smooth linear progress animation
			const progressInterval = setInterval(() => {
				setEmailProgress(prev => {
					// Calculate smooth increment based on total time
					const incrementPerTick = (95 / totalEstimatedTime) * 100 // 100ms per tick, stop at 95%
					const newProgress = prev + incrementPerTick

					// Stop at 95% and wait for actual API response
					if (newProgress >= 95) {
						setEmailMessage('Đang hoàn tất quá trình gửi email...')
						clearInterval(progressInterval)
						return 95
					}

					// Update message based on progress
					if (newProgress > 10 && newProgress <= 30) {
						setEmailMessage(`Đang gửi email... (${Math.floor(newProgress)}%)`)
					} else if (newProgress > 30 && newProgress <= 60) {
						const estimatedSent = Math.floor((newProgress / 95) * totalEmailsToSend)
						setEmailMessage(`Đã gửi khoảng ${estimatedSent}/${totalEmailsToSend} email...`)
					} else if (newProgress > 60 && newProgress <= 85) {
						setEmailMessage(`Đang gửi email... (${Math.floor(newProgress)}%)`)
					} else if (newProgress > 85) {
						setEmailMessage('Sắp hoàn thành...')
					}

					return newProgress
				})
			}, 100) // Update every 100ms for smooth animation

			return { progressInterval, totalEmailsToSend }
		},
		onSuccess: (data, variables, context) => {
			// Clear the progress interval
			if (context?.progressInterval) {
				clearInterval(context.progressInterval)
			}

			// Complete the progress smoothly
			const finalProgressInterval = setInterval(() => {
				setEmailProgress(prev => {
					if (prev >= 100) {
						clearInterval(finalProgressInterval)
						return 100
					}
					return prev + 1 // Smooth completion
				})
			}, 30)

			// Set success state
			setEmailStatus('success')
			const emailsSent = data?.data?.message
			const emailsFailed = data?.data?.message

			let successMessage = `${emailsSent}`
			if (emailsFailed > 0) {
				successMessage += ` (${emailsFailed} email gửi thất bại)`
			}
			setEmailMessage(successMessage)

			// Invalidate queries
			queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })

			// Auto close modal after 3 seconds
			setTimeout(() => {
				setShowEmailModal(false)
				successToastPopup(`${emailsSent}`)
			}, 3000)
		},
		onError: (error, variables, context) => {
			// Clear the progress interval
			if (context?.progressInterval) {
				clearInterval(context.progressInterval)
			}

			// Set error state
			setEmailProgress(0)
			setEmailStatus('error')
			setEmailMessage(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email nhắc nhở')

			// Show error toast
			errorToastPopup(error.response?.data?.message || 'Có lỗi xảy ra khi gửi email nhắc nhở')
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

	const statusMap = {
		'Chấp thuận': 'APPROVE',
		'Từ chối': 'REJECT',
		'Chưa phản hồi': null
	}

	const safeStudentsList = Array.isArray(studentsList) ? studentsList : []

	const filteredStudentList = safeStudentsList.filter(s => {
		const matchesSearch =
			(s.studentName ?? '').toLowerCase().includes(search.toLowerCase()) ||
			(s.parentName ?? '').toLowerCase().includes(search.toLowerCase())

		const matchesStatus =
			statusFilter === 'Tất cả'
				? true
				: statusFilter === 'Chưa phản hồi'
				? s.status == null
				: s.status?.toUpperCase() === statusMap[statusFilter]

		return matchesSearch && matchesStatus
	})

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		showSizeChanger: true,
		showQuickJumper: true
	})

	const getStatusDisplay = (status, date) => {
		if (!status)
			return {
				text: 'Lỗi trạng thái',
				bgColor: 'bg-[#FFCCCC]',
				textColor: 'text-red-800',
				borderColor: 'border-red-300'
			}

		switch (status) {
			case 'APPROVED':
				if (date === new Date().toLocaleDateString()) {
					return {
						text: 'Đang diễn ra',
						bgColor: 'bg-[#eefdf8]',
						textColor: 'text-[#065f46]',
						borderColor: 'border-teal-800'
					}
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
				return {
					text: 'Đã hủy',
					bgColor: 'bg-[#FFCCCC]',
					textColor: 'text-red-800',
					borderColor: 'border-red-300'
				}
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

	const getConsentStatusDisplay = (status) => {
		if (status === null || status === undefined) {
			return {
				text: 'Chưa phản hồi',
				bgColor: 'bg-[#FFF694]',
				textColor: 'text-yellow-800',
				borderColor: 'border-yellow-300'
			}
		}

		switch (status) {
			case 'APPROVE':
				return {
					text: 'Chấp thuận',
					bgColor: 'bg-[#D1FAE5]',
					textColor: 'text-green-800',
					borderColor: 'border-green-300'
				}
			case 'REJECT':
				return {
					text: 'Từ chối',
					bgColor: 'bg-[#FFCCCC]',
					textColor: 'text-red-800',
					borderColor: 'border-red-300'
				}
			default:
				return {
					text: 'Trạng thái không xác định',
					bgColor: 'bg-[#DAEAF7]',
					textColor: 'text-gray-800',
					borderColor: 'border-gray-300'
				}
		}
	}

	const {
		text: statusText,
		bgColor,
		textColor,
		borderColor
	} = getStatusDisplay(vaccineEvent?.status, vaccineEvent?.event_date)

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

	const handleSendReminder = () => {
		const unrespondedConsents = safeStudentsList.filter(student => student.status == null)

		if (unrespondedConsents.length === 0) {
			errorToastPopup('Không có phụ huynh nào cần gửi email nhắc nhở. Tất cả đã phản hồi!')
			return
		}

		sendReminderMutation.mutate()
	}

	const handleExportPDF = () => {
		exportPDFMutation.mutate(id, {
			onSuccess: () => {
				successToastPopup('Xuất PDF thành công!')
			}
		})
	}

	const closeEmailModal = () => {
		setShowEmailModal(false)
		setEmailStatus('idle')
		setEmailProgress(0)
		setEmailMessage('')
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
						className={`flex justify-center items-center mx-auto ${result.bgColor} ${result.textColor} ${result.borderColor} font-bold px-9 py-1 w-fit rounded-4xl`}
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
						onClick={() =>
							navigate(
								`${actor === 'manager' ? '/manager' : '/nurse'}/vaccination/vaccine-event/consent/${
									record.consentId
								}`
							)
						}
						className="flex items-center justify-center w-8 h-8 rounded-full text-[#023E73] hover:text-white hover:bg-[#023E73] transition-colors duration-200"
					>
						<ChevronRight size={20} />
					</button>
				)
			}
		}
	]

	return (
		<div className="font-inter">
			<TealSelectStyles />
			<ReturnButton linkNavigate={`/manager/vaccination/vaccine-event/${id}`} actor="manager" />
			<div>
				<div className="flex flex-col mt-10 gap-4">
					<h1 className="font-bold text-2xl">Chiến dịch: {vaccineEvent?.eventTitle || 'N/A'}</h1>
					<p
						className={`text-center ${bgColor} ${textColor} ${borderColor} border-1 font-bold px-6 py-1 w-fit rounded-lg`}
					>
						{statusText}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-4 px-10 justify-between">
				<Input
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
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
								width: 180,
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
				<div className="flex gap-4 my-6">
					<button
						className={`font-semibold px-6 py-2 rounded-md transition-all duration-200 border border-transparent ${
							!disabledSendConsent
								? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60 pointer-events-none'
								: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:bg-none hover:bg-white hover:border-teal-600 hover:text-teal-600 text-white hover:shadow-lg cursor-pointer shadow-sm'
						}`}
						onClick={handleSendConsent}
						disabled={!disabledSendConsent}
					>
						Gửi đơn
					</button>
					<button
						onClick={handleSendReminder}
						disabled={sendReminderMutation.isPending || emailStatus === 'sending'}
						className={`font-semibold px-6 py-2 rounded-md transition-all duration-200 border border-transparent flex items-center gap-2 ${
							sendReminderMutation.isPending || emailStatus === 'sending'
								? 'bg-gray-400 text-gray-200 cursor-not-allowed'
								: 'bg-gradient-to-r from-teal-500 to-teal-600 hover:bg-none hover:bg-white hover:border-teal-600 hover:text-teal-600 text-white hover:shadow-lg cursor-pointer shadow-sm'
						}`}
						title={(() => {
							const unrespondedCount = safeStudentsList.filter(student => student.status == null).length
							return unrespondedCount > 0
								? `Gửi email nhắc nhở tới ${unrespondedCount} phụ huynh chưa phản hồi`
								: 'Tất cả phụ huynh đã phản hồi'
						})()}
					>
						{(sendReminderMutation.isPending || emailStatus === 'sending') && (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						)}
						{(() => {
							if (sendReminderMutation.isPending || emailStatus === 'sending') {
								return 'Đang gửi...'
							}
							const unrespondedCount = safeStudentsList.filter(student => student.status == null).length
							return unrespondedCount > 0 ? `Gửi lời nhắc (${unrespondedCount})` : 'Gửi lời nhắc'
						})()}
					</button>
					<button
						onClick={handleExportPDF}
						className="bg-gradient-to-r from-teal-500 to-teal-600 hover:bg-none hover:bg-white hover:border-teal-600 hover:text-teal-600 text-white font-semibold px-6 py-2 rounded-md transition-all duration-200 border border-transparent hover:shadow-lg shadow-sm"
					>
						Xuất PDF
					</button>
				</div>
			</div>

			<Table
				columns={columns}
				dataSource={filteredStudentList}
				loading={isStudentsListLoading}
				onChange={pagination => setPagination(pagination)}
				pagination={pagination}
				rowKey="vaccineId"
			/>

			{/* Email Sending Progress Modal */}
			<EmailSendingModal
				isVisible={showEmailModal}
				onClose={closeEmailModal}
				progress={emailProgress}
				status={emailStatus}
				message={emailMessage}
			/>
		</div>
	)
}

export default StudentListInEvent
