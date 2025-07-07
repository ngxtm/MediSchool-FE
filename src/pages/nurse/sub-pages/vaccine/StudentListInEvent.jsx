import { useParams } from 'react-router-dom'
import ReturnButton from '../../../../components/ReturnButton'
import { useMutation, useQueries, useQueryClient } from '@tanstack/react-query'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { ChevronRight, Search } from 'lucide-react'
import { useState, useMemo } from 'react'
import { Input, Table, Select } from 'antd'
import { successToast, errorToast } from '../../../../components/ToastPopup'
import { useEmailToast } from '../../../../hooks/useEmailToast'
import BulkActionBar from '../../../../components/BulkActionBar'
import useActorNavigation from '../../../../hooks/useActorNavigation'

const StudentListInEvent = ({ actor }) => {
	const { navigateWithHistory } = useActorNavigation(actor)
	const queryClient = useQueryClient()
	const { id } = useParams()
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState('Tất cả')
	const [selectedStudents, setSelectedStudents] = useState([])
	const [selectedRowKeys, setSelectedRowKeys] = useState([])

	const { sendEmailWithProgress, isSending } = useEmailToast('blue')

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
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
		}
	})

	const sendSelectiveEmailMutation = useMutation({
		mutationFn: (consentIds) => api.post(`/vaccine-events/${id}/send-selective-emails`, { consentIds }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vaccine-consent', id, 'students'] })
			setSelectedStudents([])
			setSelectedRowKeys([])
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

	const safeStudentsList = useMemo(() => studentsList || [], [studentsList])
	
	const isEventApproved = useMemo(() => vaccineEvent?.status === 'APPROVED', [vaccineEvent?.status])
	
	const unrespondedConsents = useMemo(() => 
		safeStudentsList.filter(student => student.status == null), 
		[safeStudentsList]
	)

	const filteredStudentsList = useMemo(() => {
		const reverseStatusMap = {
			APPROVE: 'Chấp thuận',
			REJECT: 'Từ chối',
			null: 'Chưa phản hồi'
		}
		
		return safeStudentsList.filter(student => {
			const matchesSearch =
				student.studentName.toLowerCase().includes(search.toLowerCase()) ||
				student.parentName.toLowerCase().includes(search.toLowerCase())
			const matchesStatus = statusFilter === 'Tất cả' || reverseStatusMap[student.status] === statusFilter
			return matchesSearch && matchesStatus
		})
	}, [safeStudentsList, search, statusFilter])

	const getStatusDisplay = (status) => {
		if (!status) return { text: 'Chưa phản hồi', bgColor: 'bg-[#FFF694]' }

		switch (status.toUpperCase()) {
			case 'APPROVE':
				return { text: 'Chấp thuận', bgColor: 'bg-[#DAEAF7]' }
			case 'REJECT':
				return { text: 'Từ chối', bgColor: 'bg-[#FFAEAF]' }
			default:
				return { text: 'Trạng thái lạ', bgColor: 'bg-[#FFF694]' }
		}
	}

	const getStatusDisplayEvent = (status, date) => {
		if (!status) return { text: 'Lỗi trạng thái', bgColor: 'bg-[#DAEAF7]' }

		switch (status.toUpperCase()) {
			case 'APPROVED':
				if (date === new Date().toLocaleDateString()) {
					return { text: 'Đang diễn ra', bgColor: 'bg-[#DAEAF7]' }
				}
				return { text: 'Đã duyệt', bgColor: 'bg-[#DAEAF7]' }
			case 'PENDING':
				return { text: 'Chờ duyệt', bgColor: 'bg-[#DAEAF7]' }
			case 'CANCELLED':
				return { text: 'Đã hủy', bgColor: 'bg-[#FFCCCC]' }
			case 'COMPLETED':
				return { text: 'Hoàn thành', bgColor: 'bg-[#D1FAE5]' }
			default:
				return { text: 'Trạng thái lạ', bgColor: 'bg-[#DAEAF7]' }
		}
	}

	const { text: statusText, bgColor } = getStatusDisplayEvent(vaccineEvent?.status, vaccineEvent?.event_date)

	const handleSendConsent = () => {
		sendConsentMutation.mutate()
		successToastPopup('Gửi đơn thành công!')
	}

	const handleSendReminder = async () => {
		if (unrespondedConsents.length === 0) {
			errorToastPopup('Không có phụ huynh nào cần gửi email nhắc nhở. Tất cả đã phản hồi!')
			return
		}
		
		await sendEmailWithProgress(
			id,
			unrespondedConsents.length,
			() => sendReminderMutation.mutateAsync()
		)
	}

	const handleSendSelectedEmails = async () => {
		if (selectedStudents.length === 0) {
			errorToastPopup('Vui lòng chọn ít nhất một học sinh để gửi email!')
			return
		}
		
		const consentIds = selectedStudents
			.map(student => student.consentId)
			.filter(id => id != null)

		if (consentIds.length === 0) {
			errorToastPopup('Không thể xác định ID consent. Vui lòng kiểm tra dữ liệu!')
			return
		}
		
		await sendEmailWithProgress(
			`${id}-selective`,
			selectedStudents.length,
			() => sendSelectiveEmailMutation.mutateAsync(consentIds)
		)
	}

	const handleClearSelection = () => {
		setSelectedStudents([])
		setSelectedRowKeys([])
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedRowKeys(selectedRowKeys)
			setSelectedStudents(selectedRows)
		},
		getCheckboxProps: (record) => ({
			disabled: record.status !== null,
			name: record.studentName,
		}),
		type: 'checkbox',
	}

	const handleExportPDF = () => {
		exportPDFMutation.mutate(id, {
			onSuccess: () => {
				successToastPopup('Xuất PDF thành công!')
			}
		})
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
				const result = getStatusDisplay(record.status)
				return (
					<p
						className={`flex justify-center items-center mx-auto ${result.bgColor} font-bold px-9 py-1 w-fit rounded-4xl`}
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
							navigateWithHistory(
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

	if (isVaccineEventLoading || isStudentsListLoading) {
		return <Loading />
	}

	if (isVaccineEventError || isStudentsListError) {
		return <div>Error fetching api & load data</div>
	}

	return (
		<div className="font-inter">
			<style>
				{`
					/* Row Selection Styling */
					.ant-table-tbody > tr.ant-table-row-selected > td {
						background-color: #dbeafe !important; /* blue-100 */
					}
					.ant-table-tbody > tr.ant-table-row-selected:hover > td {
						background-color: #bfdbfe !important; /* blue-200 */
					}

					/* Checkbox Styling */
					.ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #2563eb !important; /* blue-600 */
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-checked::after {
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper:hover .ant-checkbox-inner,
					.ant-checkbox:hover .ant-checkbox-inner {
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner::after {
						background-color: white !important;
					}

					/* Table header checkbox */
					.ant-table-thead .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}

					/* Table hover effect */
					.ant-table-tbody > tr:hover > td {
						background-color: #eff6ff !important; /* blue-50 */
					}
				`}
			</style>
			<ReturnButton
				linkNavigate={`${actor === 'manager' ? '/manager' : '/nurse'}/vaccination/vaccine-event/${id}`}
			/>
			<div>
				<div className="flex flex-col mt-10 gap-4">
					<h1 className="font-bold text-2xl">Chiến dịch: {vaccineEvent?.eventTitle || 'N/A'}</h1>
					<p className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}>{statusText}</p>
				</div>
			</div>
			<div className="flex items-center gap-4 px-10 justify-between">
				<Input
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
					placeholder="Tìm kiếm học sinh hoặc phụ huynh"
					style={{ width: 350 }}
					className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
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
							style={{ width: 180 }}
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
						className={`font-semibold px-6 py-2 rounded-md transition-all duration-200 ${
							!isEventApproved
								? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60 pointer-events-none'
								: 'bg-[#023E73] text-white hover:bg-[#01294d] hover:shadow-lg active:scale-95 cursor-pointer shadow-sm'
						}`}
						onClick={handleSendConsent}
						disabled={!isEventApproved}
					>
						Gửi đơn
					</button>
					<button
						onClick={handleSendReminder}
						disabled={sendReminderMutation.isPending || isSending(id)}
						className={`font-semibold px-6 py-2 rounded-md transition-all flex items-center gap-2 ${
							sendReminderMutation.isPending || isSending(id)
								? 'bg-gray-400 text-gray-200 cursor-not-allowed'
								: 'bg-[#023E73] text-white hover:bg-[#01294d] active:scale-95'
						}`}
						title={unrespondedConsents.length > 0 
							? `Gửi email nhắc nhở tới ${unrespondedConsents.length} phụ huynh chưa phản hồi`
							: 'Tất cả phụ huynh đã phản hồi'}
					>
						{(sendReminderMutation.isPending || isSending(id)) && (
							<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
						)}
						{(() => {
							if (sendReminderMutation.isPending || isSending(id)) {
								return 'Đang gửi...'
							}
							return unrespondedConsents.length > 0 ? `Gửi lời nhắc (${unrespondedConsents.length})` : 'Gửi lời nhắc'
						})()}
					</button>
					<button
						onClick={handleExportPDF}
						className="bg-[#023E73] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#01294d] active:scale-95 transition-all"
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
					theme="blue"
				/>
			)}

			<Table
				columns={columns}
				dataSource={filteredStudentsList}
				loading={isStudentsListLoading}
				rowKey="consentId"
				rowSelection={rowSelection}
			/>
		</div>
	)
}

export default StudentListInEvent
