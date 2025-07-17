import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";

export default function ManagerEditCheckupResultDialog({
                                                    section,
                                                    resultId,
                                                    open,
                                                    onOpenChange,
                                                    onSaved,
                                                    isOverall = false,
                                                }) {
    const [status, setStatus] = useState("");
    const [value, setValue] = useState("");
    const [note, setNote] = useState("");
    const [eventDate, setEventDate] = useState(section?.eventDate || "");

    useEffect(() => {
        if (isOverall) {
            setStatus(section?.status || "");
            setNote(section?.note || "");
        } else if (section) {
            setStatus(section.status || "");
            setValue(section.value || "");
        }
    }, [section, isOverall]);

    const handleSave = async () => {
        try {
            if (isOverall) {
                if (!resultId) {
                    toast.error("Thiếu ID kết quả.");
                    return;
                }
                await api.put(`/checkup-results/overall/${resultId}`, {
                    status,
                    note,
                    eventDate
                });
            } else {
                await api.put(`/checkup-results/items/${section.id}`, {
                    status,
                    value,
                });
            }

            toast.success("Cập nhật thành công!");
            onSaved?.();
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi cập nhật kết quả.");
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-opacity-30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className="text-lg font-semibold">
                            {isOverall
                                ? "Chỉnh sửa kết quả tổng thể"
                                : `Chỉnh sửa: ${section?.name}`}
                        </Dialog.Title>
                        <Dialog.Close>
                            <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
                        </Dialog.Close>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Trạng thái</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="NO_RESULT">Chưa có kết quả</option>
                                <option value="NORMAL">Bình thường</option>
                                <option value="ABNORMAL">Theo dõi</option>
                                <option value="SERIOUS">Nguy hiểm</option>
                            </select>
                        </div>

                        {!isOverall && (
                            <div>
                                <label className="block font-medium mb-1">Giá trị kết quả</label>
                                <input
                                    type="text"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="Nhập giá trị kết quả"
                                />
                            </div>
                        )}

                        {isOverall && (
                            <div>
                                <label className="block font-medium mb-1">Ghi chú</label>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="border px-3 py-2 rounded"
                                />
                                <textarea
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    rows={3}
                                    placeholder="Nhập ghi chú nếu có"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200">
                                Hủy
                            </button>
                        </Dialog.Close>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-medium"
                        >
                            Lưu
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}