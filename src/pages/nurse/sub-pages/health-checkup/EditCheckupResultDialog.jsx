import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { useState, useEffect } from "react";

export default function EditCheckupDialog({ mode, data, open, onOpenChange, onSaved }) {
    const [value, setValue] = useState("");
    const [status, setStatus] = useState("NORMAL");
    const [note, setNote] = useState("");
    const [eventDate, setEventDate] = useState("");

    // Load dữ liệu vào form khi `data` thay đổi
    useEffect(() => {
        if (!data) return;

        if (mode === "item") {
            setValue(data.value || "");
            setStatus(data.status || "NORMAL");
        } else if (mode === "overall") {
            setNote(data.note || "");
            setStatus(data.status || "NO_RESULT");
            setEventDate(data.eventDate || "");
        }
    }, [data, mode]);

    const mutation = useMutation({
        mutationFn: () => {
            if (mode === "item") {
                if (!data?.id) {
                    toast.error("Thiếu ID mục kết quả");
                    throw new Error("Missing item ID");
                }
                return api.patch(`/checkup-results/items/${data.id}`, {
                    value,
                    status,
                });
            } else if (mode === "overall") {
                if (!data?.resultId) {
                    toast.error("Thiếu ID kết quả khám");
                    throw new Error("Missing result ID");
                }
                return api.patch(`/checkup-results/${data.resultId}`, {
                    note,
                    status,
                    eventDate,
                });
            }
        },
        onSuccess: () => {
            toast.success("Cập nhật thành công");
            onSaved();
            onOpenChange(false);
        },
        onError: () => {
            toast.error("Cập nhật thất bại");
        },
    });

    const handleSave = () => {
        mutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <h2 className="text-lg font-semibold mb-4">
                    {mode === "item" ? "Chỉnh sửa kết quả hạng mục" : "Chỉnh sửa kết quả tổng quát"}
                </h2>

                <div className="space-y-4">
                    {mode === "item" && (
                        <>
                            <div>
                                <label className="block mb-1">Kết quả</label>
                                <input
                                    className="w-full border rounded px-2 py-1"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    {mode === "overall" && (
                        <>
                            <div>
                                <label className="block mb-1">Ghi chú</label>
                                <textarea
                                    className="w-full border rounded px-2 py-1"
                                    rows={3}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block mb-1">Ngày khám</label>
                                <input
                                    type="date"
                                    className="w-full border rounded px-2 py-1"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block mb-1">Trạng thái</label>
                        <select
                            className="w-full border rounded px-2 py-1"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        >
                            <option value="NORMAL">Bình thường</option>
                            <option value="ABNORMAL">Theo dõi</option>
                            <option value="SERIOUS">Nguy hiểm</option>
                            <option value="NO_RESULT">Chưa có kết quả</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Lưu
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}