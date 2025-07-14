import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, CircleCheckBig, CircleAlert, Calendar, Stethoscope, User, Package } from 'lucide-react'
import api from '../../../utils/api'
import Loading from '../../../components/Loading'
import DetailBox from '../../nurse/components/DetailBox'
import { useState, useEffect } from 'react'
import { Table } from 'antd'
import { errorToast, successToast } from '../../../components/ToastPopup'
import RejectReasonModal from '../../../components/RejectReasonModal'
import dayjs from "dayjs";
import {formatDate} from "../../../utils/dateparse.jsx";

export const formatCreateDate = (date) => {
	if (!date) return ''
	return typeof date === 'number'
		? dayjs.unix(Math.floor(date)).format('DD/MM/YYYY')
		: dayjs(date).format('DD/MM/YYYY')
}

const Home = () => {
	const queryClient = useQueryClient()
	const approveEvent = useMutation({
		mutationFn: async ({ type, id }) => {
			if (type === 'vaccine') {
				return api.put(`/vaccine-events/${id}/status`, null, {
					params: { status: 'APPROVED' }
				})
			}
			if (type === 'checkup') {
				return api.put(`/health-checkup/${id}/status`, null, {
					params: { status: 'APPROVED' }
				})
			}
			if (type === 'medication') {
				return api.put(`/medication-requests/${id}/approve`)
			}
			throw new Error('Invalid type')
		},
		onSuccess: () => {
			queryClient.invalidateQueries()
			successToast('Duyệt thành công')
		},
		onError: () => {
			errorToast('Duyệt thất bại. Vui lòng thử lại')
		}
	})

	const rejectRequest = useMutation({
		mutationFn: async ({ type, id, reason }) => {
			if (type === 'vaccine') {
				return api.put(`/vaccine-events/${id}/status`, null, {
					params: { status: 'REJECTED', rejectionReason: reason }
				})
			}
			if (type === 'checkup') {
				return api.put(`/health-checkup/${id}/status`, null, {
					params: {status: 'REJECTED', rejectionReason: reason}
				})
			}
			if (type === 'medication') {
				return api.put(`/medication-requests/${id}/reject`, null, {
					params: { rejectReason: reason }
				})
			}
			throw new Error('Invalid type')
		},
		onSuccess: () => {
			queryClient.invalidateQueries()
			successToast('Từ chối thành công')
			setRejectModalOpen(false)
			setSelectedRequest(null)
		},
		onError: () => {
			errorToast('Từ chối thất bại. Vui lòng thử lại')
		}
	})

	const [rejectModalOpen, setRejectModalOpen] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState(null)

	const handleRejectClick = (type, item) => {
		const id = item.id ?? item.requestId;
		setSelectedRequest({ ...item, type, id });
		setRejectModalOpen(true);
	}

	const handleRejectConfirm = reason => {
		if (selectedRequest) {
			rejectRequest.mutate({ type: selectedRequest.type, id: selectedRequest.id, reason })
		}
	}

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 5,
		showSizeChanger: true,
		showQuickJumper: true
	})

	const results = useQueries({
		queries: [
			{
				queryKey: ['consent-total'],
				queryFn: () => api.get('/vaccine-consents').then(res => res.data)
			},
			{
				queryKey: ['upcoming-vaccine-events'],
				queryFn: () => api.get('/vaccine-events/upcoming').then(res => res.data)
			},
			{
				queryKey: ['vaccine-event'],
				queryFn: () => api.get('/vaccine-events').then(res => res.data)
			},
			{
				queryKey: ['reviewed-health-checkups'],
				queryFn: () => api.get('/health-checkup/pending').then(res => res.data)
			},
			{
				queryKey: ['reviewed-medication'],
				queryFn: () => api.get('/medication-requests/reviewed').then(res => res.data)
			}
		]
	})

	const reviewedHealthCheckups = results[3]?.data ?? []
	const reviewedMedicationRequests = results[4]?.data ?? []

	useEffect(() => {
		results.forEach((result, index) => {
			if (result.isError || result.data?.length === 0) {
				const errorMessage =
					result.error?.response?.data?.error ||
					`Lỗi khi tải dữ liệu ${
						index === 0 ? 'thống kê' : index === 1 ? 'sự kiện sắp tới' : 'danh sách sự kiện'
					}`
				errorToast(errorMessage, undefined, 8000)
			}
		})
	}, [results])

	const eventsData = results[2]?.data ?? []

	const classQueries = useQueries({
		queries: eventsData.map(event => ({
			queryKey: ['class-in-event', event.id],
			queryFn: async () => {
				const response = await api.get(`/vaccine-event-class/${event.id}`)
				return response.data.map(item => item.classCode)
			},
			enabled: event.eventScope !== 'SCHOOL'
		}))
	})

	const isLoading = results.some(result => result.isLoading) || classQueries.some(q => q.isLoading)

	if (isLoading) {
		return <Loading bgColor="#00bc92" />
	}

	const [consentTotal, upcomingEvents, events] = results.map(result => result.data)

	const filteredEvent = () => {
		return events.filter(event => event.status === 'PENDING')
	}

	const handleScope = event => {
		if (event.eventScope === 'SCHOOL') {
			return 'Toàn trường'
		}

		const idx = events.findIndex(e => e.id === event.id)
		const data = classQueries[idx]?.data

		if (!data) return 'Đang tải...'
		return data.join(', ')
	}

	const vacc_columns = [
		{
			title: 'Tên sự kiện',
			dataIndex: 'eventTitle',
			key: 'eventTitle',
			align: 'center',
			width: 180,
			render: text => {
				return <span className="font-semibold font-inter">{text}</span>
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: 'Vaccine',
			dataIndex: 'vaccine',
			key: 'vaccine',
			align: 'center',
			width: 180,
			render: (_, record) => {
				return <span className="font-semibold font-inter">{record.vaccine.name}</span>
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: 'Địa điểm',
			dataIndex: 'location',
			key: 'location',
			align: 'center',
			width: 180,
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: 'Phạm vi tiêm chủng',
			dataIndex: 'scope',
			key: 'scope',
			align: 'center',
			width: 180,
			render: (_, record) => {
				return <span className="font-semibold">{handleScope(record)}</span>
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: 'Y tá',
			dataIndex: 'createdBy',
			key: 'createdBy',
			align: 'center',
			width: 180,
			render: (_, record) => {
				return <span className="font-semibold font-inter"> {record.createdBy?.fullName || 'Chưa có'}</span>
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: 'Ngày tạo đơn',
			dataIndex: 'createdAt',
			key: 'createdAt',
			align: 'center',
			width: 180,
			render: (_, record) => {
				return <span className="font-semibold">{formatDate(record.createdAt)}</span>
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)', color: '#115e59' } })
		},
		{
			title: '',
			key: 'action',
			align: 'center',
			width: 50,
			render: (_, record) => {
				return (

					<div className="flex flex-col gap-2">
						<button
							onClick={() => approveEvent.mutate({ type: 'vaccine', id: record.id })}
							className="font-semibold text-white bg-teal-600 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors duration-200"
						>
							Duyệt
						</button>
						<button
							onClick={() => handleRejectClick('vaccine', record)}
							className="font-semibold text-teal-700 bg-white border-1 border-teal-700 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors duration-200"
						>
							Từ chối
						</button>
					</div>
				)
			},
			onHeaderCell: () => ({ style: { fontFamily: 'var(--font-inter)' } })
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
					.custom-pagination .ant-pagination-options-size-changer.ant-select .ant-select-arrow {
						color: #0d9488 !important;
					}
					.custom-pagination .ant-pagination-options-size-changer.ant-select-focused .ant-select-selector {
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
					.custom-pagination .ant-table-tbody > tr:hover > td {
						background-color: #f0fdfa !important;
					}
				`}
			</style>
			<div className="flex max-w-full justify-between mb-16">
				<DetailBox
					title="Đã gửi"
					icon={<User size={28} />}
					number={consentTotal?.totalConsents ?? 'N/A'}
					bgColor="bg-gradient-to-r from-teal-500 to-teal-600"
					subText="toàn trường"
				/>
				<DetailBox
					title="Đã phản hồi"
					icon={<FileText size={28} />}
					number={consentTotal?.respondedConsents ?? 'N/A'}
					bgColor="bg-gradient-to-r from-emerald-500 to-emerald-600"
					subText="đang xử lý"
				/>
				<DetailBox
					title="Chưa phản hồi"
					icon={<Package size={28} />}
					number={consentTotal?.pendingConsents ?? 'N/A'}
					bgColor="bg-gradient-to-r from-amber-500 to-orange-500"
					subText="năm học này"
				/>
				<DetailBox
					title="Sự kiện sắp tới"
					icon={<CircleAlert size={28} />}
					number={upcomingEvents?.length ?? 'N/A'}
					bgColor="bg-gradient-to-r from-cyan-500 to-blue-500"
					subText="tháng này"
				/>
			</div>

			<div className="flex items-center gap-2 mt-12">
				<p className="font-bold text-white text-xl bg-gradient-to-r from-emerald-500 to-lime-600 px-6 py-2 rounded-lg">
			<span className="flex items-center gap-5">
			  <Stethoscope size={28} />
			  <span>Sự kiện khám sức khỏe chờ duyệt</span>
			</span>
				</p>
			</div>
			<Table
				dataSource={reviewedHealthCheckups}
				className="custom-pagination"
				columns={[
					{ title: 'Tên sự kiện', dataIndex: 'eventTitle', key: 'eventTitle', align: 'center' },
					{ title: 'Năm học', dataIndex: 'schoolYear', key: 'schoolYear', align: 'center' },
					{ title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', align: 'center', render: formatDate },
					{ title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', align: 'center', render: formatDate },
					{ title: 'Phạm vi', dataIndex: 'scope', key: 'scope', align: 'center' },
					{
						title: 'Người tạo',
						dataIndex: 'createdBy',
						key: 'createdBy',
						align: 'center',
						render: u => u?.fullName || ''
					},
					{
						title: 'Ngày tạo',
						dataIndex: 'createdAt',
						key: 'createdAt',
						align: 'center',
						render: formatDate
					},
					{
						title: '',
						key: 'action',
						align: 'center',
						render: (_, record) => (
							<div className="flex flex-col gap-2">
								<button
									onClick={() => approveEvent.mutate({ type: 'checkup', id: record.id })}
									className="font-semibold text-white bg-teal-600 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors duration-200"
								>
									Duyệt
								</button>
								<button
									onClick={() => handleRejectClick('checkup', record)}
									className="font-semibold text-teal-700 bg-white border-1 border-teal-700 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors duration-200"
								>
									Từ chối
								</button>
							</div>
						)
					}
				]}
				rowKey="requestId"
				pagination={false}
				components={{
					header: {
						cell: props => <th {...props} style={{ ...props.style, backgroundColor: '#a7f3d0' }} />
					}
				}}
			/>

			<div className="flex flex-col gap-3">
				<div className="flex items-center gap-2">
					<p className="font-bold text-white text-xl bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-2 rounded-lg">
						<span className="flex items-center gap-5">
							<Stethoscope size={28} />
							<span>Lịch sử tiêm chủng chờ duyệt</span>
						</span>
					</p>
				</div>
				<Table
					className="custom-pagination"
					columns={vacc_columns}
					dataSource={filteredEvent()}
					pagination={pagination}
					onChange={pagination => setPagination(pagination)}
					loading={isLoading}
					components={{
						header: {
							cell: props => <th {...props} style={{ ...props.style, backgroundColor: '#a7f3d0' }} />
						}
					}}
				/>
			</div>

			<div className="flex items-center gap-2 mt-12">
				<p className="font-bold text-white text-xl bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-2 rounded-lg">
    <span className="flex items-center gap-5">
      <Package size={28} />
      <span>Đơn dặn thuốc chờ duyệt</span>
    </span>
				</p>
			</div>
			<Table
				dataSource={reviewedMedicationRequests}
				className="custom-pagination"
				columns={[
					{ title: 'Tiêu đề', dataIndex: 'title', key: 'title', align: 'center' },
					{ title: 'Học sinh', dataIndex: 'student', key: 'student', align: 'center', render: r => `${r?.fullName || ''}` },
					{ title: 'Ngày bắt đầu', dataIndex: 'startDate', key: 'startDate', align: 'center', render: t => formatDate(t) },
					{ title: 'Ngày kết thúc', dataIndex: 'endDate', key: 'endDate', align: 'center', render: t => formatDate(t) },
					{ title: 'Lý do', dataIndex: 'reason', key: 'reason', align: 'center' },
					{ title: 'Ghi chú', dataIndex: 'note', key: 'note', align: 'center' },
					{ title: 'Người tạo', dataIndex: 'parent', key: 'parent', align: 'center', render: r => r?.fullName || '' },
					{ title: 'Ngày tạo', dataIndex: 'createAt', key: 'createAt', align: 'center', render: t => formatCreateDate(t) },
					{
						title: '',
						key: 'action',
						align: 'center',
						render: (_, record) => (
							<div className="flex flex-col gap-2">
								<button
									onClick={() => approveEvent.mutate({ type: 'medication', id: record.requestId })}
									className="font-semibold text-white bg-teal-600 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-700 transition-colors duration-200"
								>
									Duyệt
								</button>
								<button
									onClick={() => handleRejectClick('medication', record)}
									className="font-semibold text-teal-700 bg-white border-1 border-teal-700 px-4 py-0.5 rounded-lg cursor-pointer hover:bg-teal-200 transition-colors duration-200"
								>
									Từ chối
								</button>
							</div>
						)
					}
				]}
				rowKey="requestId"
				pagination={false}
				components={{
					header: {
						cell: props => <th {...props} style={{ ...props.style, backgroundColor: '#a7f3d0' }} />
					}
				}}
			/>

			<RejectReasonModal
				isOpen={rejectModalOpen}
				onClose={() => setRejectModalOpen(false)}
				onConfirm={handleRejectConfirm}
				eventTitle={selectedRequest?.eventTitle || selectedRequest?.title || ''}
				loading={rejectRequest.isPending}
			/>
		</div>
	)
}

export default Home
