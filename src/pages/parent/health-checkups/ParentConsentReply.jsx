import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../../utils/api.js";

export default function ParentConsentReply({ consentDetail, onClose, refetch }) {
    const [overallStatus, setOverallStatus] = useState("REJECTED"); // mặc định là chưa đồng ý
    const [note, setNote] = useState("");
    const [categoryReplies, setCategoryReplies] = useState(() => {
        const map = {};
        for (const cat of consentDetail?.categoryConsents || []) {
            map[cat.categoryId] = "APPROVED";
        }
        return map;
    });

    const handleChangeCategory = (id) => {
        setCategoryReplies(prev => ({
            ...prev,
            [id]: prev[id] === "APPROVED" ? "REJECTED" : "APPROVED"
        }));
    };

    const handleSubmit = async () => {
        const fullCategoryReplies = {};
        for (const cat of consentDetail.categoryConsents) {
            fullCategoryReplies[cat.categoryId] =
                overallStatus === "APPROVED" && categoryReplies[cat.categoryId] === "APPROVED"
                    ? "APPROVED"
                    : "REJECTED";
        }

        try {
            await api.put(`/checkup-consents/consent/${consentDetail.id}/reply`, {
                overallStatus,
                note,
                categoryReplies: fullCategoryReplies,
            });

            toast.dismiss();
            toast.success("Đã gửi phản hồi thành công");
            refetch?.();
            onClose?.();
        } catch (error) {
            toast.dismiss();
            toast.error("Gửi phản hồi thất bại");
            console.error("Consent submit error:", error);
        }
    };

    return (
        <Dialog.Root open={true} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Dialog.Content className="fixed z-50 bg-white top-1/2 left-1/2 max-w-lg w-full -translate-x-1/2 -translate-y-1/2 rounded-lg p-6 shadow">
                    <h2 className="text-lg font-bold mb-4">Phản hồi đơn đề nghị</h2>

                    {/* Phần chọn tham gia */}
                    <div className="space-y-2 mb-4">
                        <p className="font-medium">Phụ huynh đồng ý cho học sinh tham gia?</p>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={overallStatus === "APPROVED"}
                                onChange={(e) =>
                                    setOverallStatus(e.target.checked ? "APPROVED" : "REJECTED")
                                }
                            />
                            <span>Đồng ý tham gia</span>
                        </label>
                    </div>

                    {/* Chỉ hiện danh mục nếu đã đồng ý */}
                    {overallStatus === "APPROVED" && (
                        <div className="mb-4 space-y-2">
                            <p className="font-medium">Chọn danh mục đồng ý:</p>
                            {consentDetail.categoryConsents?.map((cat) => (
                                <label key={cat.categoryId} className="flex gap-2 items-center">
                                    <input
                                        type="checkbox"
                                        checked={categoryReplies[cat.categoryId] === "REJECTED"}
                                        onChange={() => handleChangeCategory(cat.categoryId)}
                                    />
                                    <span>{cat.categoryName}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Ghi chú */}
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full border rounded p-2 text-sm"
                        placeholder="Ghi chú thêm (nếu có)"
                    />

                    {/* Button */}
                    <div className="flex justify-end mt-4 space-x-2">
                        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-300 text-sm">
                            Hủy
                        </button>
                        <button onClick={handleSubmit} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">
                            Gửi phản hồi
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}