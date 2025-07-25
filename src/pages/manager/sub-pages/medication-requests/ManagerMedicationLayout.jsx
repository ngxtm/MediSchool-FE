import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Input } from "antd";
import { Search, Users2, AlertCircle, Package } from "lucide-react";
import { useQuery, useQueries } from "@tanstack/react-query";
import api from "../../../../utils/api.js";
import Loading from "../../../../components/Loading.jsx";
import { useEffect, useState } from "react";

export default function ManagerMedicationLayout() {
	const navigate = useNavigate();
	const location = useLocation();
	const [search, setSearch] = useState("");

	const basePath = "manager";
	const isDetailPage = /^\/manager\/medication-requests\/\d+$/.test(location.pathname);

	useEffect(() => {
		if (/^\/manager\/medication-requests\/?$/.test(location.pathname)) {
			navigate(`/manager/medication-requests/pending`, { replace: true });
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
					<div className="flex max-w-full justify-center gap-x-10 mb-12 mt-6">
						{[
							{ label: "Tổng số đơn", icon: <Package />, value: stats?.total ?? 0, note: "toàn trường" },
							{ label: "Chờ duyệt", icon: <Users2 />, value: stats?.pending ?? 0, note: "đơn thuốc" },
							{ label: "Đang xử lí", icon: <Users2 />, value: stats?.approved ?? 0, note: "đơn thuốc" },
							{ label: "Đã huỷ", icon: <AlertCircle />, value: stats?.rejected ?? 0, note: "đơn thuốc" },
						].map((item, i) => (
							<div key={i} className="bg-gradient-to-r from-emerald-300 to-emerald-500 px-6 py-4 rounded-xl w-[250px]">
								<div className="flex justify-between items-center mb-1">
									<p className="font-semibold text-[15px]">{item.label}</p>
									{item.icon}
								</div>
								<p className="text-2xl font-bold">{item.value}</p>
								<p className="text-sm italic text-gray-500">{item.note}</p>
							</div>
						))}
					</div>
				)
			)}

			{!isDetailPage && (
				<div className="flex px-[100px] justify-between items-center mb-6 font-inter">
					<Input
						style={{ fontFamily: "Inter", width: 300 }}
						prefix={<Search size={16} className="text-gray-400 mr-4 font-inter" />}
						placeholder="Tìm kiếm đơn thuốc"
						className="h-[38px] rounded-[8px] !border-[#d9d9d9] font-inter"
						allowClear
						value={search}
						onChange={(e) => setSearch(e.target.value)}
					/>

					<div className="flex gap-2">
						{tabButtons.map((btn) => (
							<button
								key={btn.value}
								onClick={() => navigate(`/manager/medication-requests/${btn.value}`)}
								className={`px-4 py-2 rounded-md ${
									currentTab === btn.value ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold" : "bg-white text-black"
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