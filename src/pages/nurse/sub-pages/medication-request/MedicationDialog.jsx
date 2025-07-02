import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../utils/api";
import { useState } from "react";
import { toast, Zoom } from "react-toastify";

const MedicationDialog = ({ requestId, actionType, triggerButton, nurseId }) => {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
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
						reason: reason.trim(),
					},
				});
			}

			if (actionType === "deliver") {
				// Giả định body rỗng và nurseId không cần thiết (bạn có thể chỉnh lại nếu cần)
				return api.post(`/medication-requests/${requestId}/dispense`, {
					// Có thể truyền thêm thông tin phát thuốc nếu backend yêu cầu
					medicineName: "Paracetamol", // placeholder nếu cần
					dose: "1 viên", // placeholder
				}, {
					params: {
						requestId,
					},
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
			setOpen(false);
			setReason("");
		},
		onError: (err) => {
			toast.error(err?.response?.data?.message || "Có lỗi xảy ra", {
				transition: Zoom,
				position: "bottom-center",
			});
		},
	});

	const isReject = actionType === "reject";

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>{triggerButton}</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/60 z-[60]" />
				<Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white py-10 px-8 shadow-xl z-[61]">
					<Dialog.Title className="text-2xl font-bold text-center text-[#023E73] mb-4">
						{actionType === "approve"
							? "Xác nhận duyệt đơn"
							: actionType === "reject"
								? "Lý do từ chối"
								: actionType === "deliver"
									? "Xác nhận phát thuốc"
									: "Xác nhận hoàn thành"}
					</Dialog.Title>

					{isReject && (
						<div className="mb-6">
							<label className="block mb-2 font-semibold text-[14px]">
								Lý do từ chối <span className="text-red-500">*</span>
							</label>
							<textarea
								rows={3}
								className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm outline-none focus:ring-2 focus:ring-[#023E73]"
								placeholder="Nhập lý do từ chối..."
								value={reason}
								onChange={(e) => setReason(e.target.value)}
							/>
						</div>
					)}

					<div className="flex justify-center gap-3 mt-4">
						<Dialog.Close asChild>
							<button className="px-6 py-2 bg-gray-200 rounded-md font-semibold hover:bg-gray-300">
								Hủy
							</button>
						</Dialog.Close>
						<button
							disabled={mutation.isPending || (isReject && !reason.trim())}
							onClick={() => mutation.mutate()}
							className={`px-6 py-2 rounded-md font-semibold text-white ${
								isReject
									? "bg-[#DF3C3C] hover:bg-[#bf2b2b]"
									: "bg-[#023E73] hover:bg-[#01294d]"
							} disabled:opacity-60`}
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
