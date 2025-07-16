import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { ArrowLeft, Download, Pencil } from "lucide-react";
import api from "@/utils/api";
import Loading from "@/components/Loading";
import { useState } from "react";
import EditCheckupResultDialog from "./EditCheckupResultDialog";

function formatDate(date) {
    try {
        return format(new Date(date), "dd/MM/yyyy", { locale: vi });
    } catch {
        return "N/A";
    }
}

export default function CheckupResultDetail() {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [editingSection, setEditingSection] = useState(null);

    if (!resultId) {
        return <p className="text-center text-red-500 mt-10">Không tìm thấy kết quả khám sức khỏe.</p>;
    }

    const { data, isLoading, isError } = useQuery({
        queryKey: ["checkup-result-detail", resultId],
        queryFn: () => api.get(`/checkup-results/${resultId}`).then(res => res.data),
    });

    if (isLoading) return <Loading />;

    if (isError || !data) {
        return <p className="text-center text-red-500 mt-10">Không thể tải dữ liệu kết quả khám sức khỏe.</p>;
    }

    const {
        eventTitle,
        schoolYear,
        formDate,
        statusLabel,
        studentName,
        studentCode,
        classCode,
        gender,
        dob,
        parentName,
        parentEmail,
        parentPhone,
        categoryResults = [],
    } = data;

    return (
        <div className="max-w-6xl mx-auto p-6 font-inter text-gray-900">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-4"
            >
                <ArrowLeft size={16} /> Trở về
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{eventTitle}</h1>
                    <p className="text-gray-600 mb-2">Ngày tạo đơn: {formatDate(formDate)}</p>
                    <p className="text-gray-600 mb-2">Năm học: {schoolYear}</p>
                    <div className="flex gap-2">
                        <span className="bg-blue-100 text-blue-800 px-4 py-1 rounded-full text-sm font-semibold">
                            {statusLabel}
                        </span>
                        <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-semibold">
                            Theo dõi
                        </span>
                    </div>
                </div>

                <div className="mt-6 lg:mt-0 space-y-3 w-full lg:w-1/3">
                    <div className="border rounded-md p-4">
                        <h2 className="font-semibold mb-2">Thông tin học sinh</h2>
                        <p>Họ và tên: {studentName}</p>
                        <p>Mã số học sinh: {studentCode}</p>
                        <p>Ngày sinh: {formatDate(dob)}</p>
                        <p>Giới tính: {gender}</p>
                        <p>Lớp: {classCode}</p>
                    </div>

                    <div className="border rounded-md p-4">
                        <h2 className="font-semibold mb-2">Thông tin phụ huynh</h2>
                        <p>Họ và tên: {parentName}</p>
                        <p>Email: {parentEmail}</p>
                        <p>Số điện thoại: {parentPhone}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 mb-8">
                {categoryResults.map((section, index) => (
                    <div key={index} className="border rounded-md">
                        <div className="bg-blue-100 px-4 py-2 flex justify-between items-center rounded-t-md">
                            <div>
                                <p className="font-semibold">{section.name}</p>
                                <p className="text-sm">Trạng thái: {section.status}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setEditingSection(section)}
                                    className="text-blue-600 hover:underline text-sm flex items-center"
                                >
                                    <Pencil className="w-4 h-4 mr-1" />
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>

                        <div className="p-4">
                            <p className="font-medium">Kết quả: {section.value ?? "Chưa có"}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => console.log("Xuất PDF")}
                    className="bg-[#023E73] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#034a8a]"
                >
                    <Download className="inline-block mr-2" size={16} />
                    Xuất PDF
                </button>
            </div>

            <EditCheckupResultDialog
                section={editingSection}
                open={!!editingSection}
                onOpenChange={(open) => !open && setEditingSection(null)}
                onSaved={() => window.location.reload()} // hoặc refetch nếu đúng hook
            />
        </div>
    );
}