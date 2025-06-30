import { useParams } from "react-router-dom";
import ReturnButton from "../../../../components/ReturnButton";
import { useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../utils/api";
import { useState } from "react";
import { Table, Input, Checkbox, Button, Dropdown, message, Modal } from "antd";
import { Search, Edit } from "lucide-react";
import Loading from "../../../../components/Loading";

const StudentHistory = () => {
	const { id } = useParams();
	const queryClient = useQueryClient();
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [search, setSearch] = useState("");
	const [isAbnormalModalOpen, setIsAbnormalModalOpen] = useState(false);
	const [abnormalNote, setAbnormalNote] = useState("");
	const [selectedRecord, setSelectedRecord] = useState(null);

	const followUpTemplates = [
		{ key: "1", label: "Sau 30 phút, học sinh không có dấu hiệu bất thường." },
		{ key: "2", label: "Các triệu chứng khác bình thường." },
		{ key: "3", label: "Theo dõi 24h không thấy phản ứng phụ." },
	];

	const [
		{
			data: vaccineEvent,
			isLoading: isVaccineEventLoading,
			isError: isVaccineEventError,
		},
		{ data: vaccinationHistory, isLoading: isHistoryLoading },
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
				queryKey: ["vaccination-history", id],
				queryFn: async () => {
					try {
						const response = await api.get(`/vaccination-history/event/${id}`);
						return response.data;
					} catch {
						return [];
					}
				},
			},
		],
	});

	const updateVaccinationMutation = useMutation({
		mutationFn: ({ historyId, ...changes }) =>
			api.patch(`/vaccination-history/${historyId}`, changes),

		onMutate: async (newData) => {
			await queryClient.cancelQueries(["vaccination-history", id]);
			const previous = queryClient.getQueryData(["vaccination-history", id]);

			queryClient.setQueryData(["vaccination-history", id], (old = []) =>
				old.map((h) =>
					h.historyId === newData.historyId ? { ...h, ...newData } : h
				)
			);

			return { previous };
		},

		onError: (_err, _newData, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["vaccination-history", id], context.previous);
			}
			message.error("Cập nhật thất bại");
		},

		onSuccess: () => message.success("Cập nhật thành công"),
		onSettled: () => {
			queryClient.invalidateQueries(["vaccination-history", id]);
		},
	});

	const batchUpdateMutation = useMutation({
		mutationFn: (records) => api.patch(`/vaccination-history/batch`, records),
		onMutate: async (updates) => {
			await queryClient.cancelQueries(["vaccination-history", id]);
			const previous = queryClient.getQueryData(["vaccination-history", id]);
			
			queryClient.setQueryData(["vaccination-history", id], (old = []) => {
				const updateMap = new Map(updates.map(u => [u.historyId, u]));
				return old.map(h => {
					const update = updateMap.get(h.historyId);
					return update ? { ...h, ...update } : h;
				});
			});
			
			return { previous };
		},
		onError: (_err, _updates, context) => {
			if (context?.previous) {
				queryClient.setQueryData(["vaccination-history", id], context.previous);
			}
			message.error("Cập nhật hàng loạt thất bại");
		},
		onSuccess: () => {
			setSelectedRowKeys([]);
			message.success("Cập nhật thành công");
		},
		onSettled: () => {
			queryClient.invalidateQueries(["vaccination-history", id]);
		},
	});

	const getStatusEventDisplay = (status) => {
		if (!status) return { text: "Trạng thái lạ", bgColor: "bg-[#D9D9D9]" };

		switch (status.toUpperCase()) {
			case "APPROVED":
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

	const handleUpdateFollowUp = (record, value) => {
		updateVaccinationMutation.mutate({
			historyId: record.historyId,
			followUpNote: value,
		});
	};

	const handleUpdateAbnormal = (record, value) => {
		if (value === true) {
			setSelectedRecord(record);
			setIsAbnormalModalOpen(true);
		} else {
			updateVaccinationMutation.mutate({
				historyId: record.historyId,
				abnormal: value,
			});
		}
	};

	const handleBatchSetNormal = () => {
		const updates = selectedRowKeys.map((key) => ({
			historyId: key,
			abnormal: false,
		}));
		batchUpdateMutation.mutate(updates);
	};

	const handleBatchApplyTemplate = (template) => {
		const updates = selectedRowKeys.map((key) => ({
			historyId: key,
			followUpNote: template,
		}));
		batchUpdateMutation.mutate(updates);
	};

	const handleAbnormalModalSubmit = () => {
		if (selectedRecord) {
			updateVaccinationMutation.mutate({
				historyId: selectedRecord.historyId,
				abnormal: true,
				followUpNote: abnormalNote,
			});
			setIsAbnormalModalOpen(false);
			setAbnormalNote("");
			setSelectedRecord(null);
		}
	};

	const { text: statusEventText, bgColor: statusEventBgColor } =
		getStatusEventDisplay(vaccineEvent?.status);

	const isLoading =
		isVaccineEventLoading || isHistoryLoading;

	if (isLoading) {
		return <Loading />;
	}

	if (isVaccineEventError) {
		return <div>Error fetching api & load data</div>;
	}

	// Filter data based on search term
	const filteredData = (vaccinationHistory ?? []).filter(
		({ studentName = "", className = "" }) =>
			studentName.toLowerCase().includes(search.toLowerCase()) ||
			className.toLowerCase().includes(search.toLowerCase())
	);

	const columns = [
		{
			title: "Học sinh",
			dataIndex: "studentName",
			key: "studentName",
		},
		{
			title: "Lớp",
			dataIndex: "className",
			key: "className",
			width: 100,
		},
		{
			title: "Vaccine",
			dataIndex: "vaccineName",
			key: "vaccineName",
			render: (text, record) => record.vaccine?.name || text || "N/A",
		},
		{
			title: "Ngày tiêm",
			dataIndex: "vaccinationDate",
			key: "vaccinationDate",
			width: 120,
		},
		{
			title: "Bất thường?",
			dataIndex: "abnormal",
			key: "abnormal",
			width: 120,
			render: (abnormal, record) => (
				<Checkbox
					checked={abnormal}
					onChange={(e) => handleUpdateAbnormal(record, e.target.checked)}
				/>
			),
		},
		{
			title: "Theo dõi sau tiêm",
			dataIndex: "followUpNote",
			key: "followUpNote",
			render: (text, record) => (
				<div className="flex items-center">
					<Input.TextArea
						defaultValue={text || ""}
						onBlur={(e) => handleUpdateFollowUp(record, e.target.value)}
					/>
					<Edit size={16} className="ml-2 text-gray-400" />
				</div>
			),
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (keys) => setSelectedRowKeys(keys),
	};

	const templateMenu = {
		items: followUpTemplates.map((t) => ({ key: t.key, label: t.label })),
		onClick: ({ key }) => {
			const template = followUpTemplates.find((t) => t.key === key)?.label;
			if (template) handleBatchApplyTemplate(template);
		},
	};

	return (
		<div className="font-inter">
			<ReturnButton linkNavigate={`/nurse/vaccine-event/${id}`} />
			<div className="flex flex-col gap-4 mt-12">
				<h1 className="font-bold text-2xl">
					Chiến dịch: {vaccineEvent?.eventTitle ?? "N/A"}
				</h1>
				<p
					className={`text-center ${statusEventBgColor} font-bold px-6 py-1 w-fit rounded-lg`}
				>
					{statusEventText ?? "N/A"}
				</p>
			</div>

			<div className="mt-8">
				<div className="flex justify-between items-center mb-4">
					<Input
						prefix={<Search size={16} className="text-gray-400 mr-2" />}
						placeholder="Tìm kiếm học sinh hoặc lớp"
						style={{ width: 300 }}
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="rounded-lg"
					/>

					<Button type="primary" onClick={() => {}} className="bg-blue-600">
						Xuất PDF
					</Button>
				</div>

				{selectedRowKeys.length > 0 && (
					<div className="bg-blue-50 p-4 mb-4 rounded-lg flex items-center gap-4">
						<span className="font-medium">
							Đã chọn {selectedRowKeys.length} học sinh
						</span>
						<Button onClick={handleBatchSetNormal} className="bg-white">
							Đặt "Bất thường = Không"
						</Button>

						<Dropdown menu={templateMenu}>
							<Button className="bg-white">Áp dụng mẫu theo dõi</Button>
						</Dropdown>

						<Button
							onClick={() => setSelectedRowKeys([])}
							className="bg-white text-gray-500"
						>
							Bỏ chọn
						</Button>
					</div>
				)}

				<Table
					rowSelection={rowSelection}
					columns={columns}
					dataSource={filteredData}
					rowKey="historyId"
					pagination={{ pageSize: 10 }}
					bordered
				/>
			</div>

			<Modal
				title="Ghi chú chi tiết về bất thường"
				open={isAbnormalModalOpen}
				onOk={handleAbnormalModalSubmit}
				onCancel={() => {
					setIsAbnormalModalOpen(false);
					setAbnormalNote("");
					setSelectedRecord(null);
				}}
			>
				<div className="mt-4">
					<p className="text-red-500 mb-2">
						Lưu ý: Cần ghi chú đầy đủ chi tiết khi có phản ứng bất thường sau
						tiêm
					</p>
					<Input.TextArea
						value={abnormalNote}
						onChange={(e) => setAbnormalNote(e.target.value)}
						rows={4}
						placeholder="Mô tả chi tiết triệu chứng bất thường..."
					/>
				</div>
			</Modal>
		</div>
	);
};

export default StudentHistory;
