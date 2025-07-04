import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../utils/api";
import { useState } from "react";
import { toast, Zoom } from "react-toastify";

const MedicationDialog = ({ requestId, actionType, triggerButton, items = [] }) => {
	const [open, setOpen] = useState(false);
	const [rejectReason, setRejectReason] = useState("");
	const [selectedItemId, setSelectedItemId] = useState("");
	const [dose, setDose] = useState("");
	const [status, setStatus] = useState("");
	const [note, setNote] = useState("");
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async () => {
			if (!requestId || !actionType) return;

			if (actionType === "approve") {
				return api.put(`/medication-requests/${requestId}/approve`);
			}

			if (actionType === "reject") {
				return api.put(`/medication-requests/${requestId}/reject`, null, {
					params: {
						rejectReason: rejectReason.trim(),
					},
				});
			}

			if (actionType === "deliver") {
				return api.post(`/medication-requests/${requestId}/dispense`, {
					itemId: selectedItemId || null,
					requestId: selectedItemId ? null : requestId,
					dose,
					note,
					status
				});
			}

			if (actionType === "done") {
				return api.put(`/medication-requests/${requestId}/done`);
			}
		},
		onSuccess: () => {
			toast.success("Cập nhật thành công!", {
				transition: Zoom,
				position: "bottom-center",
			});
			queryClient.invalidateQueries(["medication-requests/pending"]);
			queryClient.invalidateQueries(["medication-request/stats"]);
			queryClient.invalidateQueries(["approved-medication-requests"]);
			setOpen(false);
			setRejectReason("");
			setSelectedItemId("");
			setDose("");
			setNote("");
			setStatus("");
		},
		onError: (err) => {
			toast.error(err?.response?.data?.message || "Có lỗi xảy ra", {
				transition: Zoom,
				position: "bottom-center",
			});
		},
	});

	const isReject = actionType === "reject";
	const isDeliver = actionType === "deliver";
	const isSuccess = status === "SUCCESS";

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
				<Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white py-10 px-8 shadow-xl z-[61]">
					<Dialog.Title className="text-2xl font-bold text-center text-[#000000] mb-4 font-inter">
						{actionType === "approve"
							? "Xác nhận duyệt đơn"
							: actionType === "reject"
								? "Lý do từ chối"
								: actionType === "deliver"
									? "Ghi nhận phát thuốc"
									: "Xác nhận hoàn thành"}
					</Dialog.Title>

					{isReject && (
						<div className="mb-6 font-inter">
							<label className="block mb-2 font-semibold text-[14px]">
								Lý do từ chối <span className="text-red-500">*</span>
							</label>
							<textarea
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#023E73]"
								placeholder="Nhập lý do từ chối..."
								value={rejectReason}
								onChange={(e) => setRejectReason(e.target.value)}
							/>
						</div>
					)}

					{isDeliver && (
						<div className="space-y-4 font-inter">
							<div>
								<label className="block mb-1 font-semibold text-sm">Trạng thái</label>
								<select
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="w-full border px-3 py-2 rounded-md text-sm"
								>
									<option value="">Chọn trạng thái</option>
									<option value="SUCCESS">Thành công</option>
									<option value="FAIL">Không thành công</option>
								</select>
							</div>

							{isSuccess && (
								<>
									<div>
										<label className="block mb-1 font-semibold text-sm">Thuốc</label>
										{items && items.length > 0 ? (
											<select
												value={selectedItemId}
												onChange={(e) => setSelectedItemId(e.target.value)}
												className="w-full border px-3 py-2 rounded-md text-sm"
											>
												<option value="">Chọn thuốc</option>
												{items.map((item) => (
													<option key={item.itemId} value={item.itemId}>
														{item.medicineName || `ID ${item.itemId}`}
													</option>
												))}
											</select>
										) : (
											<p className="text-sm italic text-gray-500">Không có thuốc nào</p>
										)}
									</div>

									<div>
										<label className="block mb-1 font-semibold text-sm">Liều dùng</label>
										<input
											type="text"
											value={dose}
											onChange={(e) => setDose(e.target.value)}
											className="w-full border px-3 py-2 rounded-md text-sm"
											placeholder="Ví dụ: 5ml, 1 viên,..."
										/>
									</div>
								</>
							)}

							<div>
								<label className="block mb-1 font-semibold text-sm">Ghi chú</label>
								<textarea
									rows={3}
									value={note}
									onChange={(e) => setNote(e.target.value)}
									className="w-full border px-3 py-2 rounded-md text-sm"
									placeholder="Ví dụ: Ghi chú thêm nếu cần"
								/>
							</div>
						</div>
					)}

					<div className="flex justify-center gap-3 mt-6">
						<Dialog.Close asChild>
							<button className="px-6 py-2 bg-gray-200 rounded-md font-semibold hover:bg-gray-300">
								Hủy
							</button>
						</Dialog.Close>
						<button
							disabled={
								mutation.isPending ||
								(isReject && !rejectReason.trim()) ||
								(isDeliver && (
									!status ||
									(status === "SUCCESS" && (!selectedItemId || !dose.trim()))
								))
							}
							onClick={() => mutation.mutate()}
							className={`px-6 py-2 rounded-md font-semibold text-white font-inter ${
								isReject || isDeliver
									? "bg-[#023E73] hover:bg-[#01294d]"
									: "bg-[#023E73] hover:bg-[#01294d]"
							} `}
						>
							{mutation.isPending
								? "Đang xử lý..."
								: isReject
									? "Từ chối"
									: "Xác nhận"}
						</button>
					</div>

					<Dialog.Close asChild>
						<button
							className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
							aria-label="Close"
						>
							<X size={20} />
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default MedicationDialog;
