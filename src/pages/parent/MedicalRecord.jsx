import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import api from '../../utils/api'
import { useStudent } from '../../context/StudentContext'

const MedicalRecord = () => {
	const { selectedStudent } = useStudent()
	const rowBlue = 'flex justify-between flex-col md:flex-row bg-[#DAEAF7] px-6 py-3 rounded-xl'
	const rowWhite = 'flex justify-between flex-col md:flex-row px-6 py-3'
	const header = 'font-bold mb-4 text-2xl mb-6'

	const {
		data: healthProfile,
		isLoading: healthProfileLoading,
		isError: healthProfileError
	} = useQuery({
		queryKey: ['healthProfile', selectedStudent?.studentId],
		queryFn: async () => {
			if (!selectedStudent?.studentId) return null
			const response = await api.get(`/health-profile/student/${selectedStudent.studentId}`)
			return response.data
		},
		enabled: !!selectedStudent?.studentId
	})

	const {
		data: healthEvents,
		isLoading: healthEventsLoading,
		isError: healthEventsError
	} = useQuery({
		queryKey: ['healthEvents', selectedStudent?.studentId],
		queryFn: async () => {
			if (!selectedStudent?.studentId) return []
			const response = await api.get('/health-event')
			return response.data.filter(event => event.student.studentId === selectedStudent.studentId)
		},
		enabled: !!selectedStudent?.studentId
	})

	const formatDate = dateString => {
		const date = new Date(dateString)
		return date.toLocaleDateString('en-GB')
	}

	const getStatusInfo = extent => {
		switch (extent?.toUpperCase()) {
			case 'DANGEROUS':
				return {
					text: 'NGUY HIỂM',
					bgColor: 'bg-[#FFCCCC]',
					textColor: 'text-[#D32F2F]'
				}
			case 'NORMAL':
				return {
					text: 'NHẸ',
					bgColor: '',
					textColor: 'text-[#2E7D32]'
				}
			default:
				return {
					text: 'KHÔNG XÁC ĐỊNH',
					bgColor: 'bg-[#FFF3CD]',
					textColor: 'text-[#856404]'
				}
		}
	}

	const renderHealthEventItem = (event, index) => {
		const statusInfo = getStatusInfo(event.extent)
		const medicines = event.eventMedicines || []
		const medicineText =
			medicines.length > 0 ? medicines.map(med => `${med.medicine.name}`).join(', ') : 'Không có thuốc'

		return (
			<div
				key={event.id || index}
				className={`grid grid-cols-12 rounded-xl px-8 py-4 m-0 cursor-pointer group
					${statusInfo.bgColor} 
					transform transition-all duration-300 ease-in-out
					hover:scale-[1.02] hover:shadow-lg hover:shadow-gray-200
					hover:border hover:border-gray-300
					active:scale-[0.98] active:shadow-md
				`}
			>
				<div className="flex flex-col gap-3 col-span-3 border-r-2 border-gray-400 group-hover:border-gray-500 transition-colors duration-300">
					<p
						className={`font-bold transition-colors duration-300 ${statusInfo.textColor} group-hover:text-opacity-80`}
					>
						{statusInfo.text}
					</p>
					<p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-300">
						{formatDate(event.eventTime)}
					</p>
				</div>
				<div className="col-span-9">
					<div className="flex justify-between items-center">
						<div className="flex flex-col gap-2 pl-5">
							<p className="group-hover:text-gray-800 transition-colors duration-300 font-medium">
								{event.problem}
							</p>
							<p className="font-semibold text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
								{medicineText}
							</p>
						</div>
						<div className="transition-all duration-300 group-hover:scale-110 group-hover:translate-x-1 group-hover:text-blue-600">
							<ChevronRight className="w-5 h-5" />
						</div>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className="flex justify-between gap-4 md:gap-30 md:flex-row flex-col">
			<div className="md:w-1/2">
				<div className="mb-6">
					<h1 className={header}>Thông tin sức khoẻ cơ bản</h1>
					{healthProfileLoading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
						</div>
					) : healthProfileError ? (
						<div className="text-center py-4">
							<p className="text-red-600 text-sm">Không thể tải thông tin sức khỏe</p>
						</div>
					) : (
						<>
							<div className={rowBlue}>
								<p className="w-fit font-bold">Chiều cao</p>
								<p className="w-fit">
									{healthProfile?.height ? `${healthProfile.height} (cm)` : 'Chưa cập nhật'}
								</p>
							</div>
							<div className={rowWhite}>
								<p className="w-fit font-bold">Cân nặng</p>
								<p className="w-fit">
									{healthProfile?.weight ? `${healthProfile.weight} (kg)` : 'Chưa cập nhật'}
								</p>
							</div>
							<div className={rowBlue}>
								<p className="w-fit font-bold">Nhóm máu</p>
								<p className="w-fit">{healthProfile?.bloodType || 'Chưa cập nhật'}</p>
							</div>
							<div className={rowWhite}>
								<p className="w-fit font-bold">Giá trị huyết áp</p>
								<p className="w-fit">{healthProfile?.bloodPressure || 'Chưa cập nhật'}</p>
							</div>
							<div className={rowBlue}>
								<p className="w-fit font-bold">Chỉ số BMI</p>
								<p className="w-fit">
									{healthProfile?.height && healthProfile?.weight
										? (healthProfile.weight / Math.pow(healthProfile.height / 100, 2)).toFixed(1)
										: 'Chưa cập nhật'}
								</p>
							</div>
						</>
					)}
				</div>
				<div className="mb-6">
					<h1 className={header}>Thị lực</h1>
					{healthProfileLoading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
						</div>
					) : healthProfileError ? (
						<div className="text-center py-4">
							<p className="text-red-600 text-sm">Không thể tải thông tin thị lực</p>
						</div>
					) : (
						<>
							<div className={rowBlue}>
								<p className="w-fit font-bold">Mắt phải không kính</p>
								<p className="w-fit">
									{healthProfile?.rightEye ? `${healthProfile.rightEye}/10` : 'Chưa cập nhật'}
								</p>
							</div>
							<div className={rowWhite}>
								<p className="w-fit font-bold">Mắt trái không kính</p>
								<p className="w-fit">
									{healthProfile?.leftEye ? `${healthProfile.leftEye}/10` : 'Chưa cập nhật'}
								</p>
							</div>
						</>
					)}
				</div>
				<div className="mb-6">
					<h1 className={header}>Khác</h1>
					{healthProfileLoading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
						</div>
					) : healthProfileError ? (
						<div className="text-center py-4">
							<p className="text-red-600 text-sm">Không thể tải thông tin khác</p>
						</div>
					) : (
						<>
							<div className={rowBlue}>
								<p className="w-fit font-bold">Bệnh nền</p>
								<p className="w-fit">{healthProfile?.chronicConditions || 'Không'}</p>
							</div>
							<div className={rowWhite}>
								<p className="w-fit font-bold">Dị ứng</p>
								<p className="w-fit">{healthProfile?.allergies || 'Không'}</p>
							</div>
						</>
					)}
				</div>
			</div>
			<div className="md:w-1/2">
				<h1 className={header}>Thông tin tai nạn y tế</h1>
				<div className="space-y-3">
					{healthEventsLoading ? (
						<div className="text-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
							<p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
						</div>
					) : healthEventsError ? (
						<div className="text-center py-8">
							<p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu</p>
						</div>
					) : healthEvents && healthEvents.length > 0 ? (
						<>
							{healthEvents
								.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime))
								.map((event, index) => renderHealthEventItem(event, index))}
						</>
					) : (
						<div className="text-center py-8">
							<p className="text-gray-500">Không có thông tin tai nạn y tế</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}

export default MedicalRecord
