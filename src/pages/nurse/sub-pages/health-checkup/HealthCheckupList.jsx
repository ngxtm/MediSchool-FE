import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import HealthCheckupCard from "./HealthCheckupCard.jsx";
import api from "../../../../utils/api.js";
import { Search } from 'lucide-react'
import { useNavigate } from "react-router-dom";

export default function HealthCheckupList() {
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	const statusOrder = {
		PENDING: 1,
		APPROVED: 2,
		COMPLETED: 3,
		REJECTED: 4
	};

	const { data: eventsRaw, isLoading } = useQuery({
		queryKey: ["checkup-events"],
		queryFn: async () => (await api.get("/health-checkup")).data,
	});

	const events = Array.isArray(eventsRaw) ? eventsRaw : eventsRaw?.data ?? [];

	const normalizedSearch = search.toLowerCase();
	const filtered = (events ?? []).filter((e) =>
		(e.eventTitle ?? "").toLowerCase().includes(normalizedSearch)
	);

	return (
		<div>
			<div className="flex items-center justify-between px-6 py-4 w-full max-w-[1200px] mx-auto">
				<div className="relative w-[400px]">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
					<input
						type="text"
						placeholder="Tìm kiếm đợt khám sức khoẻ"
						className="pl-9 pr-4 py-3 border rounded-md w-full text-md"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>
				</div>

				<div className="flex gap-4">
					<button
						onClick={() => navigate("/nurse/checkup-categories")}
						className="bg-[#023E73] text-white font-semibold px-5 py-3 rounded-xl text-m rounded-lg hover:bg-[#034a8a]">
						Xem danh sách Hạng mục
					</button>
					<button
						onClick={() => navigate("/nurse/health-checkup/create")}
						className="flex items-center gap-2 bg-[#023E73] hover:bg-[#034a8a] text-white font-semibold px-4 py-2 rounded-lg"
					>
						Tạo lịch khám mới
					</button>
				</div>
			</div>

			<div>
				{
					isLoading ? (
						<p className="text-center py-10">Đang tải danh sách...</p>
					) : filtered.length === 0 ? (
						<p className="text-center py-10">Không tìm thấy sự kiện phù hợp.</p>
					) : (
						filtered
							.sort((a, b) => statusOrder[a.status] - statusOrder[b.status])
							.map((event) => (
								<HealthCheckupCard key={event.id} event={event} />
							))
					)
				}
			</div>
		</div>
	);
}