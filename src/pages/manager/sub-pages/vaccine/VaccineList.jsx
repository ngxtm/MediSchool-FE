import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Input, Table, Select, Popconfirm } from 'antd'
import { Search, Plus, X, Pencil, Trash2 } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import api from '../../../../utils/api'
import ReturnButton from '../../../../components/ReturnButton'
import { toast, Zoom } from 'react-toastify'

const VaccineList = () => {
	const [search, setSearch] = useState('')

	const { data: vaccines = [], isLoading } = useQuery({
		queryKey: ['vaccines'],
		queryFn: async () => {
			const response = await api.get('/vaccines')
			return response.data
		}
	})

	const filteredVaccines = vaccines
		.filter(v => v.name.toLowerCase().includes(search.toLowerCase()))
		.sort((a, b) => a.name.localeCompare(b.name))

	const queryClient = useQueryClient()

	const toastPopup = message => {
		toast.error(message, {
			position: 'bottom-center',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'light',
			transition: Zoom
		})
	}

	const deleteMutation = useMutation({
		mutationFn: id => api.delete(`/vaccines/${id}`),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vaccines'] })
			toast.success('Xóa vaccine thành công!')
		},
		onError: err => toastPopup(err.message)
	})

	const columns = [
		{
			title: 'Vaccine',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
			width: 180,
			render: text => <span className="font-semibold">{text}</span>
		},
		{
			title: 'Nơi sản xuất',
			dataIndex: 'manufacturer',
			key: 'manufacturer',
			align: 'center',
			width: 180,
			render: text => <span className="font-semibold">{text}</span>
		},
		{
			title: 'Mô tả',
			dataIndex: 'description',
			key: 'description',
			onHeaderCell: () => ({ style: { textAlign: 'center' } })
		},
		{
			title: 'Số liều yêu cầu',
			dataIndex: 'dosesRequired',
			key: 'dosesRequired',
			align: 'center',
			width: 100
		},
		{
			title: 'Nhiệt độ bảo quản',
			dataIndex: 'storageTemperature',
			key: 'storageTemperature',
			align: 'center',
			width: 180
		},
		{
			title: 'Triệu chứng sau tiêm',
			dataIndex: 'sideEffects',
			key: 'sideEffects',
			onHeaderCell: () => ({ style: { textAlign: 'center' } })
		},
		{
			title: '',
			key: 'action',
			align: 'center',
			render: (_, record) => (
				<div className="flex items-center gap-2">
					<DialogEdit vaccine={record} />
					<Popconfirm
						title="Bạn có chắc chắn muốn xoá vaccine này?"
						okText="Xoá"
						cancelText="Huỷ"
						onConfirm={() => deleteMutation.mutate(record.vaccineId)}
					>
						<button
							type="button"
							className="group p-2 rounded-md hover:bg-red-100 active:scale-95 transition-all"
						>
							<Trash2 size={18} className="text-red-600" />
						</button>
					</Popconfirm>
				</div>
			)
		}
	]

	const DialogCreate = ({ onCreateSuccess }) => {
		const [formData, setFormData] = useState({
			name: '',
			manufacturer: '',
			dosesRequired: '',
			description: '',
			sideEffects: '',
			storageTemperature: '',
			categoryId: ''
		})

		const queryClient = useQueryClient()

		const toastPopup = message => {
			toast.error(message, {
				position: 'bottom-center',
				autoClose: 5000,
				hideProgressBar: false,
				closeOnClick: true,
				pauseOnHover: true,
				draggable: true,
				progress: undefined,
				theme: 'light',
				transition: Zoom
			})
		}

		const createMutation = useMutation({
			mutationFn: newVac => api.post('/vaccines', newVac),
			onSuccess: () => {
				queryClient.invalidateQueries({ queryKey: ['vaccines'] })
				toast.success('Tạo vaccine thành công!')
				if (onCreateSuccess) onCreateSuccess()
			},
			onError: err => toastPopup(err.message)
		})

		const handleChange = (field, value) => {
			setFormData(prev => ({ ...prev, [field]: value }))
		}

		const handleSubmit = () => {
			createMutation.mutate(formData)
		}

		return (
			<Dialog.Root className="font-inter">
				<Dialog.Trigger asChild>
					<button
						type="button"
						className="group bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-7 py-2 rounded-lg font-bold flex items-center gap-3 active:scale-95 transition-all duration-200"
					>
						<Plus size={18} className="transition-transform duration-200 group-hover:rotate-90" />
						Thêm thông tin Vaccine
					</button>
				</Dialog.Trigger>
				<Dialog.Portal>
					<Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
					<Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white py-10 px-8 shadow-lg focus:outline-none z-[61]">
						<Dialog.Title className="text-2xl font-extrabold text-center mb-6">
							THÔNG TIN VACCINE
						</Dialog.Title>

						<div className="flex flex-col gap-6">
							<div className="flex flex-col">
								<label className="font-semibold" htmlFor="name">
									Tên Vaccine
								</label>
								<input
									id="name"
									className="input-field"
									placeholder="Ví dụ: Vaxigrip, Pfizer,..."
									value={formData.name}
									onChange={e => handleChange('name', e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label className="font-semibold" htmlFor="manufacturer">
										Nơi sản xuất
									</label>
									<input
										id="manufacturer"
										className="input-field"
										placeholder="Ví dụ: Sanofi, Pfizer,..."
										value={formData.manufacturer}
										onChange={e => handleChange('manufacturer', e.target.value)}
									/>
								</div>
								<div>
									<label className="font-semibold" htmlFor="dosesRequired">
										Số liều yêu cầu
									</label>
									<input
										id="dosesRequired"
										type="number"
										min="1"
										className="input-field"
										placeholder="(liều)"
										value={formData.dosesRequired}
										onChange={e => handleChange('dosesRequired', e.target.value)}
									/>
								</div>
							</div>

							<div>
								<label className="font-semibold" htmlFor="description">
									Mô tả
								</label>
								<textarea
									id="description"
									rows={3}
									className="textarea-field"
									placeholder="Ví dụ: Vaccine phòng dịch COVID-19,..."
									value={formData.description}
									onChange={e => handleChange('description', e.target.value)}
								/>
							</div>

							<div>
								<label className="font-semibold" htmlFor="sideEffects">
									Triệu chứng sau khi tiêm
								</label>
								<textarea
									id="sideEffects"
									rows={3}
									className="textarea-field"
									placeholder="Ví dụ: Sốt nhẹ, phát ban, sưng nhẹ tại chỗ tiêm, đau khớp,..."
									value={formData.sideEffects}
									onChange={e => handleChange('sideEffects', e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-2 gap-4">
								<div className="flex flex-col">
									<label className="font-semibold" htmlFor="storageTemperature">
										Nhiệt độ bảo quản
									</label>
									<input
										id="storageTemperature"
										className="input-field"
										placeholder="Ví dụ: 0-30 độ C,..."
										value={formData.storageTemperature}
										onChange={e => handleChange('storageTemperature', e.target.value)}
									/>
								</div>
								<div className="flex flex-col">
									<label className="font-semibold" htmlFor="categoryId">
										Phòng bệnh
									</label>
									<div className="mt-2">
										<Select
											id="categoryId"
											value={formData.categoryId}
											onChange={value => handleChange('categoryId', value)}
											placeholder="Chọn loại bệnh"
											style={{ width: '100%' }}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className="mt-10 flex justify-center gap-6">
							<Dialog.Close asChild>
								<button className="h-[45px] w-[160px] rounded-md bg-gray-100 text-black font-semibold hover:bg-gray-200 active:scale-95 transition-all">
									Hủy
								</button>
							</Dialog.Close>
							<button
								onClick={handleSubmit}
								disabled={createMutation.isPending}
								className="h-[45px] w-[160px] rounded-md bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-400 text-white font-semibold hover:scale-105 hover:brightness-110 hover:shadow-2xl hover:shadow-emerald-500/50 active:scale-95 transition-all duration-300 disabled:opacity-60"
							>
								{createMutation.isPending ? 'Đang tạo...' : 'Xác nhận'}
							</button>
						</div>

						<Dialog.Close asChild>
							<button
								className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
								aria-label="Close"
							>
								<X size={20} />
							</button>
						</Dialog.Close>
					</Dialog.Content>
				</Dialog.Portal>
			</Dialog.Root>
		)
	}

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		showSizeChanger: true,
		showQuickJumper: true
	})

	return (
		<>
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
					.input-field:focus {
						border-color: #10b981 !important;
						box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important;
						outline: none !important;
					}
					.textarea-field:focus {
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
				`}
			</style>
			<ReturnButton linkNavigate="/manager/vaccination" actor="manager" />
			<p className="text-[24px] font-bold mt-10">Danh sách các loại vaccine hiện có</p>

			<div className="flex justify-between items-center mt-6 mb-4">
				<Input
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
					placeholder="Tìm kiếm Vaccine"
					style={{ width: 300 }}
					className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
					allowClear
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>

				<DialogCreate onCreateSuccess={() => {}} />
			</div>

			<Table
				className="custom-pagination"
				columns={columns}
				dataSource={filteredVaccines}
				loading={isLoading}
				onChange={pagination => setPagination(pagination)}
				pagination={pagination}
				rowKey="vaccineId"
				components={{
					header: {
						cell: props => <th {...props} style={{ ...props.style, backgroundColor: '#a7f3d0' }} />
					}
				}}
			/>
		</>
	)
}

const DialogEdit = ({ vaccine }) => {
	const [formData, setFormData] = useState({
		name: vaccine?.name || '',
		manufacturer: vaccine?.manufacturer || '',
		dosesRequired: vaccine?.dosesRequired || '',
		description: vaccine?.description || '',
		sideEffects: vaccine?.sideEffects || '',
		storageTemperature: vaccine?.storageTemperature || ''
	})

	const queryClient = useQueryClient()

	const toastPopup = message => {
		toast.error(message, {
			position: 'bottom-center',
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
			theme: 'light',
			transition: Zoom
		})
	}

	const updateMutation = useMutation({
		mutationFn: updatedVac => api.put(`/vaccines/${vaccine.vaccineId}`, updatedVac),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['vaccines'] })
			toast.success('Cập nhật vaccine thành công!')
		},
		onError: err => toastPopup(err.message)
	})

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }))
	}

	const handleSubmit = () => {
		updateMutation.mutate({
			...formData,
			dosesRequired: Number(formData.dosesRequired),
			categoryId: formData.categoryId || vaccine.categoryId
		})
	}

	return (
		<Dialog.Root>
			<Dialog.Trigger asChild>
				<button type="button" className="group p-2 rounded-md hover:bg-gray-100 active:scale-95 transition-all">
					<Pencil size={18} className="text-[#023E73]" />
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
				<Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white py-10 px-8 shadow-lg focus:outline-none z-[61]">
					<Dialog.Title className="text-2xl font-extrabold text-center mb-6">
						CHỈNH SỬA THÔNG TIN VACCINE
					</Dialog.Title>

					<div className="flex flex-col gap-6">
						<div className="flex flex-col">
							<label className="font-semibold" htmlFor={`name-${vaccine.vaccineId}`}>
								Tên Vaccine
							</label>
							<input
								id={`name-${vaccine.vaccineId}`}
								className="input-field"
								value={formData.name}
								onChange={e => handleChange('name', e.target.value)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col">
								<label className="font-semibold" htmlFor={`manufacturer-${vaccine.vaccineId}`}>
									Nơi sản xuất
								</label>
								<input
									id={`manufacturer-${vaccine.vaccineId}`}
									className="input-field"
									value={formData.manufacturer}
									onChange={e => handleChange('manufacturer', e.target.value)}
								/>
							</div>
							<div>
								<label className="font-semibold" htmlFor={`doses-${vaccine.vaccineId}`}>
									Số liều yêu cầu
								</label>
								<input
									id={`doses-${vaccine.vaccineId}`}
									type="number"
									min="1"
									className="input-field"
									value={formData.dosesRequired}
									onChange={e => handleChange('dosesRequired', e.target.value)}
								/>
							</div>
						</div>

						<div>
							<label className="font-semibold" htmlFor={`description-${vaccine.vaccineId}`}>
								Mô tả
							</label>
							<textarea
								id={`description-${vaccine.vaccineId}`}
								rows={3}
								className="textarea-field"
								value={formData.description}
								onChange={e => handleChange('description', e.target.value)}
							/>
						</div>

						<div>
							<label className="font-semibold" htmlFor={`sideEffects-${vaccine.vaccineId}`}>
								Triệu chứng sau khi tiêm
							</label>
							<textarea
								id={`sideEffects-${vaccine.vaccineId}`}
								rows={3}
								className="textarea-field"
								value={formData.sideEffects}
								onChange={e => handleChange('sideEffects', e.target.value)}
							/>
						</div>

						<div>
							<label className="font-semibold" htmlFor={`storage-${vaccine.vaccineId}`}>
								Nhiệt độ bảo quản
							</label>
							<input
								id={`storage-${vaccine.vaccineId}`}
								className="input-field"
								value={formData.storageTemperature}
								onChange={e => handleChange('storageTemperature', e.target.value)}
							/>
						</div>
					</div>

					<div className="mt-10 flex justify-center gap-6">
						<Dialog.Close asChild>
							<button className="h-[45px] w-[160px] rounded-md bg-gray-100 text-black font-semibold hover:bg-gray-200 active:scale-95 transition-all">
								Hủy
							</button>
						</Dialog.Close>
						<button
							onClick={handleSubmit}
							disabled={updateMutation.isPending}
							className="h-[45px] w-[160px] text-bold rounded-md bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-400 text-white font-semibold hover:scale-105 hover:brightness-110 hover:shadow-2xl active:scale-95 transition-all duration-300 disabled:opacity-60"
						>
							{updateMutation.isPending ? 'Đang cập nhật...' : 'Xác nhận'}
						</button>
					</div>

					<Dialog.Close asChild>
						<button className="absolute top-3 right-3 text-gray-500 hover:text-gray-700" aria-label="Close">
							<X size={20} />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}

export default VaccineList
