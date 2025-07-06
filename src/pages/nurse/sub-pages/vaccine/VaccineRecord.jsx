import React, { useState, useEffect, useMemo } from 'react'
import { useQueries, useMutation, useQueryClient } from '@tanstack/react-query'
import ReturnButton from '../../../../components/ReturnButton'
import { useParams } from 'react-router-dom'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { Table, Input, Tag, message, Select } from 'antd'
import BulkActionBar from '../../../../components/BulkActionBar'
import { formatDate } from '../../../../utils/dateparse'

const VaccineRecord = ({ actor }) => {
	const { id } = useParams()
	const queryClient = useQueryClient()

	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [editingRow, setEditingRow] = useState(null)
	const [editingNoteRow, setEditingNoteRow] = useState(null)
	const [editingNoteValue, setEditingNoteValue] = useState('')
	const [rawVaccines, setRawVaccines] = useState([])
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 })
	const [abnormalFilter, setAbnormalFilter] = useState('Tất cả')

	const [
		{ data: vaccineEvent, isLoading: isVaccineEventLoading, isError: isVaccineEventError },
		{ data: vaccineRecord, isLoading: isVaccineRecordLoading, isError: isVaccineRecordError }
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
				queryKey: ['vaccine-record', id],
				queryFn: async () => {
					const response = await api.get(`/vaccination-history/event/${id}`)
					return response.data
				}
			}
		]
	})

	const isLoading = useMemo(
		() => isVaccineEventLoading || isVaccineRecordLoading,
		[isVaccineEventLoading, isVaccineRecordLoading]
	)

	const isError = useMemo(
		() => isVaccineEventError || isVaccineRecordError,
		[isVaccineEventError, isVaccineRecordError]
	)

	const filteredVaccines = useMemo(() => {
		const filtered = rawVaccines.filter(record => {
			if (abnormalFilter === 'Tất cả') return true
			if (abnormalFilter === 'Có') return record.abnormal === true
			if (abnormalFilter === 'Không') return record.abnormal === false
			return true
		})
		return filtered
	}, [rawVaccines, abnormalFilter])

	const statusDisplay = useMemo(() => {
		const getStatusDisplay = (status, date) => {
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
		return getStatusDisplay(vaccineEvent?.status, vaccineEvent?.event_date)
	}, [vaccineEvent?.status, vaccineEvent?.event_date])

	const templates = useMemo(
		() => [
			{
				id: 1,
				name: 'Bình thường',
				followUpNote:
					'Theo dõi 30 phút sau tiêm, học sinh không có biểu hiện bất thường. Tình trạng sức khỏe ổn định.',
				isAbnormal: false
			},
			{
				id: 2,
				name: 'Không có phản ứng phụ',
				followUpNote:
					'Quan sát 15 phút đầu và 30 phút sau tiêm, học sinh không có các triệu chứng bất thường như sốt, buồn nôn, chóng mặt.',
				isAbnormal: false
			},
			{
				id: 3,
				name: 'Theo dõi 24h an toàn',
				followUpNote:
					'Đã theo dõi liên tục trong 24h đầu sau tiêm chủng, không phát hiện bất kỳ phản ứng bất lợi nào. Học sinh hoạt động bình thường.',
				isAbnormal: false
			},
			{
				id: 4,
				name: 'Đau nhẹ tại chỗ tiêm',
				followUpNote:
					'Học sinh phàn nàn đau nhẹ tại vị trí tiêm chủng. Đã hướng dẫn chườm lạnh 10-15 phút và theo dõi. Triệu chứng đang giảm dần.',
				isAbnormal: true
			},
			{
				id: 5,
				name: 'Sưng đỏ vùng tiêm',
				followUpNote:
					'Vùng tiêm chủng có dấu hiệu sưng đỏ nhẹ, đường kính khoảng 2-3cm. Không có mủ hay nhiệt độ cao. Đã tư vấn theo dõi và báo cáo nếu diễn biến xấu.',
				isAbnormal: true
			},
			{
				id: 6,
				name: 'Mệt mỏi sau tiêm',
				followUpNote:
					'Học sinh cảm thấy mệt mỏi, uể oải sau khi tiêm 20-30 phút. Cho nghỉ ngơi tại phòng y tế, uống nước. Tình trạng đã cải thiện sau 1 giờ.',
				isAbnormal: true
			},
			{
				id: 7,
				name: 'Sốt nhẹ sau tiêm',
				followUpNote:
					'Học sinh có biểu hiện sốt nhẹ 37.5-38°C sau tiêm 2-3 giờ. Đã tư vấn phụ huynh theo dõi, uống nhiều nước, nghỉ ngơi. Nếu sốt trên 38.5°C hoặc kéo dài cần đến bệnh viện.',
				isAbnormal: true
			}
		],
		[]
	)

	useEffect(() => {
		if (vaccineEvent?.records) {
			const flattened = vaccineEvent.records.map(item =>
				item.history ? { ...item.history, student: item.student } : item
			)
			setRawVaccines(flattened)
		}
	}, [vaccineEvent])

	useEffect(() => {
		if (vaccineRecord) {
			const flattened = vaccineRecord.map(item => ({
				...item.history,
				student: item.student
			}))
			setRawVaccines(flattened)
		}
	}, [vaccineRecord])

	const updateMutation = useMutation({
		mutationFn: ({ historyId, ...changes }) => api.patch(`/vaccination-history/${historyId}`, changes),
		onSuccess: () => queryClient.invalidateQueries(['vaccine-record', id]),
		onError: () => message.error('Cập nhật thất bại')
	})

	const bulkUpdateMutation = useMutation({
		mutationFn: updates => api.patch(`/vaccination-history/bulk`, { updates }),
		onSuccess: response => {
			queryClient.invalidateQueries(['vaccine-record', id])
			if (response.data.errors.length > 0) {
				message.warning(
					`${response.data.totalUpdated}/${response.data.totalRequested} bản ghi được cập nhật. Có ${response.data.errors.length} lỗi.`
				)
			} else {
				message.success(`Cập nhật thành công ${response.data.totalUpdated} bản ghi`)
			}
		},
		onError: () => message.error('Cập nhật hàng loạt thất bại')
	})

	const updateLocalRecord = (id, payload) => {
		setRawVaccines(prev => prev.map(rec => (rec.historyId === id ? { ...rec, ...payload } : rec)))
	}

	const handleUpdateRecord = (recordId, changes) => {
		updateLocalRecord(recordId, changes)
		updateMutation.mutate({ historyId: recordId, ...changes })
	}

	const handleCancelEdit = () => {
		setEditingRow(null)
	}

	const handleSaveNote = record => {
		const note = editingNoteValue.trim()
		handleUpdateRecord(record.historyId, { followUpNote: note })
		setEditingNoteRow(null)
		setEditingNoteValue('')
	}

	const handleCancelNoteEdit = () => {
		setEditingNoteRow(null)
		setEditingNoteValue('')
	}

	const handleBulkNormal = () => {
		const updates = selectedRowKeys.map(id => ({
			historyId: id,
			abnormal: false,
			followUpNote: ''
		}))

		bulkUpdateMutation.mutate(updates)
		setSelectedRowKeys([])
	}

	const handleBulkAbnormal = () => {
		const updates = selectedRowKeys.map(id => ({
			historyId: id,
			abnormal: true
		}))

		bulkUpdateMutation.mutate(updates)
		setSelectedRowKeys([])
	}

	const handleBulkTemplate = tpl => {
		const updates = selectedRowKeys.map(id => ({
			historyId: id,
			abnormal: tpl.isAbnormal,
			followUpNote: tpl.followUpNote
		}))

		bulkUpdateMutation.mutate(updates)
		setSelectedRowKeys([])
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: keys => setSelectedRowKeys(keys)
	}

	const columns = [
		{
			title: 'Học sinh',
			key: 'student',
			align: 'center',
			width: 180,
			render: (_, record) => <span className="font-semibold">{record?.student?.fullName || 'N/A'}</span>
		},
		{
			title: 'Lớp',
			key: 'class',
			align: 'center',
			width: 120,
			render: (_, record) => record?.student?.classCode || 'N/A'
		},
		{
			title: 'Vaccine',
			key: 'vaccine',
			align: 'center',
			width: 180,
			render: (_, record) => record?.vaccine?.name || record?.vaccineName || 'N/A'
		},
		{
			title: 'Ngày tiêm',
			key: 'createdAt',
			align: 'center',
			width: 180,
			render: (_, record) => {
				if (!record?.vaccinationDate) return 'N/A'
				return formatDate(record.vaccinationDate)
			}
		},
		{
			title: 'Bất thường',
			dataIndex: 'abnormal',
			key: 'abnormal',
			align: 'center',
			width: 180,
			render: (_, record) => {
				const isEditing = editingRow === record.historyId
				if (isEditing) {
					return (
						<div className="flex gap-1 items-center justify-center min-w-[160px] h-8">
							<button
								className="px-2 py-1 text-xs bg-[#023E73] hover:bg-[#01294d] text-white rounded border border-blue-600 hover:border-blue-700 transition-colors duration-200"
								onClick={() => {
									handleUpdateRecord(record.historyId, { abnormal: true })
									setEditingRow(null)
								}}
							>
								Có
							</button>
							<button
								className="px-2 py-1 text-xs bg-[#023E73] hover:bg-[#01294d] text-white rounded border border-blue-600 hover:border-blue-700 transition-colors duration-200"
								onClick={() => {
									handleUpdateRecord(record.historyId, { abnormal: false, followUpNote: '' })
									setEditingRow(null)
								}}
							>
								Không
							</button>
							<button
								className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded border border-gray-500 hover:border-gray-600 transition-colors duration-200"
								onClick={handleCancelEdit}
							>
								✕
							</button>
						</div>
					)
				}
				return (
					<div className="flex justify-center items-center min-w-[160px] h-8">
						<Tag
							color={record.abnormal ? 'red' : 'green'}
							style={{ cursor: 'pointer' }}
							onClick={() => {
								setEditingRow(record.historyId)
							}}
						>
							{record.abnormal ? 'Có' : 'Không'}
						</Tag>
					</div>
				)
			}
		},
		{
			title: 'Ghi chú theo dõi',
			dataIndex: 'followUpNote',
			key: 'followUpNote',
			align: 'left',
			width: 250,
			render: (_, record) => {
				const isEditing = editingNoteRow === record.historyId
				if (isEditing) {
					return (
						<div className="flex gap-1 items-center w-full min-h-[32px]">
							<Input.TextArea
								style={{
									width: 180,
									minHeight: 30,
									borderColor: '#2563eb',
									'&:hover': { borderColor: '#1d4ed8' },
									'&:focus': { borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37, 99, 235, 0.2)' }
								}}
								className="border-blue-600 hover:border-blue-700 focus:border-blue-600 focus:shadow-blue-200"
								value={editingNoteValue}
								autoSize={{ minRows: 1, maxRows: 3 }}
								onChange={e => setEditingNoteValue(e.target.value)}
							/>
							<div className="flex flex-col gap-1">
								<button
									className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded border border-blue-600 hover:border-blue-700 transition-colors duration-200"
									onClick={() => handleSaveNote(record)}
								>
									✓
								</button>
								<button
									className="px-2 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded border border-gray-500 hover:border-gray-600 transition-colors duration-200"
									onClick={handleCancelNoteEdit}
								>
									✕
								</button>
							</div>
						</div>
					)
				}
				return (
					<div className="w-full min-h-[32px] flex items-center">
						<span
							className="cursor-pointer text-gray-700 italic block w-full"
							onClick={() => {
								setEditingNoteRow(record.historyId)
								setEditingNoteValue(record.followUpNote || '')
							}}
						>
							{record.followUpNote || 'Nhấp để thêm ghi chú...'}
						</span>
					</div>
				)
			}
		}
	]

	if (isLoading) {
		return <Loading />
	}

	if (isError) {
		return <div>Error fetching api & load data</div>
	}

	return (
		<div className="font-inter">
			<style>
				{`
					.ant-table-tbody > tr.ant-table-row-selected > td {
						background-color: #dbeafe !important;
					}
					.ant-table-tbody > tr.ant-table-row-selected:hover > td {
						background-color: #bfdbfe !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner::after {
						background-color: white !important;
						border-color: white !important;
					}
					.ant-checkbox-wrapper:hover .ant-checkbox-inner {
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox:hover .ant-checkbox-inner {
						border-color: #2563eb !important;
					}
					.ant-checkbox-wrapper .ant-checkbox-input:focus + .ant-checkbox-inner {
						border-color: #2563eb !important;
						box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
					}
					.ant-table-thead .ant-checkbox-wrapper .ant-checkbox-checked .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}
					.ant-table-thead .ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner {
						background-color: #2563eb !important;
						border-color: #2563eb !important;
					}
					.ant-table-thead .ant-checkbox-wrapper .ant-checkbox-indeterminate .ant-checkbox-inner::after {
						background-color: white !important;
						border-color: white !important;
					}
					.ant-table-thead .ant-checkbox-wrapper:hover .ant-checkbox-inner {
						border-color: #2563eb !important;
					}
					.ant-table-tbody > tr:hover > td {
						background-color: #eff6ff !important;
					}
					.custom-pagination .ant-pagination-options-size-changer.ant-select .ant-select-selector {
						border-color: #2563eb !important;
					}
					.custom-pagination .ant-pagination-options-size-changer.ant-select .ant-select-arrow {
						color: #2563eb !important;
					}
					.custom-pagination .ant-pagination-options-size-changer.ant-select-focused .ant-select-selector {
						border-color: #2563eb !important;
						box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
					}
					.custom-pagination .ant-pagination-options-quick-jumper input {
						border-color: #2563eb !important;
					}
					.custom-pagination .ant-pagination-options-quick-jumper input:focus {
						border-color: #2563eb !important;
						box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
					}
					.ant-select-dropdown .ant-select-item-option-selected {
						background-color: #2563eb !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item-option-active {
						background-color: #2563eb !important;
						color: white !important;
					}
					.ant-select-dropdown .ant-select-item:hover {
						background-color: #2563eb !important;
						color: white !important;
					}
					
					/* Custom Select Blue Styling */
					.custom-select-blue .ant-select-selector {
						border-color: #2563eb !important;
					}
					.custom-select-blue .ant-select-selector:hover {
						border-color: #1d4ed8 !important;
					}
					.custom-select-blue.ant-select-focused .ant-select-selector {
						border-color: #2563eb !important;
						box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2) !important;
					}
					.custom-select-blue .ant-select-arrow {
						color: #2563eb !important;
					}
				`}
			</style>
			<ReturnButton
				linkNavigate={`${actor === 'manager' ? '/manager' : '/nurse'}/vaccination/vaccine-event/${id}`}
			/>

			<div className="flex flex-col mt-10 gap-4">
				<h1 className="font-bold text-2xl">
					Chiến dịch:
					<span className="bg-gradient-to-b from-blue-600 to-blue-800 bg-clip-text text-transparent">
						{' '}
						{vaccineEvent?.eventTitle || 'N/A'}
					</span>
				</h1>
				<p className={`text-center ${statusDisplay.bgColor} font-bold px-6 py-1 w-fit rounded-lg`}>
					{statusDisplay.text}
				</p>
			</div>

			<div className="flex items-center justify-end gap-4 px-10 mt-6">
				<div className="flex items-center gap-4">
					<p className="font-medium">Bất thường</p>
					<Select
						value={abnormalFilter}
						onChange={value => setAbnormalFilter(value)}
						size="middle"
						style={{
							width: 180
						}}
						className="custom-select-blue"
						options={[
							{ value: 'Tất cả', label: 'Tất cả' },
							{ value: 'Có', label: 'Có' },
							{ value: 'Không', label: 'Không' }
						]}
					/>
				</div>
			</div>

			{selectedRowKeys.length > 0 && (
				<BulkActionBar
					selectedCount={selectedRowKeys.length}
					onBulkNormal={handleBulkNormal}
					onBulkAbnormal={handleBulkAbnormal}
					onBulkTemplate={handleBulkTemplate}
					templates={templates}
					onCancel={() => setSelectedRowKeys([])}
					theme="blue"
				/>
			)}

			<Table
				className="mt-4"
				rowSelection={rowSelection}
				columns={columns}
				dataSource={filteredVaccines}
				loading={isLoading}
				onChange={pagination => setPagination(pagination)}
				pagination={pagination}
				rowKey="historyId"
				tableLayout="fixed"
			/>
		</div>
	)
}

export default VaccineRecord
