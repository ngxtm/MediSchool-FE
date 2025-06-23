import { useParams } from "react-router-dom";
import api from "../../../utils/api";
import { useQueries } from "@tanstack/react-query";
import ReturnButton from "../../../components/ReturnButton";
import { parseDate } from "../../../utils/dateparse";

const ConsentDetail = () => {
	const { eventId, consentId } = useParams();

    const [
        {
            data: vaccineEvent,
            isLoading: isVaccineEventLoading,
            isError: isVaccineEventError,
        }
    ] = useQueries({
        queries: [
            {
                queryKey: ["vaccine-event", eventId],
                queryFn: async () => {
                    const response = await api.get(`/vaccine-events/${eventId}`);
                    return response.data;
                },
            },
        ],
    });

    const getStatusDisplayEvent = (status, date) => {
		if (!status) return { text: "Lỗi trạng thái", bgColor: "bg-[#DAEAF7]" };

		switch (status.toUpperCase()) {
			case "APPROVED":
				if (date === new Date().toLocaleDateString()) {
					return { text: "Đang diễn ra", bgColor: "bg-[#DAEAF7]" };
				}
				return { text: "Đã duyệt", bgColor: "bg-[#DAEAF7]" };
			case "PENDING":
				return { text: "Chờ duyệt", bgColor: "bg-[#DAEAF7]" };
			case "CANCELLED":
				return { text: "Đã hủy", bgColor: "bg-[#FFCCCC]" };
			case "COMPLETED":
				return { text: "Hoàn thành", bgColor: "bg-[#D1FAE5]" };
			default:
				return { text: "Trạng thái lạ", bgColor: "bg-[#DAEAF7]" };
		}
	};

	const { text: statusText, bgColor } = getStatusDisplayEvent(
		vaccineEvent?.status,
		vaccineEvent?.event_date
	);

    const eventDate = parseDate(vaccineEvent?.event_date);


	return (
		<div className="font-inter">
			<ReturnButton
				linkNavigate={`/nurse/vaccine-event/${eventId}/students`}
			/>
			<div className="flex justify-between mt-10 bg-[#F5F5F5] px-10 py-5 rounded-lg">
				<div className="flex flex-col gap-4">
					<h1 className="font-bold text-2xl">
						Chiến dịch: {vaccineEvent?.eventTitle || "N/A"}
					</h1>
					<p
						className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}
					>
						{statusText}
					</p>
				</div>
                <div className="flex flex-col justify-center items-center gap-4">
                    <p>Ngày tạo đơn: 20/05/2025</p>
                    <p>Phụ trách: Y tá {vaccineEvent?.createdBy ?? "Lê Thị A"}</p>
                </div>
			</div>
            <div className="grid grid-cols-2 gap-56 mt-10">
                <div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4">
                    <h1 className="font-bold text-2xl">Thông tin học sinh</h1>
                    <p>Họ và tên: Nguyễn Văn A</p>
                    <p>Mã số học sinh: M001</p>
                    <p>Ngày tháng năm sinh: 12/05/2000</p>
                    <p>Giới tính: Nam</p>
                    <p>Lớp: 2.1</p>
                </div>
                <div className="px-10 py-5 border border-gray-300 rounded-lg flex flex-col gap-4">
                    <h1 className="font-bold text-2xl">Thông tin phụ huynh</h1>
                    <p>Họ và tên: Nguyễn Văn A</p>
                    <p>Email: email@email.com</p>
                    <p>Số điện thoại: 0123456789</p>
                    <p>Ghi chú: Không</p>
                </div>
            </div>
		</div>
	);
};

export default ConsentDetail;
