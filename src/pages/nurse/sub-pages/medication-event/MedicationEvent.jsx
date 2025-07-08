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
import { useQuery, useQueryClient } from '@tanstack/react-query'
import DetailBox from '../../components/DetailBox.jsx'
import Loading from '../../../../components/Loading.jsx'
import { useState } from 'react'
import { Input, Select } from 'antd'
import { formatDate, formatDateTime } from '../../../../utils/dateparse.jsx'
import { successToast, errorToast } from '../../../../components/ToastPopup.jsx'
import useActorNavigation from '../../../../hooks/useActorNavigation'

const DialogCreate = ({ classes, students, onClose, onCreateSuccess }) => {
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

			const classCode =
				formDate.classSelected.classCode || formDate.classSelected.code || formDate.classSelected.name
			console.log('Using classCode:', classCode)

			const studentsInClass = students.filter(student => student.classCode === classCode)
			console.log('Students in class:', studentsInClass)
			const filtered = studentsInClass.filter(student =>
				student.fullName.toLowerCase().includes(value.toLowerCase())
			)
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
		<div
			className="font-inter fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
			onClick={onClose}
		>
			<div
				className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
				onClick={e => e.stopPropagation()}
			>
				<div className="bg-gradient-to-r from-[#023E73] to-[#034a8a] text-white px-6 py-6 rounded-t-2xl">
					<h2 className="text-2xl font-bold text-center">TẠO SỰ KIỆN Y TẾ</h2>
					<p className="text-center text-blue-100 mt-2">Ghi nhận và xử lý tình huống sức khỏe học sinh</p>
				</div>

				<div className="p-8">
					<div className="bg-blue-50 rounded-xl p-6 mb-8">
						<h3 className="text-xl font-bold text-[#023E73] mb-4 flex items-center">
							<div className="w-6 h-6 bg-[#023E73] rounded-full text-white flex items-center justify-center text-sm font-bold mr-3">
								1
							</div>
							Thông tin học sinh
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Lớp *</label>
								<div className="relative">
									<input
										type="text"
										value={formDate.classSearch}
										onChange={e => handleClassSearch(e.target.value)}
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent"
										placeholder="Nhập tên lớp cần tìm"
									/>
									{showSuggestions && filteredClasses.length > 0 && (
										<div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-40 overflow-y-auto z-10">
											{filteredClasses.map(classItem => (
												<div
													key={classItem.id}
													className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
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
								<label className="block text-sm font-semibold text-gray-700 mb-2">Học sinh *</label>
								<div className="relative">
									<input
										type="text"
										value={formDate.studentSearch}
										onChange={e => handleStudentSearch(e.target.value)}
										className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
											formDate.classSelected
												? 'bg-white text-gray-900 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent cursor-text'
												: 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
										}`}
										placeholder={
											formDate.classSelected ? 'Nhập tên học sinh' : 'Vui lòng chọn lớp trước'
										}
										disabled={!formDate.classSelected}
									/>
									{showStudentSuggestions && filteredStudents.length > 0 && (
										<div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-40 overflow-y-auto z-10">
											{filteredStudents.map(student => (
												<div
													key={student.id}
													className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
													onClick={() => handleStudentSelect(student)}
												>
													<div className="flex flex-col gap-1">
														<div className="font-medium">{student.fullName}</div>
														<div className="text-gray-500 text-sm">
															Ngày sinh: {formatDate(student.dateOfBirth)}
														</div>
													</div>
												</div>
											))}
										</div>
									)}
								</div>
							</div>
						</div>

						{formDate.studentSelected && (
							<div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
								<div className="flex items-center gap-6">
									<div className="flex-shrink-0">
										<img
											src={formDate.studentSelected.avatar || '/default-avatar.png'}
											alt={formDate.studentSelected.fullName}
											className="w-16 h-16 rounded-full object-cover border-2 border-green-300"
											onError={e => {
												e.target.src = '/default-avatar.png'
											}}
										/>
									</div>
									<div className="flex-1">
										<h4 className="font-bold text-lg text-gray-900">
											{formDate.studentSelected.fullName}
										</h4>
										<p className="text-gray-600">
											Mã HS: {formDate.studentSelected.studentCode} | Lớp:{' '}
											{formDate.studentSelected.classCode}
										</p>
										<p className="text-gray-500 text-sm">
											Ngày sinh: {formatDate(formDate.studentSelected.dateOfBirth)}
										</p>
									</div>
								</div>
							</div>
						)}
					</div>

					<div className="bg-gray-50 rounded-xl p-6 mb-8">
						<h3 className="text-xl font-bold text-[#023E73] mb-4 flex items-center">
							<div className="w-6 h-6 bg-[#023E73] rounded-full text-white flex items-center justify-center text-sm font-bold mr-3">
								2
							</div>
							Chi tiết sự kiện
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Tên sự kiện *</label>
								<input
									type="text"
									value={formDate.eventTitle}
									onChange={e => handleInputChange('eventTitle', e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent"
									placeholder="Ví dụ: Đau bụng, Sốt cao, Chấn thương..."
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">
									Mức độ nghiêm trọng
								</label>
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
								<label className="block text-sm font-semibold text-gray-700 mb-2">Địa điểm</label>
								<input
									type="text"
									value={formDate.location}
									onChange={e => handleInputChange('location', e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent"
									placeholder="Ví dụ: Phòng y tế, Lớp học, Sân chơi..."
								/>
							</div>

							<div>
								<label className="block text-sm font-semibold text-gray-700 mb-2">Xử lý</label>
								<input
									type="text"
									value={formDate.solution}
									onChange={e => handleInputChange('solution', e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent"
									placeholder="Mô tả cách xử lý tình huống"
								/>
							</div>
						</div>

						<div className="mt-6">
							<label className="block text-sm font-semibold text-gray-700 mb-2">Mô tả chi tiết</label>
							<textarea
								value={formDate.description}
								onChange={e => handleInputChange('description', e.target.value)}
								className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent"
								rows="4"
								placeholder="Mô tả chi tiết về tình trạng sức khỏe và các triệu chứng..."
							/>
						</div>
					</div>

					<div className="bg-orange-50 rounded-xl p-6 mb-8">
						<h3 className="text-xl font-bold text-[#023E73] mb-4 flex items-center">
							<div className="w-6 h-6 bg-[#023E73] rounded-full text-white flex items-center justify-center text-sm font-bold mr-3">
								3
							</div>
							Thuốc và vật dụng y tế
						</h3>

						<div className="mb-4">
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Thêm thuốc/vật dụng
							</label>
							<div className="relative">
								<input
									type="text"
									value={formDate.medicineSearch}
									onChange={e => handleMedicineSearch(e.target.value)}
									className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#023E73] focus:border-transparent pl-10"
									placeholder="Tìm kiếm thuốc hoặc vật dụng y tế..."
									disabled={medicinesLoading}
								/>
								<Package className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
								{showMedicineSuggestions && filteredMedicines.length > 0 && (
									<div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-lg border border-gray-200 max-h-60 overflow-y-auto z-10">
										{filteredMedicines.map(medicine => (
											<div
												key={medicine.id}
												className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
												onClick={() => handleMedicineSelect(medicine)}
											>
												<div className="flex justify-between items-center">
													<div>
														<div className="font-medium">{medicine.name}</div>
														<div className="text-sm text-gray-500">
															Mã: {medicine.code} | Còn lại:{' '}
															{medicine.quantityOnHand || 0} {medicine.unit}
														</div>
													</div>
													<Plus className="w-4 h-4 text-[#023E73]" />
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
									<div key={medicine.id} className="bg-white border border-orange-200 rounded-lg p-4">
										<div className="flex items-center justify-between mb-3">
											<div className="flex-1">
												<h5 className="font-medium text-gray-900">{medicine.name}</h5>
												<p className="text-sm text-gray-500">Mã: {medicine.code}</p>
											</div>
											<button
												onClick={() => removeMedicine(medicine.id)}
												className="text-red-500 hover:text-red-700 p-1"
											>
												<Trash2 className="w-4 h-4" />
											</button>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											<div>
												<label className="block text-xs font-semibold text-gray-600 mb-1">
													Số lượng
												</label>
												<input
													type="number"
													min="1"
													value={medicine.quantity}
													onChange={e =>
														handleMedicineQuantityChange(medicine.id, e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#023E73]"
												/>
											</div>
											<div>
												<label className="block text-xs font-semibold text-gray-600 mb-1">
													Đơn vị
												</label>
												<input
													type="text"
													value={medicine.unit}
													readOnly
													className="w-full px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50"
												/>
											</div>
											<div>
												<label className="block text-xs font-semibold text-gray-600 mb-1">
													Ghi chú
												</label>
												<input
													type="text"
													value={medicine.note}
													onChange={e =>
														handleMedicineNoteChange(medicine.id, e.target.value)
													}
													className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#023E73]"
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

				<div className="bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200">
					<div className="flex justify-end gap-4">
						<button
							type="button"
							onClick={handleCancel}
							className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
						>
							Hủy
						</button>
						<button
							type="button"
							onClick={handleSubmit}
							className="px-8 py-3 bg-[#023E73] text-white rounded-lg hover:bg-[#01294d] transition-colors font-medium flex items-center gap-2"
						>
							<Plus className="w-5 h-5" />
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
	const [sendingEmails, setSendingEmails] = useState({})
	const queryClient = useQueryClient()
	const { navigateWithHistory } = useActorNavigation('nurse')

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
		try {
			setSendingEmails(prev => ({ ...prev, [eventId]: true }))

			const response = await api.post(`/health-event/${eventId}/send-email-notifications`)

			if (response.status === 200) {
				const totalSent = response.data?.totalEmailsSent || response.data?.totalParentsNotified || 0
				successToast(`Đã gửi thông báo thành công đến ${totalSent} phụ huynh`, 'bottom-center')
			}
		} catch (error) {
			const errorMessage = error.response?.data?.message || 'Không thể gửi thông báo email'
			errorToast(errorMessage, 'bottom-center')
		} finally {
			setSendingEmails(prev => ({ ...prev, [eventId]: false }))
		}
	}

	return (
		<div className="font-inter">
			<div className="flex md:flex-row flex-col md:gap-0 gap-10 max-w-full justify-between mb-10">
				<DetailBox
					title="Tổng cộng"
					icon={<Bell size={28} />}
					number={totalHealthEventStatus.totalHealthEvent}
					width={350}
					gap={20}
					titleSize={22}
				/>
				<DetailBox
					title="Ca bình thường"
					icon={<CircleCheckBig size={28} />}
					number={totalHealthEventStatus.totalNormalCase}
					width={350}
					gap={20}
					titleSize={22}
				/>
				<DetailBox
					title="Ca nguy hiểm"
					icon={<CircleAlert size={28} />}
					number={totalHealthEventStatus.totalDangerousCase}
					width={350}
					gap={20}
					titleSize={22}
				/>
			</div>
			<h1 className="text-2xl font-bold mb-6">Danh sách sự kiện y tế</h1>
			<div className="flex items-center justify-between w-full">
				<Input
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
					placeholder="Tìm kiếm sự kiện y tế"
					style={{ width: 280 }}
					className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
					allowClear
					value={search}
					onChange={e => setSearch(e.target.value)}
				/>
				<div className="flex items-center gap-6">
					<p className="font-bold text-lg">Mức độ nghiêm trọng</p>
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
						className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-semibold text-base transition-all duration-200 ease-in-out hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
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
					<div className="grid grid-cols-1 gap-4 py-6 px-28">
						{filteredEvents.map((event, index) => {
							const { text: statusText, bgColor } = handleExtent(event.extent)
							return (
								<div key={event.id || index} className="border-b p-4">
									<div className="flex justify-between items-start">
										<div className="flex flex-col w-full gap-3">
											<div className="flex justify-between w-full">
												<div className="flex flex-col gap-3">
													<div className="flex gap-6 items-center">
														<div className="ml-4">
															<Activity size={55} />
														</div>
														<div className="flex flex-col gap-3">
															<h3 className="font-bold text-lg text-gray-900">
																Sự kiện: {event.problem}
															</h3>
															<p>Học sinh: {event.student.fullName}</p>
															<p>Địa điểm: {event.location}</p>
														</div>
													</div>
													<div className="flex flex-col gap-3">
														<p className="max-w-2xl break-words">
															<span className="font-bold">Xử lý:</span> {event.solution}
														</p>
														<p className="max-w-2xl break-words">
															<span className="font-bold">Mô tả:</span>{' '}
															{event.description}
														</p>
													</div>
												</div>
												<div className="flex gap-8 items-center">
													<div className="w-fit flex flex-col justify-center gap-2">
														<p
															className={`px-3 py-1 rounded-full text-sm ${bgColor} text-center font-bold`}
														>
															{statusText}
														</p>
														<button
															onClick={() => handleSendEmailNotification(event.id)}
															disabled={sendingEmails[event.id]}
															className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
																sendingEmails[event.id]
																	? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
																	: 'bg-[#023E73] text-white hover:bg-[#01294d] hover:shadow-md active:scale-95 cursor-pointer'
															}`}
														>
															{sendingEmails[event.id] ? (
																<>
																	<div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
																	Đang gửi...
																</>
															) : (
																<>
																	<Send size={12} />
																	Gửi thông báo
																</>
															)}
														</button>
														<p className="text-sm italic text-gray-500">
															Thời gian: {formatDateTime(event.eventTime)}
														</p>
													</div>
													<button
														onClick={() => navigateWithHistory(`/nurse/medication-event/${event.id}`)}
														className="group cursor-pointer p-2 rounded-lg transition-all duration-300 ease-in-out"
													>
														<ChevronRight
															size={20}
															className="text-gray-500 transition-all duration-300 ease-in-out group-hover:text-[#023E73] group-hover:scale-110 group-hover:translate-x-1"
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
					<div className="bg-white rounded-lg shadow p-8 text-center">
						<p className="text-gray-500">Không có sự kiện y tế nào phù hợp với bộ lọc</p>
					</div>
				)}
			</div>
		</div>
	)
}

export default MedicationEvent
