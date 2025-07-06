import { useParams } from 'react-router-dom'
import api from '../../../../utils/api'
import { useQuery } from '@tanstack/react-query'
import ReturnButton from '../../../../components/ReturnButton'
import { formatDate } from '../../../../utils/dateparse'
import Loading from '../../../../components/Loading'

const ConsentDetail = ({ actor }) => {
	const { consentId } = useParams()

	const {
		data: vaccineConsent,
		isLoading: isVaccineConsentLoading,
		isError: isVaccineConsentError
	} = useQuery({
		queryKey: ['vaccine-consent', consentId],
		queryFn: async () => {
			const response = await api.get(`/vaccine-consents/${consentId}`)
			return response.data
		}
	})

	if (isVaccineConsentLoading) return <Loading />

	if (isVaccineConsentError) return <div>Error fetching api & load data</div>

	const getStatusDisplayEvent = status => {
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

	const { text: statusText, bgColor } = getStatusDisplayEvent(vaccineConsent?.consentStatus)

	const consentDate = formatDate(vaccineConsent?.createdAt)

	const borderColorNote = status => {
		if (status === 'APPROVE') return 'border-[#023e73]'
		if (status === 'REJECT') return 'border-red-700'
		return 'border-gray-300'
	}

	return (
		<div className="font-inter">
			<ReturnButton
				linkNavigate={`${actor === 'manager' ? '/manager' : '/nurse'}/vaccination/vaccine-event/${
					vaccineConsent?.event?.id
				}/students`}
			/>
			<div className="flex justify-between mt-10 bg-gradient-to-r from-[#F8FAFC] to-[#F1F5F9] px-10 py-8 rounded-xl shadow-sm border border-gray-100">
				<div className="flex flex-col gap-6">
					<div className="space-y-3">
						<h1 className="font-bold text-3xl text-gray-800 leading-tight">
							Chiến dịch: <span className="text-[#023e73]">{vaccineConsent?.event?.eventTitle || 'N/A'}</span>
						</h1>
						<div className="flex items-center gap-4">
							<div className={`${bgColor} font-semibold px-4 py-2 rounded-full text-sm shadow-sm border border-opacity-20 border-gray-400 transition-all duration-200 hover:shadow-md`}>
								{statusText}
							</div>
						</div>
					</div>
					
					{vaccineConsent?.note && vaccineConsent.note !== 'Không' && (
						<div className={`bg-white p-4 rounded-lg border-l-4 ${borderColorNote(vaccineConsent?.consentStatus)} shadow-sm`}>
							<h3 className="font-semibold text-gray-700 mb-2">Ghi chú từ phụ huynh:</h3>
							<p className="text-gray-600 italic leading-relaxed">"{vaccineConsent.note}"</p>
						</div>
					)}
				</div>
				<div className="flex flex-col justify-center items-center gap-4">
					<p>Ngày tạo đơn: {consentDate}</p>
					<p>Phụ trách: Y tá {vaccineConsent?.event?.createdBy?.fullName ?? 'N/A'}</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-56 mt-10">
				<div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4">
					<h1 className="font-bold text-2xl">Thông tin học sinh</h1>
					<p>Họ và tên: {vaccineConsent?.student?.fullName}</p>
					<p>Mã số học sinh: {vaccineConsent?.student?.studentId}</p>
					<p>Ngày tháng năm sinh: {formatDate(vaccineConsent?.student?.dateOfBirth)}</p>
					<p>Giới tính: {vaccineConsent?.student?.gender}</p>
					<p>Lớp: {vaccineConsent?.student?.classCode}</p>
				</div>
				<div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4 h-fit">
					<h1 className="font-bold text-2xl">Thông tin phụ huynh</h1>
					<p>Họ và tên: {vaccineConsent?.parent?.fullName}</p>
					<p>Email: {vaccineConsent?.parent?.email}</p>
					<p>Số điện thoại: {vaccineConsent?.parent?.phone}</p>
				</div>
			</div>
		</div>
	)
}

export default ConsentDetail
