import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api.js";
import { ArrowLeft } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { toast } from "react-toastify";

dayjs.extend(utc);
dayjs.extend(timezone);

export const getMedicationDetail = (id) => {
	return api.get(`/medication-requests/${id}`);
};

export default function MedicationRequestDetail({ id: propId, inline = false }) {
	const params = useParams();
	const id = propId ?? params.id;
	const navigate = useNavigate();

	const { data, isLoading, isError } = useQuery({
		queryKey: ["medication", id],
		queryFn: () => getMedicationDetail(id).then((res) => res.data),
		enabled: !!id,
	});

	if (isLoading) return <div className="p-6">Đang tải dữ liệu...</div>;
	if (isError) return <div className="p-6 text-red-500">Lỗi khi tải dữ liệu.</div>;

	const medication = data;

	const handleEdit = () => {
		navigate(`/medication-requests/${medication.requestId}/update`, {
			state: {
				editData: medication,
				studentId: medication.student?.studentId,
			}
		});
	};

	const handleDelete = () => {
		if (toast.isActive("confirm-delete")) return;

		toast(
			({ closeToast }) => (
				<div>
					<p className="mb-3 font-medium font-inter">Bạn có chắc chắn muốn xóa đơn thuốc này?</p>
					<div className="flex justify-end gap-2">
						<button
							className="px-3 py-2 text-sm rounded bg-gray-300 hover:bg-gray-400 font-inter"
							onClick={closeToast}
						>
							Hủy
						</button>
						<button
							className="px-3 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 font-inter"
							onClick={async () => {
								try {
									await api.put(`/medication-requests/${id}`);
									toast.dismiss("confirm-delete");
									toast.success("Đã xoá đơn thuốc thành công!");
									const user = await api.get("/me");
									const role = user.data.role;

									if (role === "PARENT") {
										navigate("/parent/medication-requests");
									} else if (role === "NURSE") {
										navigate("/nurse/medication-requests/pending");
									} else {
										navigate("/");
									}
								} catch (err) {
									console.error("Lỗi khi xóa:", err);
									toast.error("Không thể xoá đơn thuốc. Vui lòng thử lại.");
								}
							}}
						>
							Xác nhận
						</button>
					</div>
				</div>
			),
			{
				autoClose: false,
				closeOnClick: false,
				position: "top-center",
				toastId: "confirm-delete",
			}
		);
	};

	function renderStatusBadge(status) {
		switch (status) {
			case "PENDING":
				return (
					<span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-m font-lg font-bold">
						Chờ duyệt
					</span>
				);
			case "APPROVED":
				return (
					<span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded text-m font-lg font-bold">
						Phát thuốc
					</span>
				);
			case "DONE":
				return (
					<span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded text-m font-lg font-bold">
						Hoàn thành
					</span>
				);
			case "REJECTED":
				return (
					<span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded text-m font-lg font-bold">
						Đã từ chối
					</span>
				);
			default:
				return (
					<span className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded text-m font-lg font-bold">
						Không rõ
					</span>
				);
		}
	}

	return (
		<div className="min-h-screen font-inter">
			<div className={`${inline ? "" : "max-w-7xl mx-auto p-6"}`}>
				{!inline && (
					<button
						onClick={() => navigate(-1)}
						className="flex items-center gap-2 mb-6 px-4 py-2 border border-black rounded-full text-sm text-black"
					>
						<ArrowLeft className="w-4 h-4" />
						Trở về
					</button>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
					<div className="lg:col-span-2 space-y-6">
						<div>
							<h1 className="text-xl font-bold mb-2">{medication.title}</h1>
							<span className="inline-block">{renderStatusBadge(medication.medicationStatus)}</span>

							{medication.medicationStatus === "REJECTED" && medication.rejectReason && (
								<p className="mt-2 text-sm text-red-600 font-medium">
									Lý do từ chối: {medication.rejectReason}
								</p>
							)}

							{!["APPROVED", "DONE"].includes(medication.medicationStatus) && (
								<div className="mt-3 flex gap-2">
									<button
										onClick={handleEdit}
										className="bg-[#023E73] text-white font-semibold px-5 py-2 text-m rounded-lg hover:bg-[#034a8a]"
									>
										Chỉnh sửa
									</button>
									<button
										onClick={handleDelete}
										className="bg-red-600 text-white font-semibold px-5 py-2 text-m rounded-lg hover:bg-red-800"
									>
										Xóa
									</button>
								</div>
							)}

							<div className="mt-4 text-sm text-black space-y-2">
								<p>Cán bộ y tế phụ trách: {medication.nurseName || "Không rõ"}</p>
								<p>Người duyệt: {medication.managerName || "Không rõ"}</p>
								<p>Ngày tạo đơn: {dayjs.unix(Math.floor(medication.createAt)).format("DD/MM/YYYY")}</p>
								<p>Cập nhật lần cuối: {dayjs.unix(Math.floor(medication.updateAt)).format("HH:mm DD/MM/YYYY")}</p>
							</div>
						</div>

						<div className="bg-white rounded-lg border p-4 w-[80%]">
							<h3 className="font-semibold mb-3">Thông tin học sinh</h3>
							<div className="space-y-2 text-sm">
								<p>Họ và tên: {medication.student?.fullName || "Không rõ"}</p>
								<p>Mã số học sinh: {medication.student?.studentCode || "Không rõ"}</p>
								<p>Ngày sinh: {medication.student?.dob || "-"}</p>
								<p>Giới tính: {medication.student?.gender || "-"}</p>
								<p>Lớp: {medication.student?.clazz || "-"}</p>
							</div>
						</div>

						<div className="bg-white rounded-lg border p-4 w-[80%]">
							<h3 className="font-semibold mb-3">Thông tin phụ huynh</h3>
							<div className="space-y-2 text-sm">
								<p>Họ và tên: {medication.parent?.fullName || "Không rõ"}</p>
								<p>Email: {medication.parent?.email || "Không rõ"}</p>
								<p>SĐT: {medication.parent?.phone || "Không rõ"}</p>
							</div>
						</div>
					</div>

					<div className="lg:col-span-3 space-y-6">
						<div className="bg-red-50 border border-red-200 rounded-lg p-4">
							<p className="text-sm text-red-800">
								<span className="font-semibold">Ghi chú:</span> {medication.note || "Không có ghi chú."}
							</p>
						</div>

						<div className="bg-blue-50 rounded-lg p-4">
							<h3 className="font-semibold mb-4 text-lg">Chi tiết đơn thuốc</h3>
							<div className="grid grid-cols-2 gap-4 text-sm">
								<div>
									<span className="text-gray-600">Lí do gửi thuốc</span>
									<p className="font-medium">{medication.reason}</p>
								</div>
								<div>
									<span className="text-gray-600">Ngày bắt đầu</span>
									<p className="font-medium">{dayjs(medication.startDate).format("DD/MM/YYYY")}</p>
								</div>
								<div>
									<span className="text-gray-600">Ngày kết thúc</span>
									<p className="font-medium">{dayjs(medication.endDate).format("DD/MM/YYYY")}</p>
								</div>
							</div>
						</div>

						<div>
							<h3 className="font-semibold mb-4 text-lg">Danh sách thuốc</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{medication.items?.map((item, index) => (
									<div key={index} className="flex justify-center">
										<div className="bg-white rounded-lg border p-4 w-[90%]">
											<h4 className="font-semibold mb-2">{item.medicineName}</h4>
											<div className="text-sm space-y-1">
												<p>Số lượng: {item.quantity} {item.unit}</p>
												<p>Liều dùng: {item.dosage}</p>
												<p>Ghi chú: {item.note || "-"}</p>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div>
							<h3 className="font-semibold mb-4 text-lg">Lịch sử phát thuốc</h3>
							<div className="bg-white rounded-lg overflow-hidden">
								<table className="w-full text-sm">
									<tbody className="divide-y">
									{medication.dispensations?.length > 0 ? (
										medication.dispensations.map((entry, index) => (
											<React.Fragment key={index}>
												<tr className="border-0">
													<td className="p-3">Phụ trách: {entry.nurseName}</td>
													<td className="p-3">{entry.dose || "-"}</td>
													<td className="p-3">{dayjs.unix(Math.floor(entry.time)).format("HH:mm DD/MM/YYYY")}</td>
												</tr>
												{entry.note && (
													<tr>
														<td className="p-3" colSpan={3}>
															<span className="font-medium">Ghi chú:</span> {entry.note}
														</td>
													</tr>
												)}
											</React.Fragment>
										))
									) : (
										<tr>
											<td colSpan={3} className="text-center text-gray-500 p-4">
												Không có lịch sử phát thuốc.
											</td>
										</tr>
									)}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}