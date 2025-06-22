import { useParams } from "react-router-dom";
import ReturnButton from "../../../components/ReturnButton";
import { useQueries } from "@tanstack/react-query";
import api from "../../../utils/api";
import Loading from "../../../components/Loading";
import { ChevronRight, Search } from "lucide-react";
import { useState } from "react";
import { Input, Table, Select } from "antd";

const StudentListInEvent = () => {
	const { id } = useParams();
	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("Tất cả");

	const [
		{
			data: vaccineEvent,
			isLoading: isVaccineEventLoading,
			isError: isVaccineEventError,
		},
		{
			data: studentsList,
			isLoading: isStudentsListLoading,
			isError: isStudentsListError,
		},
	] = useQueries({
		queries: [
			{
				queryKey: ["vaccine-event", id],
				queryFn: async () => {
					const response = await api.get(`/vaccine-events/${id}`);
					return response.data;
				},
			},
			{
				queryKey: ["vaccine-consent", id, "students"],
				retry: false,
				queryFn: async () => {
					const response = await api.get(`/vaccine-consents/${id}/students`);
					return response.data;
				},
			},
		],
	});

	const statusMap = {
		"Chấp thuận": "APPROVE",
		"Từ chối": "REJECT",
		"Chưa phản hồi": null,
	};

	const safeStudentsList = Array.isArray(studentsList) ? studentsList : [];

	const filteredStudentList = safeStudentsList.filter((s) => {
		const matchesSearch =
			(s.studentName ?? "").toLowerCase().includes(search.toLowerCase()) ||
			(s.parentName ?? "").toLowerCase().includes(search.toLowerCase());

		const matchesStatus =
			statusFilter === "Tất cả"
				? true
				: statusFilter === "Chưa phản hồi"
				? s.status == null
				: s.status?.toUpperCase() === statusMap[statusFilter];

		return matchesSearch && matchesStatus;
	});

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 10,
		showSizeChanger: true,
		showQuickJumper: true,
	});

	const getStatusDisplay = (status) => {
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

	if (isVaccineEventLoading || isStudentsListLoading) {
		return <Loading />;
	}

	// if (isVaccineEventError || isStudentsListError) {
	// 	return <div>Error fetching api & load data</div>;
	// }

	const columns = [
		{
			title: "Học sinh",
			dataIndex: "studentName",
			key: "studentName",
			align: "center",
			width: 180,
			render: (text) => <span className="font-semibold">{text}</span>,
		},
		{
			title: "Lớp",
			dataIndex: "classCode",
			key: "classCode",
			align: "center",
			width: 180,
			onHeaderCell: () => ({ style: { fontWeight: "bold" } }),
		},
		{
			title: "Bố-Mẹ / Người giám hộ",
			dataIndex: "parentName",
			key: "parent",
			width: 180,
			align: "center",
			render: (text) => <span className="font-semibold">{text}</span>,
		},
		{
			title: "Thông tin liên lạc",
			dataIndex: "contact",
			key: "contact",
			align: "center",
			width: 180,
			render: (_, record) => (
				<div className="flex flex-col items-center leading-5">
					<span>{record.email}</span>
					<span>{record.phoneNumber}</span>
				</div>
			),
		},
		{
			title: "Trạng thái",
			dataIndex: "status",
			key: "status",
			align: "center",
			width: 180,
			render: (_, record) => {
				const result = getStatusDisplay(record.status);
				return (
					<p
						className={`flex justify-center items-center mx-auto ${result.bgColor} font-bold px-9 py-1 w-fit rounded-4xl`}
					>
						{result.text}
					</p>
				);
			},
		},
		{
			title: "",
			key: "action",
			align: "center",
			width: 50,
			render: () => {
				return (
					<button
						className="flex items-center justify-center w-8 h-8 rounded-full text-[#023E73] hover:text-white hover:bg-[#023E73] transition-colors duration-200"
					>
						<ChevronRight size={20} />
					</button>
				);
			},
		},
	];

	return (
		<div className="font-inter">
			<ReturnButton linkNavigate={`/nurse/vaccine-event/${id}`} />
			<div>
				<div className="flex flex-col mt-10 gap-4 px-10">
					<h1 className="font-bold text-2xl">
						Chiến dịch: {vaccineEvent?.eventTitle || "N/A"}
					</h1>
					<p
						className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}
					>
						{statusText}
					</p>
				</div>
			</div>
			<div className="flex items-center gap-4 px-10 justify-between">
				<Input
					prefix={<Search size={16} className="text-gray-400 mr-4" />}
					placeholder="Tìm kiếm học sinh hoặc phụ huynh"
					style={{ width: 350 }}
					className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
					allowClear
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				<div>
					<div className="flex items-center gap-4">
						<p className="font-medium">Trạng thái</p>
						<Select
							value={statusFilter}
							onChange={(value) => setStatusFilter(value)}
							size="middle"
							style={{ width: 180 }}
							options={[
								{ value: "Tất cả", label: "Tất cả" },
								{ value: "Chấp thuận", label: "Chấp thuận" },
								{ value: "Từ chối", label: "Từ chối" },
								{ value: "Chưa phản hồi", label: "Chưa phản hồi" },
							]}
						/>
					</div>
				</div>
				<div className="flex gap-4 my-6">
					<button className="bg-[#023E73] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#01294d] active:scale-95 transition-all">
						Gửi lời nhắc
					</button>
					<button className="bg-[#023E73] text-white font-semibold px-6 py-2 rounded-md hover:bg-[#01294d] active:scale-95 transition-all">
						Xuất PDF
					</button>
				</div>
			</div>

			<Table
				columns={columns}
				dataSource={filteredStudentList}
				loading={isStudentsListLoading}
				onChange={(pagination) => setPagination(pagination)}
				pagination={pagination}
				rowKey="vaccineId"
			/>
		</div>
	);
};

export default StudentListInEvent;
