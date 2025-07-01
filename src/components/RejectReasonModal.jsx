import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

const RejectReasonModal = ({ isOpen, onClose, onConfirm, eventTitle, loading }) => {
	const [reason, setReason] = useState("");

	const handleSubmit = () => {
		if (reason.trim()) {
			onConfirm(reason);
			setReason("");
		}
	};

	const handleClose = () => {
		setReason("");
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-white/10 backdrop-blur-md flex items-center justify-center z-50 p-4 before:absolute before:inset-0 before:bg-black/50 before:-z-10">
			<div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-red-100 rounded-full">
							<AlertTriangle className="w-5 h-5 text-red-600" />
						</div>
						<h2 className="text-xl font-bold text-gray-900 font-inter">
							Lý do từ chối
						</h2>
					</div>
					<button
						onClick={handleClose}
						className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
						disabled={loading}
					>
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">
					<div className="mb-4">
						<p className="text-gray-600 font-inter">
							Bạn có chắc chắn muốn từ chối sự kiện{" "}
							<span className="font-semibold text-gray-900">"{eventTitle}"</span>?
						</p>
					</div>

					<div className="mb-6">
						<label className="block text-sm font-medium text-gray-700 mb-2 font-inter">
							Lý do từ chối <span className="text-red-500">*</span>
						</label>
						<textarea
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							placeholder="Nhập lý do từ chối sự kiện..."
							className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-inter"
							rows={4}
							disabled={loading}
						/>
						{reason.trim() === "" && (
							<p className="text-xs text-gray-500 mt-1">
								Lý do từ chối là bắt buộc
							</p>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
					<button
						onClick={handleClose}
						className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium font-inter"
						disabled={loading}
					>
						Hủy
					</button>
					<button
						onClick={handleSubmit}
						disabled={!reason.trim() || loading}
						className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium font-inter"
					>
						{loading ? (
							<div className="flex items-center justify-center gap-2">
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
								Đang xử lý...
							</div>
						) : (
							"Xác nhận từ chối"
						)}
					</button>
				</div>
			</div>
		</div>
	);
};

export default RejectReasonModal; 