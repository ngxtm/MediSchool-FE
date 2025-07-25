import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import { useQuery } from '@tanstack/react-query';
import api from '@/utils/api';

export function useCheckupStats(eventId) {
	return useQuery({
		queryKey: ['checkup-stats', eventId],
		queryFn: () =>
			api.get(`/health-checkup/${eventId}/stats`).then((res) => res.data),
		enabled: !!eventId,
	});
}

export default function ManagerHealthCheckupCard({ event }) {
	const navigate = useNavigate();
	const { data: stats } = useCheckupStats(event.id);

	const totalStudents = stats?.totalStudents ?? 0;
	const totalReplied = stats?.totalReplied ?? 0;

	const createdDate = event.createdAt
		? dayjs(new Date(
			event.createdAt[0],
			event.createdAt[1] - 1,
			event.createdAt[2],
			event.createdAt[3],
			event.createdAt[4]
		)).format("DD/MM/YYYY")
		: "Không rõ";

	const status = event.status === "PENDING"
		? "Chờ duyệt"
		: event.status === "APPROVED"
			? "Đã lên lịch"
			: event.status === "COMPLETED"
				? "Hoàn thành"
				: "Đã hủy";

	const statusColorClass = event.status === "PENDING"
		? "bg-gray-200 text-gray-700"
		: event.status === "APPROVED"
			? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
			: event.status === "COMPLETED"
				? "bg-green-100 text-green-700"
				: "bg-red-100 text-red-700";

	return (
		<div
			className="flex items-center justify-between px-6 py-4 border-b hover:bg-gray-100 cursor-pointer w-full max-w-[1200px] mx-auto"
			onClick={() => navigate(`/manager/health-checkup/${event.id}`)}
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
					<span className={`${statusColorClass} text-md font-semibold px-4 py-1 rounded-full mb-1`}>
						{status}
					</span>
					<p className="text-md italic text-black">
						Phản hồi: {totalReplied}/{totalStudents} học sinh
					</p>
				</div>
				<ChevronRight className="text-black hover:scale-110 transition-transform" />
			</div>
		</div>
	);
}