import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from 'react-router-dom'

export default function HealthCheckupCard({ event }) {
	const totalStudents = event.totalStudents ?? 0;
	const totalResponses = event.totalResponses ?? 0;
	const navigate = useNavigate();

	return (
		<div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition border-b cursor-pointer">
			<div className="flex items-start gap-4 w-[40%]">
				<Activity className="text-black mt-[4px]" />
				<div className="flex flex-col">
					<p className="font-semibold text-[15px] text-black">{event.eventTitle || "Không có tiêu đề"}</p>
					<p className="text-sm text-black">Năm học: {event.schoolYear || "Không rõ"}</p>
					<p className="text-sm text-gray-500 italic">
						Ngày tạo: {
						event.createdAt
							? dayjs(new Date(event.createdAt[0], event.createdAt[1] - 1, event.createdAt[2], event.createdAt[3], event.createdAt[4])).format("DD/MM/YYYY")
							: "Không rõ"
					}
					</p>
				</div>
			</div>

			<div className="w-[25%] flex justify-center">
				<span className="bg-[#E5F0FA] text-[#023E73] text-sm font-semibold px-4 py-1 rounded-full">
					{event.status === "PLANNING"
						? "Đã lên lịch"
						: event.status === "ONGOING"
							? "Đang diễn ra"
							: event.status === "DONE"
								? "Đã hoàn thành"
								: "Không xác định"}
				</span>
			</div>

			<div className="flex items-center gap-6 w-[25%] justify-end">
				<p className="text-sm italic text-black">
					Phản hồi: {totalResponses}/{totalStudents} học sinh
				</p>
				<div
					className="cursor-pointer"
					onClick={() => navigate(`/nurse/health-checkup/${event.id}`)}
				>
					<ChevronRight className="text-black hover:scale-110 transition-transform" />
				</div>
			</div>
		</div>
	);
}