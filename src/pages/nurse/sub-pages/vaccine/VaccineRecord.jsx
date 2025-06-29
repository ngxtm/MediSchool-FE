import React, { useState, useEffect } from "react";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import ReturnButton from "../../../../components/ReturnButton";
import { useParams } from "react-router-dom";
import api from "../../../../utils/api";
import Loading from "../../../../components/Loading";
import { Table, Input, Button, Tag, message } from "antd";
import AbnormalDetailModal from "../../../../components/AbnormalDetailModal";
import BulkActionBar from "../../../../components/BulkActionBar";
import { formatDate } from "../../../../utils/dateparse";

const VaccineRecord = ({ actor }) => {
	const { id } = useParams();
	const [
		{
			data: vaccineEvent,
			isLoading: isVaccineEventLoading,
			isError: isVaccineEventError,
		},
		{
			data: vaccineRecord,
			isLoading: isVaccineRecordLoading,
			isError: isVaccineRecordError,
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
				queryKey: ["vaccine-record", id],
				queryFn: async () => {
					const response = await api.get(`/vaccination-history/event/${id}`);
					return response.data;
				},
			},
		],
	});

	// combine loading & error states from both queries
	const isLoading = isVaccineEventLoading || isVaccineRecordLoading;
	const isError = isVaccineEventError || isVaccineRecordError;

	const [selectedRowKeys, setSelectedRowKeys] = useState([]);

	// inline edit states for "Bất thường"
	const [editingRow, setEditingRow] = useState(null); // vaccineId being edited
	const [editingValue, setEditingValue] = useState("");
	// inline edit states for follow-up note
	const [editingNoteRow, setEditingNoteRow] = useState(null);
	const [editingNoteValue, setEditingNoteValue] = useState("");
	const [showAbModal, setShowAbModal] = useState(false);
	const [pendingRowForNote, setPendingRowForNote] = useState(null);

	// table data state & pagination
	const [filteredVaccines, setFilteredVaccines] = useState([]);
	const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });

	// load vaccine records when api data available (adjust key if different)
	useEffect(() => {
		if (vaccineEvent?.records) {
			// chiến dịch trả về danh sách DTO tương tự (history + student)
			const flattened = vaccineEvent.records.map((item) =>
				item.history ? { ...item.history, student: item.student } : item
			);
			setFilteredVaccines(flattened);
		}
	}, [vaccineEvent]);

	// sync records fetched from API
	useEffect(() => {
		if (vaccineRecord) {
			// /vaccination-history/event API trả về DTO có trường history & student
			const flattened = vaccineRecord.map((item) => ({
				...item.history,
				student: item.student,
			}));
			setFilteredVaccines(flattened);
		}
	}, [vaccineRecord]);

	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: ({ historyId, ...changes }) =>
			api.patch(`/vaccination-history/${historyId}`, changes),
		onSuccess: () => queryClient.invalidateQueries(["vaccine-record", id]),
		onError: () => message.error("Cập nhật thất bại"),
	});

	// helper to update a record locally – optimistic UI
	const updateLocalRecord = (id, payload) => {
		setFilteredVaccines((prev) =>
			prev.map((rec) => (rec.historyId === id ? { ...rec, ...payload } : rec))
		);
	};

	// send update to server after optimistic change
	const handleUpdateRecord = (recordId, changes) => {
		updateLocalRecord(recordId, changes); // optimistic UI
		updateMutation.mutate({ historyId: recordId, ...changes });
	};

	// ----- handlers -----
	const handleSaveAbnormal = (record) => {
		const trimmed = editingValue.trim().toLowerCase();
		const isAbnormal = trimmed === "true" || trimmed === "có";

		if (isAbnormal) {
			setPendingRowForNote(record.historyId);
			setShowAbModal(true);
		} else {
			handleUpdateRecord(record.historyId, {
				abnormal: false,
				followUpNote: "",
			});
		}
		setEditingRow(null);
		setEditingValue("");
	};

	const handleCancelEdit = () => {
		setEditingRow(null);
		setEditingValue("");
	};

	const handleSaveNote = (record) => {
		const note = editingNoteValue.trim();
		handleUpdateRecord(record.historyId, { followUpNote: note });
		setEditingNoteRow(null);
		setEditingNoteValue("");
	};

	const handleCancelNoteEdit = () => {
		setEditingNoteRow(null);
		setEditingNoteValue("");
	};

	if (isLoading) {
		return <Loading />;
	}

	if (isError) {
		return <div>Error fetching api & load data</div>;
	}

	const getStatusDisplay = (status, date) => {
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

	const { text: statusText, bgColor } = getStatusDisplay(
		vaccineEvent?.status,
		vaccineEvent?.event_date
	);

	const columns = [
		{
			title: "Học sinh",
			key: "student",
			align: "center",
			width: 180,
			render: (_, record) => (
				<span className="font-semibold">
					{record?.student?.fullName || "N/A"}
				</span>
			),
		},
		{
			title: "Lớp",
			key: "class",
			align: "center",
			width: 120,
			render: (_, record) => record?.student?.classCode || "N/A",
		},
		{
			title: "Vaccine",
			key: "vaccine",
			align: "center",
			width: 180,
			render: (_, record) =>
				record?.vaccine?.name || record?.vaccineName || "N/A",
		},
		{
			title: "Ngày tiêm",
			key: "createdAt",
			align: "center",
			width: 180,
			render: (_, record) => {
				if (!record?.vaccinationDate) return "N/A";
				return formatDate(record.vaccinationDate);
			},
		},
		{
			title: "Bất thường",
			dataIndex: "abnormal",
			key: "abnormal",
			align: "center",
			width: 180,
			render: (_, record) => {
				const isEditing = editingRow === record.historyId;
				if (isEditing) {
					return (
						<div className="flex gap-2 items-center">
							<Input
								style={{ width: 80, height: 30 }}
								value={editingValue}
								onChange={(e) => setEditingValue(e.target.value)}
								onPressEnter={() => handleSaveAbnormal(record)}
								autoFocus
							/>
							<Button
								size="small"
								type="primary"
								onClick={() => handleSaveAbnormal(record)}
							>
								✓
							</Button>
							<Button size="small" onClick={handleCancelEdit}>
								✕
							</Button>
						</div>
					);
				}
				return (
					<Tag
						color={record.abnormal ? "red" : "green"}
						style={{ cursor: "pointer" }}
						onClick={() => {
							setEditingRow(record.historyId);
							setEditingValue(record.abnormal ? "true" : "false");
						}}
					>
						{record.abnormal ? "Có" : "Không"}
					</Tag>
				);
			},
		},
		{
			title: "Ghi chú theo dõi",
			dataIndex: "followUpNote",
			key: "followUpNote",
			align: "left",
			width: 250,
			render: (_, record) => {
				const isEditing = editingNoteRow === record.historyId;
				if (isEditing) {
					return (
						<div className="flex gap-2 items-center">
							<Input.TextArea
								style={{ width: 200, minHeight: 30 }}
								value={editingNoteValue}
								autoSize={{ minRows: 1, maxRows: 3 }}
								onChange={(e) => setEditingNoteValue(e.target.value)}
							/>
							<Button
								size="small"
								type="primary"
								onClick={() => handleSaveNote(record)}
							>
								✓
							</Button>
							<Button size="small" onClick={handleCancelNoteEdit}>
								✕
							</Button>
						</div>
					);
				}
				return (
					<span
						className="cursor-pointer text-gray-700 italic"
						onClick={() => {
							setEditingNoteRow(record.historyId);
							setEditingNoteValue(record.followUpNote || "");
						}}
					>
						{record.followUpNote || "Nhấp để thêm ghi chú..."}
					</span>
				);
			},
		},
	];

	// bulk action handlers
	const handleBulkNormal = () => {
		selectedRowKeys.forEach((id) =>
			handleUpdateRecord(id, { abnormal: false })
		);
		setSelectedRowKeys([]);
	};

	const handleBulkAbnormal = () => {
		selectedRowKeys.forEach((id) => handleUpdateRecord(id, { abnormal: true }));
	};

	// example templates – reuse from AbnormalDetailModal
	const templates = [
		{
			id: 1,
			name: "Bình thường",
			followUpNote: "Sau 30 phút, trẻ bình thường",
		},
		{
			id: 2,
			name: "Đau nhẹ tại chỗ tiêm",
			followUpNote: "Trẻ có đau nhẹ tại vị trí tiêm, đã hướng dẫn",
		},
		{ id: 3, name: "Theo dõi thêm", followUpNote: "Cần theo dõi thêm 15 phút" },
	];

	const handleBulkTemplate = (tpl) => {
		selectedRowKeys.forEach((id) =>
			handleUpdateRecord(id, { followUpNote: tpl.followUpNote })
		);
	};

	const rowSelection = {
		selectedRowKeys,
		onChange: (keys) => setSelectedRowKeys(keys),
	};

	return (
		<div className="font-inter">
			<ReturnButton linkNavigate={`${actor === "manager" ? "/manager" : "/nurse"}/vaccination/vaccine-event/${id}`} />

			<div className="flex flex-col mt-10 gap-4">
				<h1 className="font-bold text-2xl">
					Chiến dịch: {vaccineEvent?.eventTitle || "N/A"}
				</h1>
				<p
					className={`text-center ${bgColor} font-bold px-6 py-1 w-fit rounded-lg`}
				>
					{statusText}
				</p>
			</div>

			{selectedRowKeys.length > 0 && (
				<BulkActionBar
					selectedCount={selectedRowKeys.length}
					onBulkNormal={handleBulkNormal}
					onBulkAbnormal={handleBulkAbnormal}
					onBulkTemplate={handleBulkTemplate}
					templates={templates}
					onCancel={() => setSelectedRowKeys([])}
				/>
			)}

			<Table
				rowSelection={rowSelection}
				columns={columns}
				dataSource={filteredVaccines}
				loading={isLoading}
				onChange={(pagination) => setPagination(pagination)}
				pagination={pagination}
				rowKey="historyId"
			/>

			<AbnormalDetailModal
				open={showAbModal}
				recordCount={1}
				onCancel={() => setShowAbModal(false)}
				onSubmit={(note) => {
					if (pendingRowForNote) {
						handleUpdateRecord(pendingRowForNote, {
							abnormal: true,
							followUpNote: note,
						});
						setPendingRowForNote(null);
					}
					setShowAbModal(false);
				}}
			/>
		</div>
	);
};

export default VaccineRecord;
