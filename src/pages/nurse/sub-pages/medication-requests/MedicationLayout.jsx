import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Input } from "antd";
import {Search, Users2, AlertCircle, Package, FileText, CheckCheck, AlertTriangle, Calendar} from "lucide-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import api from "../../../../utils/api.js";
import Loading from "../../../../components/Loading.jsx";
import { useEffect, useState } from "react";

export default function MedicationLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [search, setSearch] = useState("");

	const basePath = "nurse";
	const isDetailPage = /^\/nurse\/medication-requests\/\d+$/.test(location.pathname);

	useEffect(() => {
		if (/^\/nurse\/medication-requests\/?$/.test(location.pathname)) {
			navigate(`/nurse/medication-requests/pending`, { replace: true });
		}
	}, [location.pathname, navigate]);

	const currentTab = location.pathname.split("/").pop();

	const tabButtons = [
		{ label: "Chờ duyệt", value: "pending" },
		{ label: "Đã duyệt", value: "approved" },
		{ label: "Tất cả", value: "all" },
	];

	const { isLoading: userLoading } = useQuery({
		queryKey: ["me"],
		queryFn: async () => (await api.get("/me")).data,
	});

	const [{ data: stats, isLoading: statsLoading }] = useQueries({
		queries: [
			{
				queryKey: ["medication-requests-stats"],
				queryFn: async () => (await api.get("/medication-requests/stats")).data,
			},
		],
	});

	if (userLoading) return <Loading />;

	return (
		<div className="font-inter pb-20">
			{!isDetailPage && (
				statsLoading ? (
					<div className="text-center py-10 text-gray-500">Đang tải thống kê...</div>
				) : (
					<div className="grid grid-cols-4 gap-15 mb-8">
					{[
						{ label: "Tổng số đơn", icon: <Package />, value: stats?.total ?? 0, note: "toàn trường" },
						{ label: "Chờ duyệt", icon: <Users2 />, value: stats?.pending ?? 0, note: "đơn thuốc" },
						{ label: "Đang xử lí", icon: <Users2 />, value: stats?.approved ?? 0, note: "đơn thuốc" },
						{ label: "Đã huỷ", icon: <AlertCircle />, value: stats?.rejected ?? 0, note: "đơn thuốc" },
					].map((item, i) => (
						<div key={i} className="bg-[#DEEDFA] px-6 py-5 rounded-xl">
							<div className="flex justify-between items-center mb-1">
								<p className="font-semibold">{item.label}</p>
								{item.icon}
							</div>
							<p className="text-2xl font-bold">{item.value}</p>
							<p className="text-sm italic text-gray-500">{item.note}</p>
						</div>
					))}
				</div>
			))}

			{!isDetailPage && (
				<div className="flex px-[100px] justify-between items-center mb-6 font-inter">
					<div className="relative w-[400px]">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
						<input
							type="text"
							placeholder="Tìm kiếm đơn thuốc"
							className="pl-9 pr-4 py-3 border rounded-md w-full text-md"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div className="flex gap-2">
						{tabButtons.map((btn) => (
							<button
								key={btn.value}
								onClick={() => navigate(`/nurse/medication-requests/${btn.value}`)}
								className={`px-4 py-2 rounded-md ${
									currentTab === btn.value ? "bg-[#023E73] text-white font-bold" : "bg-white text-black"
								}`}
							>
								{btn.label}
							</button>
						))}
					</div>
				</div>
			)}

			<Outlet context={{ search }} />
		</div>
	);
}