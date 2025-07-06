import ReturnButton from '../../../../components/ReturnButton'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import api from '../../../../utils/api'
import Loading from '../../../../components/Loading'
import { CircleAlert, CircleCheckBig, CircleX, FileText } from 'lucide-react'

const VaccineEventDetail = () => {
	const navigate = useNavigate()
	const paddingCustomBlue = 'bg-[#DAEAF7] py-3 px-6 rounded-lg flex flex-row justify-between'
	const paddingCustom = 'p-6 rounded-lg flex flex-row justify-between'
	const { id } = useParams()

	const [
		{ data: vaccineEvent, isLoading: isVaccineEventLoading, isError: isVaccineEventError },
		{ data: vaccineEventConsent, isLoading: isConsentLoading }
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
				queryKey: ['vaccine-event', id, 'consent'],
				retry: false,
				queryFn: async () => {
					const response = await api.get(`/vaccine-consents/event/${id}/results`)
					return response.data
				}
			}
		]
	})

	const isLoading = isVaccineEventLoading || isConsentLoading
	const isError = isVaccineEventError

	if (isLoading) {
		return <Loading bgColor="#00bc92" />
	}

	if (isError) {
		return <div>Error fetching api & load data</div>
	}

	const formatDate = input => {
		if (!input) return ''

		let date
		if (Array.isArray(input)) {
			const [y, m, d, hh = 0, mm = 0, ss = 0] = input
			date = new Date(y, m - 1, d, hh, mm, ss)
		} else {
			date = new Date(input)
		}

		return date.toLocaleDateString('vi-VN')
	}

	const getStatusDisplay = (status, date) => {
		if (!status)
			return {
				text: 'Lỗi trạng thái',
				bgColor: 'bg-[#FFF694]',
				textColor: 'text-yellow-800',
				borderColor: 'border-yellow-800'
			}

		switch (status.toUpperCase()) {
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

	const {
		text: statusText,
		bgColor,
		textColor,
		borderColor
	} = getStatusDisplay(vaccineEvent?.status, vaccineEvent?.event_date)

	const getStatusEventDisplay = status => {
		if (!status)
			return {
				text: 'Lỗi trạng thái',
				bgColor: 'bg-[#FFAEAF]',
				icon: <CircleAlert />
			}

		switch (status.toUpperCase()) {
			case 'APPROVED':
				return {
					text: 'Đơn đề nghị đã được duyệt',
					bgColor: 'bg-[#C1DF8E]',
					icon: <CircleCheckBig />
				}
			case 'PENDING':
				return {
					text: 'Đơn đề nghị đang chờ duyệt',
					bgColor: 'bg-[#FFF694]',
					icon: <CircleAlert />
				}
			case 'CANCELLED':
				return {
					text: 'Đơn đề nghị đã bị hủy',
					bgColor: 'bg-[#FFAEAF]',
					icon: <CircleX />
				}
			case 'COMPLETED':
				return {
					text: 'Đơn đề nghị đã hoàn thành',
					bgColor: 'bg-[#DAEAF7]',
					icon: <CircleCheckBig />
				}
			default:
				return {
					text: 'Trạng thái lạ',
					bgColor: 'bg-[#D9D9D9]',
					icon: <CircleAlert />
				}
		}
	}

	const { text: statusEventText, bgColor: statusEventBgColor, icon } = getStatusEventDisplay(vaccineEvent?.status)

	return (
		<div className="font-inter">
			<style>
				{`
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
					}`}
			</style>
			<ReturnButton linkNavigate={'/manager/vaccination'} actor="manager" />
			<div className="grid grid-cols-12 gap-20 mt-10">
				<div className="col-span-5">
					<div className="flex flex-col gap-4">
						<h1 className="font-bold text-2xl">Chiến dịch: {vaccineEvent?.eventTitle || 'N/A'}</h1>
						<p
							className={`text-center border-1 ${borderColor} ${bgColor} ${textColor} font-bold px-6 py-1 w-fit rounded-lg`}
						>
							{statusText}
						</p>
					</div>
					<div className="mt-10">
						<h1 className="font-bold text-xl mb-6">Thông tin chung</h1>
						<div className={`${paddingCustomBlue} bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
							<p className="font-semibold">Vaccine</p>
							<p>{vaccineEvent?.vaccine?.name || 'N/A'}</p>
						</div>
						<div className={`${paddingCustom}`}>
							<p className="font-semibold">Đối tượng</p>
							<p>{vaccineEvent?.event_scope === 'SCHOOL' ? 'Toàn trường' : 'Theo lớp'}</p>
						</div>
						<div className={`${paddingCustomBlue} bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
							<p className="font-semibold">Địa điểm</p>
							<p>{vaccineEvent?.location || 'N/A'}</p>
						</div>
						<div className={`${paddingCustom}`}>
							<p className="font-semibold">Ngày tạo sự kiện</p>
							<p>{formatDate(vaccineEvent?.createdAt || 'N/A')}</p>
						</div>
						<div className={`${paddingCustomBlue} bg-gradient-to-r from-teal-500 to-teal-600 text-white`}>
							<p className="font-semibold">Phụ trách</p>
							<p>{vaccineEvent?.createdBy?.fullName || 'N/A'}</p>
						</div>
					</div>
				</div>
				<div className="col-span-6 col-start-7">
					<div className="flex gap-4 items-center justify-center px-16 rounded-lg">
						<div
							className={`${statusEventBgColor} border-1 ${borderColor} min-h-[50px] flex items-center gap-2 px-12 py-3 rounded-lg`}
						>
							{icon}
							<p className="font-semibold">{statusEventText}</p>
						</div>
					</div>
					<div className="flex flex-col gap-6 px-10 py-[66px]">
						<h1 className="font-bold text-xl">Mức độ phản hồi</h1>
						<div className="grid auto-rows-auto grid-cols-2 gap-4">
							<div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex flex-col gap-5 px-10 py-4">
								<div className="flex justify-between ">
									<p className="font-semibold">Đã gửi</p>
									<FileText />
								</div>
								<p className="font-semibold text-2xl italic">
									{vaccineEventConsent?.totalConsents ?? 'N/A'}
								</p>
							</div>
							<div className="bg-gradient-to-r from-emerald-100 to-emerald-200 rounded-xl flex flex-col gap-5 px-10 py-4">
								<div className="flex justify-between">
									<p className="font-semibold">Đã phản hồi</p>
									<CircleCheckBig />
								</div>
								<p className="font-semibold text-2xl italic">
									{vaccineEventConsent?.respondedConsents ?? 'N/A'}
								</p>
							</div>
							<div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex flex-col gap-5 px-10 py-4">
								<div className="flex justify-between ">
									<p className="font-semibold">Chưa phản hồi</p>
									<CircleAlert />
								</div>
								<p className="font-semibold text-2xl italic">
									{vaccineEventConsent?.pendingConsents ?? 'N/A'}
								</p>
							</div>
							<div className="bg-gradient-to-r from-red-100 to-red-200 rounded-xl flex flex-col gap-5 px-10 py-4">
								<div className="flex justify-between">
									<p className="font-semibold">Từ chối</p>
									<CircleX />
								</div>
								<p className="font-semibold text-2xl italic">
									{vaccineEventConsent?.rejectedConsents ?? 'N/A'}
								</p>
							</div>
							<button
								onClick={() => navigate(`students`)}
								className="rounded-lg text-white bg-teal-600 px-6 py-2 w-full font-semibold mt-8 transition-all duration-200 ease-in-out hover:bg-teal-700 hover:scale-105 hover:shadow-lg active:scale-95"
							>
								Xem danh sách đơn
							</button>
							<button
								onClick={() => navigate(`records`)}
								className="rounded-lg hover:border-1 hover:border-gray-500 bg-[#F5F5F5] px-6 py-2 w-full font-semibold mt-8 transition-all duration-150 ease-in-out hover:bg-[#f5f5f5a5] hover:scale-105 hover:shadow-lg active:scale-95"
							>
								Xem hồ sơ tiêm chủng
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default VaccineEventDetail
