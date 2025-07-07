import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

export default function HealthCheckupCard({ event }) {
	const totalStudents = event.totalStudents ?? 0;
	const totalResponses = event.totalResponses ?? 0;

	return (
		<div className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition border-b cursor-pointer">
			{/* Left: Icon + Title + Created Date */}
			<div className="flex items-start gap-4 w-[40%]">
				<Activity className="text-black mt-[4px]" />
				<div className="flex flex-col">
					<p className="font-semibold text-[15px] text-black">{event.eventTitle || "Không có tiêu đề"}</p>
					<p className="text-sm text-black">Năm học: {event.schoolYear || "Không rõ"}</p>
					<p className="text-sm text-gray-500 italic">
						Ngày tạo: {event.createdAt ? dayjs(event.createdAt).format("DD/MM/YYYY") : "Không rõ"}
					</p>
				</div>
			</div>

			{/* Middle: Status Badge */}
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

			{/* Right: Response Stat + Arrow */}
			<div className="flex items-center gap-6 w-[25%] justify-end">
				<p className="text-sm italic text-black">
					Phản hồi: {totalResponses}/{totalStudents} học sinh
				</p>
				<ChevronRight className="text-black" />
			</div>
		</div>
	);
}