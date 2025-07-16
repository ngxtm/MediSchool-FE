import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "@/utils/api";

export default function EditCheckupResultDialog({ section, open, onOpenChange, onSaved }) {
    const [editedResults, setEditedResults] = useState([]);

    useEffect(() => {
        if (section?.details) {
            setEditedResults(section.details.map((item) => ({ ...item })));
        }
    }, [section]);

    const handleChange = (index, value) => {
        const newResults = [...editedResults];
        newResults[index].value = value;
        setEditedResults(newResults);
    };

    const handleSave = async () => {
        try {
            await Promise.all(
                editedResults.map((item) =>
                    api.put(`/checkup-results/items/${item.id}`, { value: item.value })
                )
            );
            toast.success("Đã lưu kết quả khám");
            onSaved?.();
            onOpenChange(false);
        } catch (err) {
            console.error(err);
            toast.error("Lưu thất bại");
        }
    };

    if (!open) return null; // ✅ FIX: chỉ chặn khi đóng

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
                <Dialog.Content className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 w-[90vw] max-w-lg">
                    <Dialog.Title className="text-lg font-bold mb-4">
                        Chỉnh sửa - {section?.categoryName}
                    </Dialog.Title>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {editedResults.map((detail, i) => (
                            <div key={i}>
                                <label className="block font-semibold mb-1">{detail.label}</label>
                                <input
                                    type="text"
                                    value={detail.value || ""}
                                    onChange={(e) => handleChange(i, e.target.value)}
                                    className="w-full border px-3 py-2 rounded-md"
                                />
                                {detail.resultNote && (
                                    <p className="text-sm text-gray-500 mt-1 italic">{detail.resultNote}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Dialog.Close asChild>
                            <button className="px-4 py-2 rounded-md border">Hủy</button>
                        </Dialog.Close>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded-md"
                            onClick={handleSave}
                        >
                            Lưu
                        </button>
                    </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
