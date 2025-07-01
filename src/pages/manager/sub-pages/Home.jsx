import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, CircleCheckBig, CircleAlert, Calendar } from "lucide-react";
import api from "../../../utils/api";
import Loading from "../../../components/Loading";
import DetailBox from "../../nurse/components/DetailBox";
import { formatDate } from "../../../utils/dateparse";
import { useState } from "react";
import { Table } from "antd";
import successToast, { errorToast } from "../../../components/ToastPopup";
import RejectReasonModal from "../../../components/RejectReasonModal";

const Home = () => {
	const queryClient = useQueryClient();

	const approveEvent = useMutation({
		mutationFn: async (eventId) => {
			return api.put(`/vaccine-events/${eventId}/status`, null, {
				params: { status: "APPROVED" },
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["vaccine-event"]);
			toastSuccessPopup("Duyệt sự kiện thành công");
		},
		onError: () => {
			toastErrorPopup("Duyệt sự kiện thất bại. Vui lòng thử lại");
		},
	});

	const rejectEvent = useMutation({
		mutationFn: async ({ eventId, reason }) => {
			return api.put(`/vaccine-events/${eventId}/status`, null, {
				params: { 
					status: "CANCELLED",
					rejectionReason: reason
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries(["vaccine-event"]);
			toastSuccessPopup("Từ chối sự kiện thành công");
			setRejectModalOpen(false);
			setSelectedEvent(null);
		},
		onError: () => {
			toastErrorPopup("Từ chối sự kiện thất bại. Vui lòng thử lại");
		},
	});

	const toastSuccessPopup = successToast;

	const toastErrorPopup = errorToast;

	const [pagination, setPagination] = useState({
		current: 1,
		pageSize: 5,
		showSizeChanger: true,
		showQuickJumper: true,
	});

	const [rejectModalOpen, setRejectModalOpen] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState(null);

	const handleRejectClick = (event) => {
		setSelectedEvent(event);
		setRejectModalOpen(true);
	};

	const handleRejectConfirm = (reason) => {
		if (selectedEvent) {
			rejectEvent.mutate({ eventId: selectedEvent.id, reason });
		}
	};

	const results = useQueries({
		queries: [
			{
				queryKey: ["consent-total"],
				queryFn: async () => {
					const response = await api.get("/vaccine-consents");
					return response.data;
				},
			},
			{
				queryKey: ["upcoming-vaccine-events"],
				queryFn: async () => {
					const response = await api.get("/vaccine-events/upcoming");
					return response.data;
				},
			},
			{
				queryKey: ["vaccine-event"],
				queryFn: async () => {
					const response = await api.get("/vaccine-events");
					return response.data;
				},
			},
		],
	});

	const eventsData = results[2]?.data ?? [];

	const classQueries = useQueries({
		queries: eventsData.map((event) => ({
			queryKey: ["class-in-event", event.id],
			queryFn: async () => {
				const response = await api.get(`vaccine-event-class/${event.id}`);
				return response.data.map((item) => item.classCode);
			},
			enabled: event.eventScope !== "SCHOOL",
		})),
	});

	const isLoading =
		results.some((result) => result.isLoading) ||
		classQueries.some((q) => q.isLoading);
	const isError = results.some((result) => result.isError);
	if (isLoading) {
		return <Loading />;
	}

	if (isError) {
		return <div>Error loading data</div>;
	}

	const [consentTotal, upcomingEvents, events] = results.map(
		(result) => result.data
	);

	const filteredEvent = () => {
		return events.filter((event) => event.status === "PENDING");
	};

	const handleScope = (event) => {
		if (event.eventScope === "SCHOOL") {
			return "Toàn trường";
		}

		const idx = events.findIndex((e) => e.id === event.id);
		const data = classQueries[idx]?.data;

		if (!data) return "Đang tải...";
		return data.join(", ");
	};

	const columns = [
		{
			title: "Tên sự kiện",
			dataIndex: "eventTitle",
			key: "eventTitle",
			align: "center",
			width: 180,
			render: (text) => {
				return <span className="font-semibold font-inter">{text}</span>;
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "Vaccine",
			dataIndex: "vaccine",
			key: "vaccine",
			align: "center",
			width: 180,
			render: (_, record) => {
				return (
					<span className="font-semibold font-inter">
						{record.vaccine.name}
					</span>
				);
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "Địa điểm",
			dataIndex: "location",
			key: "location",
			align: "center",
			width: 180,
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "Phạm vi tiêm chủng",
			dataIndex: "scope",
			key: "scope",
			align: "center",
			width: 180,
			render: (_, record) => {
				return <span className="font-semibold">{handleScope(record)}</span>;
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "Y tá",
			dataIndex: "createdBy",
			key: "createdBy",
			align: "center",
			width: 180,
			render: (_, record) => {
				return (
					<span className="font-semibold font-inter">
						{" "}
						{record.createdBy?.fullName || "Chưa có"}
					</span>
				);
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "Ngày tạo đơn",
			dataIndex: "createdAt",
			key: "createdAt",
			align: "center",
			width: 180,
			render: (_, record) => {
				return (
					<span className="font-semibold">{formatDate(record.createdAt)}</span>
				);
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
		{
			title: "",
			key: "action",
			align: "center",
			width: 50,
			render: (_, record) => {
				return (
					<div className="flex flex-col gap-2">
						<button
							onClick={() => approveEvent.mutate(record.id)}
							className="font-semibold text-white bg-[#023E73] px-4 py-0.5 rounded-lg cursor-pointer hover:bg-[#023E73]/80 transition-colors duration-200"
						>
							Duyệt
						</button>
						<button
							onClick={() => handleRejectClick(record)}
							className="font-semibold text-black bg-[#DAEAF7] px-4 py-0.5 rounded-lg cursor-pointer hover:bg-[#023E73]/80 transition-colors duration-200"
						>
							Từ chối
						</button>
					</div>
				);
			},
			onHeaderCell: () => ({ style: { fontFamily: "var(--font-inter)" } }),
		},
	];

	return (
		<div className="font-inter">
			<div className="flex max-w-full justify-between mb-16">
				<DetailBox
					title="Đã gửi"
					icon={<FileText size={28} />}
					number={consentTotal.totalConsents}
				/>
				<DetailBox
					title="Đã phản hồi"
					icon={<CircleCheckBig size={28} />}
					number={consentTotal.respondedConsents}
				/>
				<DetailBox
					title="Chưa phản hồi"
					icon={<CircleAlert size={28} />}
					number={consentTotal.pendingConsents}
				/>
				<DetailBox
					title="Sự kiện sắp tới"
					icon={<Calendar size={28} />}
					number={upcomingEvents.length}
				/>
			</div>
			<div className="flex flex-col">
				<p className="font-bold text-xl bg-[#f9f9f9] px-6 py-2 rounded-lg">
					Lịch sử tiêm chủng chờ duyệt
				</p>
				<Table
					columns={columns}
					dataSource={filteredEvent()}
					pagination={pagination}
					onChange={(pagination) => setPagination(pagination)}
					loading={isLoading}
					error={isError}
				/>
			</div>

			{/* Reject Reason Modal */}
			<RejectReasonModal
				isOpen={rejectModalOpen}
				onClose={() => setRejectModalOpen(false)}
				onConfirm={handleRejectConfirm}
				eventTitle={selectedEvent?.eventTitle || ""}
				loading={rejectEvent.isPending}
			/>
		</div>
	);
};

export default Home;
