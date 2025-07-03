import { useParams } from 'react-router-dom'
import ReturnButton from '../../../../components/ReturnButton'
import { useQuery } from '@tanstack/react-query'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { formatDate, formatDateTime } from '../../../../utils/dateparse'

const HealthEventDetail = ({ actor }) => {
	const { id } = useParams()

	const {
		data: detailEvent,
		isLoading: isLoadingDetailEvent,
		isError: isErrorDetailEvent,
		error: detailEventErrorMessage
	} = useQuery({
		queryKey: ['health-event', id],
		queryFn: async () => {
			const response = await api.get(`/health-event/${id}`)
			return response.data
		},
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
		cacheTime: 10 * 60 * 1000
	})

	const {
		data: parents,
		isLoading: isLoadingParents,
		isError: isErrorParents,
		error: parentsErrorMessage
	} = useQuery({
		queryKey: ['parents', detailEvent?.student?.studentId],
		queryFn: async () => {
			const response = await api.get(`/students/${detailEvent.student.studentId}/parents`)
			return response.data
		},
		enabled: !!detailEvent?.student?.studentId,
		staleTime: 5 * 60 * 1000,
		cacheTime: 10 * 60 * 1000
	})

	if (isLoadingDetailEvent) return <Loading />

	if (isErrorDetailEvent) return <div>Error: {detailEventErrorMessage.message}</div>

	if (!detailEvent) return <div>Không tìm thấy dữ liệu sự kiện</div>

	const getParentDisplay = () => {
		if (isLoadingParents) return <p>Đang tải thông tin phụ huynh...</p>
		if (isErrorParents) return <p>Lỗi tải thông tin phụ huynh: {parentsErrorMessage?.message}</p>
		if (!parents || parents.length === 0) return <p>Không có thông tin phụ huynh</p>

		return parents.map((parent, index) => (
			<div key={parent.parentId} className="flex flex-col gap-2 mb-4 border border-gray-300 rounded-lg p-4">
				<h2 className="font-semibold text-md">Phụ huynh {index + 1}:</h2>
				<p>Họ và tên: {parent.fullName ?? 'N/A'}</p>
				<p>Số điện thoại: {parent.phone ?? 'N/A'}</p>
				<p>Email: {parent.email ?? 'N/A'}</p>
				{parent.job && <p>Nghề nghiệp: {parent.job ?? 'N/A'}</p>}
				{parent.jobPlace && <p>Nơi làm việc: {parent.jobPlace ?? 'N/A'}</p>}
			</div>
		))
	}

	const handleExtent = status => {
		if (!status) return { text: 'Lỗi trạng thái', bgColor: 'bg-[#FFF694]' }
		switch (status) {
			case 'DANGEROUS':
				return { text: 'Nghiêm trọng', bgColor: 'bg-[#FFCCCC]' }
			case 'NORMAL':
				return { text: 'Bình thường', bgColor: 'bg-[#D1FAE5]' }
			default:
				return { text: 'Trạng thái lạ', bgColor: 'bg-[#FFF694]' }
		}
	}

	const { text: statusText, bgColor: statusBgColor } = handleExtent(detailEvent.extent)

	return (
		<div className="font-inter">
			<ReturnButton linkNavigate={`${actor === 'manager' ? '/manager' : '/nurse'}/medication-event`} />
			<div className="grid grid-cols-12 gap-10 mt-10">
				<div className="col-span-8">
					<div className="flex justify-between px-4">
						<div className="flex flex-col gap-3">
							<h1 className="font-bold text-xl">Sự kiện: {detailEvent.problem}</h1>
							<p>Thời gian: {formatDateTime(detailEvent.eventTime)}</p>
							<p>Địa điểm: {detailEvent.location}</p>
							<p>
								Phụ trách: Y tá {detailEvent.recordByUser ? detailEvent.recordByUser.fullName : 'N/A'}
							</p>
						</div>
						<p className={`${statusBgColor} px-4 py-1 rounded-2xl h-fit text-center font-bold`}>
							{statusText}
						</p>
					</div>
					<div className="flex flex-col gap-2 mt-4">
						<div className={`${statusBgColor} px-4 py-2 rounded-xl mt-4`}>
							<span className="font-bold">Mô tả: </span>
							{detailEvent.description}
						</div>
						<div className={`${statusBgColor} px-4 py-2 rounded-xl mt-2`}>
							<span className="font-bold">Xử lí: </span>
							{detailEvent.solution}
						</div>
					</div>
				</div>
				<div className="col-span-4">
					<h1 className="font-bold text-lg">Thông tin học sinh</h1>
					<div className="flex flex-col gap-2 border border-gray-300 rounded-lg p-4">
						<p>Họ và tên: {detailEvent.student.fullName}</p>
						<p>Mã số học sinh: {detailEvent.student.studentCode}</p>
						<p>Ngày sinh: {formatDate(detailEvent.student.birthday)}</p>
						<p>Giới tính: {detailEvent.student.gender}</p>
						<p>Lớp: {detailEvent.student.classCode}</p>
						<p>Ngày nhập học: {formatDate(detailEvent.student.enrollmentDate)}</p>
					</div>
					<div className="flex flex-col gap-2 mt-4">
						<h1 className="font-bold text-lg">Thông tin phụ huynh</h1>
						{getParentDisplay()}
					</div>
				</div>
			</div>
		</div>
	)
}

export default HealthEventDetail
