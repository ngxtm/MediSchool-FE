import { useParams } from 'react-router-dom'
import api from '../../../../utils/api'
import { useQuery } from '@tanstack/react-query'
import ReturnButton from '../../../../components/ReturnButton'
import { formatDate } from '../../../../utils/dateparse'
import Loading from '../../../../components/Loading'

const ConsentDetail = () => {
	const { consentId } = useParams()

	const {
		data: vaccineConsent,
		isLoading: isVaccineConsentLoading,
		isError: isVaccineConsentError,
		error: vaccineConsentError
	} = useQuery({
		queryKey: ['vaccine-consent', consentId],
		queryFn: async () => {
			const response = await api.get(`/vaccine-consents/${consentId}`)
			return response.data
		}
	})

	if (isVaccineConsentLoading) return <Loading />

	if (isVaccineConsentError) return <div>{vaccineConsentError.message}</div>

	const getConsentStatusDisplay = status => {
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

	const { text: statusText, bgColor, textColor, borderColor } = getConsentStatusDisplay(vaccineConsent?.consentStatus)

	const consentDate = formatDate(vaccineConsent?.createdAt)

	return (
		<div className="font-inter">
			<ReturnButton
				linkNavigate={`/manager/vaccination/vaccine-event/${vaccineConsent?.event?.id}/students`}
				actor="manager"
			/>
			<div className="flex justify-between mt-10 bg-gradient-to-r from-emerald-600 via-emerald-500 to-lime-400 px-10 py-8 rounded-xl shadow-sm border border-gray-100">
				<div className="flex flex-col gap-6">
					<div className="space-y-3">
						<h1 className="font-bold text-3xl text-gray-800 leading-tight">
							Chiến dịch:{' '}
							<span className="text-white">{vaccineConsent?.event?.eventTitle || 'N/A'}</span>
						</h1>
						<div className="flex items-center gap-4">
							<div
								className={`${bgColor} ${textColor} ${borderColor} font-semibold px-4 py-2 rounded-full text-sm shadow-sm border border-opacity-20 border-gray-400 transition-all duration-200 hover:shadow-md`}
							>
								{statusText}
							</div>
						</div>
					</div>

					{vaccineConsent?.note && vaccineConsent.note !== 'Không' && (
						<div className="bg-white p-4 rounded-lg border-l-4 border-[#023e73] shadow-sm">
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
