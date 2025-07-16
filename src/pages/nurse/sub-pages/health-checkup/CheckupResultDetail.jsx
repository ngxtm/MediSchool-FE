import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import api from "@/utils/api";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import {
    Pencil,
    CalendarDays,
    AlertCircle,
    CheckCircle,
    AlertTriangle,
    Search,
    ChevronRight,
    FileText,
} from "lucide-react";
import Loading from "@/components/Loading";
import ReturnButton from "../../../../components/ReturnButton.jsx";
import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import EditCheckupDialog from "./EditCheckupDialog"; // ✅ Dùng dialog mới

function formatDate(dateInput) {
    if (!dateInput) return "N/A";
    try {
        return format(new Date(dateInput), "dd/MM/yyyy", { locale: vi });
    } catch {
        return "N/A";
    }
}

export function parseDate(array) {
    if (!Array.isArray(array) || array.length < 3) return null;
    const [year, month, day, hour = 0, minute = 0, second = 0] = array;
    return new Date(year, month - 1, day, hour, minute, second);
}

export default function HealthCheckupDetail() {
    const [editingResultId, setEditingResultId] = useState(null);
    const [editingItemData, setEditingItemData] = useState(null); // ✅ lưu item cụ thể
    const [editMode, setEditMode] = useState("item"); // 'item' | 'overall'
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const queryClient = useQueryClient();

    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sending, setSending] = useState(false);

    const isConsent = location.pathname.endsWith("/consents");
    const isResult = location.pathname.endsWith("/results");

    const { data: eventData, isLoading } = useQuery({
        queryKey: ["health-checkup", id],
        queryFn: () => api.get(`/health-checkup/${id}`).then((res) => res.data),
    });

    const { data: resultList = [] } = useQuery({
        queryKey: ["checkup-result", id],
        enabled: isResult,
        queryFn: () => api.get(`/checkup-results/event/${id}`).then((res) => res.data),
    });

    const { data: editingResultData } = useQuery({
        queryKey: ["checkup-result-detail", editingResultId],
        enabled: !!editingResultId && isDialogOpen,
        queryFn: () => api.get(`/checkup-results/${editingResultId}`).then((res) => res.data),
    });

    const filteredResults = useMemo(() => {
        if (!isResult || !resultList) return [];
        const lowerSearch = search.toLowerCase();
        return resultList.filter((item) =>
            item.studentName.toLowerCase().includes(lowerSearch) ||
            item.studentCode.toLowerCase().includes(lowerSearch) ||
            item.classCode?.toLowerCase().includes(lowerSearch)
        );
    }, [resultList, isResult, search]);

    if (isLoading || !eventData) return <Loading />;

    const handleEditOverall = (id) => {
        setEditingResultId(id);
        setEditMode("overall");
        setIsDialogOpen(true);
    };

    const handleEditItem = (resultId, item) => {
        setEditingResultId(resultId);
        setEditingItemData(item);
        setEditMode("item");
        setIsDialogOpen(true);
    };

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-bold mb-4">Kết quả khám sức khỏe</h1>
            <input
                type="text"
                className="border px-4 py-2 rounded w-80"
                placeholder="Tìm kiếm học sinh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <table className="w-full text-sm border rounded-md overflow-hidden">
                <thead className="bg-gray-100 font-semibold text-left">
                <tr>
                    <th className="p-3">MSHS</th>
                    <th className="p-3">Học sinh</th>
                    <th className="p-3">Lớp</th>
                    <th className="p-3">Hạng mục</th>
                    <th className="p-3">Ghi chú</th>
                    <th className="p-3 text-center">Thao tác</th>
                </tr>
                </thead>
                <tbody>
                {filteredResults.map((row) => (
                    <tr key={row.resultId} className="border-t hover:bg-gray-50">
                        <td className="p-3">{row.studentCode}</td>
                        <td className="p-3">{row.studentName}</td>
                        <td className="p-3">{row.classCode}</td>
                        <td className="p-3">
                            <ul className="space-y-1">
                                {row.categoryResults.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{item.name}:</span>{" "}
                                            <span className="text-gray-700">{item.value || "—"}</span> -{" "}
                                            <span className="italic text-sm text-gray-600">{item.status}</span>
                                        </div>
                                        <Pencil
                                            size={16}
                                            className="cursor-pointer hover:text-blue-600"
                                            onClick={() => handleEditItem(row.resultId, item)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        </td>
                        <td className="p-3">{row.note || "—"}</td>
                        <td className="p-3 text-center">
                            <Pencil
                                size={18}
                                className="cursor-pointer text-gray-700 hover:text-blue-600"
                                onClick={() => handleEditOverall(row.resultId)}
                            />
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {isDialogOpen && (
                <EditCheckupDialog
                    mode={editMode}
                    open={isDialogOpen}
                    onOpenChange={setIsDialogOpen}
                    data={editMode === "item" ? editingItemData : editingResultData}
                    resultId={editingResultId}
                    onSaved={() => {
                        setIsDialogOpen(false);
                        queryClient.invalidateQueries(["checkup-result", id]);
                    }}
                />
            )}
        </div>
    );
}