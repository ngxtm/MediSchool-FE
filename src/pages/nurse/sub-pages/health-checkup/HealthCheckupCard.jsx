import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function HealthCheckupCard({ event }) {
	const navigate = useNavigate();
	const totalStudents = event.totalStudents ?? 0;
	const totalResponses = event.totalResponses ?? 0;

	const createdDate = event.createdAt
		? dayjs(new Date(
			event.createdAt[0],
			event.createdAt[1] - 1,
			event.createdAt[2],
			event.createdAt[3],
			event.createdAt[4]
		)).format("DD/MM/YYYY")
		: "Không rõ";

	const statusLabel = event.status === "PLANNING"
		? "Đã lên lịch"
		: event.status === "ONGOING"
			? "Đang diễn ra"
			: event.status === "DONE"
				? "Đã hoàn thành"
				: "Không xác định";

	return (
		<div
			className="flex items-center justify-between px-6 py-4 border-b hover:bg-gray-50 cursor-pointer w-full max-w-[1000px] mx-auto"
			onClick={() => navigate(`/nurse/health-checkup/${event.id}`)}
		>
		<div className="flex items-center justify-between items-start gap-5 py-3">
				<div className="p-2">
					<Activity size={30} />
				</div>
				<div className="flex flex-col gap-2">
					<p className="font-bold text-black text-lg">
						{event.eventTitle || "Không có tiêu đề"}
					</p>
					<p className="text-md text-gray-800">Năm học: {event.schoolYear || "Không rõ"}</p>
					<p className="text-md text-gray-500 italic">Ngày tạo: {createdDate}</p>
				</div>
			</div>

			<div className="flex items-center gap-10">
				<div className="flex flex-col items-center text-right gap-2">
					<span className="bg-[#E5F0FA] text-[#023E73] text-md font-semibold px-4 py-1 rounded-full mb-1">
						{statusLabel}
					</span>
					<p className="text-md italic text-black">
						Phản hồi: {totalResponses}/{totalStudents} học sinh
					</p>
				</div>
				<ChevronRight className="text-black hover:scale-110 transition-transform" />
			</div>
		</div>
	);
}