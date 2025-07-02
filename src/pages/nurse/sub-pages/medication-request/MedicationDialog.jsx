import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";

export default function MedicationDialog({ open, onOpenChange, title, children }) {
	const [showExitConfirm, setShowExitConfirm] = useState(false);

	const handleCloseAttempt = () => {
		setShowExitConfirm(true);
	};

	const handleExitConfirmed = () => {
		setShowExitConfirm(false);
		onOpenChange(false);
	};

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 bg-black/40" />
				<Dialog.Content className="fixed top-1/2 left-1/2 bg-white p-6 rounded-lg -translate-x-1/2 -translate-y-1/2 w-[500px]">
					<h2 className="text-xl font-bold mb-4">{title}</h2>

					{children}

					<div className="flex justify-end gap-3 mt-6">
						<button
							type="button"
							onClick={handleCloseAttempt}
							className="bg-gray-200 text-black px-4 py-2 rounded-md"
						>
							Hủy
						</button>
					</div>
				</Dialog.Content>
			</Dialog.Portal>

			{showExitConfirm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white p-6 rounded-xl w-[400px] shadow-lg">
						<h3 className="text-xl font-bold">Bạn chắc chắn muốn thoát?</h3>
						<p className="mt-2 text-gray-600">Dữ liệu đã điền sẽ không được lưu</p>

						<div className="flex justify-end gap-3 mt-6">
							<button
								onClick={() => setShowExitConfirm(false)}
								className="bg-gray-200 px-4 py-2 rounded-md"
							>
								Hủy
							</button>
							<button
								onClick={handleExitConfirmed}
								className="bg-[#023E73] text-white px-4 py-2 rounded-md"
							>
								Xác nhận
							</button>
						</div>
					</div>
				</div>
			)}
		</Dialog.Root>
	);
}
