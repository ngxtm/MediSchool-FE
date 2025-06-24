import { useParams } from "react-router-dom";
import api from "../../../../utils/api";
import { useQuery } from "@tanstack/react-query";
import ReturnButton from "../../../../components/ReturnButton";
import { formatDate } from "../../../../utils/dateparse";
import Loading from "../../../../components/Loading";

const ConsentDetail = () => {
	const { consentId } = useParams();

	const {
		data: vaccineConsent,
		isLoading: isVaccineConsentLoading,
		isError: isVaccineConsentError,
	} = useQuery({
		queryKey: ["vaccine-consent", consentId],
		queryFn: async () => {
			const response = await api.get(`/vaccine-consents/${consentId}`);
			return response.data;
		},
	});

	if (isVaccineConsentLoading) return <Loading />;

	if (isVaccineConsentError) return <div>Error fetching api & load data</div>;

	const getStatusDisplayEvent = (status) => {
		if (!status) return { text: "Chưa phản hồi", bgColor: "bg-[#FFF694]" };

		switch (status.toUpperCase()) {
			case "APPROVE":
				return { text: "Chấp thuận", bgColor: "bg-[#DAEAF7]" };
			case "REJECT":
				return { text: "Từ chối", bgColor: "bg-[#FFAEAF]" };
			default:
				return { text: "Trạng thái lạ", bgColor: "bg-[#FFF694]" };
		}
	};

	const { text: statusText, bgColor } = getStatusDisplayEvent(
		vaccineConsent?.consentStatus
	);

	const consentDate = formatDate(vaccineConsent?.createdAt);

	return (
		<div className="font-inter">
			<ReturnButton
				linkNavigate={`/nurse/vaccination/vaccine-event/${vaccineConsent?.event?.id}/students`}
			/>
			<div className="flex justify-between mt-10 bg-[#F5F5F5] px-10 py-5 rounded-lg">
				<div className="flex flex-col gap-4">
					<h1 className="font-bold text-2xl">
						Chiến dịch: {vaccineConsent?.event?.eventTitle || "N/A"}
					</h1>
					<p
						className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}
					>
						{statusText}
					</p>
				</div>
				<div className="flex flex-col justify-center items-center gap-4">
					<p>Ngày tạo đơn: {consentDate}</p>
					<p>
						Phụ trách: Y tá {vaccineConsent?.event?.createdBy?.fullName ?? "N/A"}
					</p>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-56 mt-10">
				<div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4">
					<h1 className="font-bold text-2xl">Thông tin học sinh</h1>
					<p>Họ và tên: {vaccineConsent?.student?.fullName}</p>
					<p>Mã số học sinh: {vaccineConsent?.student?.studentId}</p>
					<p>
						Ngày tháng năm sinh:{" "}
						{formatDate(vaccineConsent?.student?.dateOfBirth)}
					</p>
					<p>Giới tính: {vaccineConsent?.student?.gender}</p>
					<p>Lớp: {vaccineConsent?.student?.classCode}</p>
				</div>
				<div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4">
					<h1 className="font-bold text-2xl">Thông tin phụ huynh</h1>
					<p>Họ và tên: {vaccineConsent?.parent?.fullName}</p>
					<p>Email: {vaccineConsent?.parent?.email}</p>
					<p>Số điện thoại: {vaccineConsent?.parent?.phone}</p>
					<p>Ghi chú: {vaccineConsent?.note ?? "Không"}</p>
				</div>
			</div>
		</div>
	);
};

export default ConsentDetail;
