import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/api";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

export default function EditCheckupResultDialog({
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
    const [eventDate, setEventDate] = useState("");

    useEffect(() => {
        if (isOverall && section) {
            setStatus(section.status || "");
            setNote(section.note || "");
            const parsedDate = dayjs(section.eventDate, "DD/MM/YYYY");
            setEventDate(parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : "");
        } else if (section) {
            setStatus(section.status || "");
            setValue(section.value || "");
        }
    }, [section, isOverall]);

    // ✅ Hàm validate
    const validateForm = () => {
        if (!status) {
            toast.error("Vui lòng chọn trạng thái.");
            return false;
        }

        if (isOverall) {
            if (!eventDate) {
                toast.error("Vui lòng chọn ngày khám.");
                return false;
            }

            const start = dayjs(section.startDate, "DD/MM/YYYY").format("YYYY-MM-DD");
            const end = dayjs(section.endDate, "DD/MM/YYYY").format("YYYY-MM-DD");
            const date = dayjs(eventDate, "YYYY-MM-DD").format("YYYY-MM-DD");

            if (date < start || date > end) {
                const startDisplay = dayjs(section.startDate, "DD/MM/YYYY").format("DD/MM/YYYY");
                const endDisplay = dayjs(section.endDate, "DD/MM/YYYY").format("DD/MM/YYYY");
                toast.error(`Ngày khám phải nằm trong khoảng từ ${startDisplay} đến ${endDisplay}.`);
                return;
            }

        } else {
            if (!value || value.trim() === "") {
                toast.error("Vui lòng nhập giá trị kết quả.");
                return false;
            }
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return; // ✅ Gọi validate trước khi gọi API

        try {
            if (isOverall) {
                await api.put(`/checkup-results/overall/${resultId}`, {
                    status,
                    note,
                    eventDate,
                });
            } else {
                await api.put(`/checkup-results/items/${section.id}`, {
                    status,
                    value,
                });
            }

            toast.success("Cập nhật kết quả thành công!");
            onSaved?.();
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            if (err.response?.data?.message) {
                toast.error(`Lỗi: ${err.response.data.message}`);
            } else {
                toast.error("Có lỗi xảy ra. Vui lòng thử lại.");
            }
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                <Dialog.Content className="fixed top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <Dialog.Title className="text-lg font-semibold mb-4">
                        {isOverall
                            ? "Chỉnh sửa kết quả tổng thể"
                            : `Chỉnh sửa: ${section?.name}`}
                    </Dialog.Title>
                    <Dialog.Description className="sr-only">
                        Hộp thoại chỉnh sửa thông tin kết quả kiểm tra sức khỏe.
                    </Dialog.Description>

                    <div className="space-y-4">
                        <div>
                            <label className="block font-medium mb-1">Trạng thái</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2"
                            >
                                <option value="">-- Chọn trạng thái --</option>
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
                            <div className="space-y-3">
                                <div>
                                    <label className="block font-medium mb-1">Ngày khám</label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        min={dayjs(section?.startDate, "DD/MM/YYYY").format("YYYY-MM-DD")}
                                        max={dayjs(section?.endDate, "DD/MM/YYYY").format("YYYY-MM-DD")}
                                        className="w-full border px-3 py-2 rounded"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium mb-1">Ghi chú</label>
                                    <textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                        rows={3}
                                        placeholder="Nhập ghi chú nếu có"
                                    />
                                </div>
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