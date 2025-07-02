// Không đổi logic – chỉ đổi UI
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users2, AlertCircle, Package } from "lucide-react";
import { Input } from "antd";
import { useQuery, useQueries } from "@tanstack/react-query";
import api from "../../../../utils/api";
import Loading from "../../../../components/Loading";
import MedicationRequestList from "./MedicationRequestList";

const MedicationRequestPending = () => {
	const navigate = useNavigate();
	const [currentStatus, setCurrentStatus] = useState("PENDING");
	const [search, setSearch] = useState("");

	const buttons = [
		{ label: "Chờ duyệt", value: "PENDING", route: "/nurse/medication-request/pending" },
		{ label: "Phát thuốc", value: "APPROVED", route: "/nurse/medication-request/approved" },
		{ label: "Tất cả", value: "ALL", route: "/nurse/medication-request/all" },
	];

	const { data: user, isLoading: userLoading } = useQuery({
		queryKey: ["me"],
		queryFn: async () => {
			const res = await api.get("/me");
			return res.data;
		},
	});

	const { data: requests = [], isLoading: requestsLoading } = useQuery({
		queryKey: ["pending-medication-requests"],
		queryFn: async () => {
			const res = await api.get("/medication-requests/pending");
			return res.data;
		},
		enabled: !!user,
	});

	const [{ data: stats, isLoading: statsLoading }] = useQueries({
		queries: [
			{
				queryKey: ["medication-request-stats"],
				queryFn: async () => {
					const res = await api.get("/medication-requests/stats");
					return res.data;
				},
			},
		],
	});

	const filteredRequests = requests.filter((req) =>
		req.student?.fullName?.toLowerCase().includes(search.toLowerCase())
	);

	if (userLoading || requestsLoading) return <Loading />;

	return (
		<>
			<div className="mt-6 mb-12 flex justify-center gap-12 font-inter">
				{[
					{ label: "Tổng số đơn", icon: <Package />, value: stats?.total ?? 0, note: "toàn trường" },
					{ label: "Đang xử lí", icon: <Users2 />, value: stats?.processing ?? 0, note: "đơn thuốc" },
					{ label: "Đã huỷ", icon: <AlertCircle />, value: stats?.cancelled ?? 0, note: "đơn thuốc" },
				].map((item, i) => (
					<div key={i} className="bg-[#DEEDFA] px-6 py-4 rounded-xl w-[280px]">
						<div className="flex justify-between items-center mb-1">
							<p className="font-semibold text-[15px]">{item.label}</p>
							{item.icon}
						</div>
						<p className="text-2xl font-bold">{item.value}</p>
						<p className="text-sm italic text-gray-500">{item.note}</p>
					</div>
				))}
			</div>

			<div className="flex justify-between items-center px-[120px] mb-6 font-inter">
				<Input
					style={{ width: 300 }}
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
					placeholder="Nhập mã số hoặc tên học sinh"
					className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
					allowClear
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<div className="flex gap-2">
					{buttons.map((btn) => (
						<button
							key={btn.value}
							onClick={() => navigate(btn.route)}
							className={`px-4 py-2 rounded-md font-semibold ${
								currentStatus === btn.value
									? "bg-[#023E73] text-white"
									: "bg-white text-black"
							}`}
						>
							{btn.label}
						</button>
					))}
				</div>
			</div>

			<MedicationRequestList data={filteredRequests} />
		</>
	);
};

export default MedicationRequestPending;
