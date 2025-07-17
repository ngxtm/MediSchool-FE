import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import api from "../../../../utils/api.js";
import ReturnButton from "../../../../components/ReturnButton.jsx";
import React from "react";

export default function ManagerCheckupConsentDetail() {
    const { id } = useParams();

    const { data, isLoading, error } = useQuery({
        queryKey: ["checkup-consent", id],
        queryFn: async () => {
            const res = await api.get(`/checkup-consents/consent/${id}`);
            return res.data;
        },
    });

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p>Đã xảy ra lỗi khi tải dữ liệu.</p>;

    function renderStatusBadge(consentStatus) {
        switch (consentStatus) {
            case "NOT_SENT":
                return (
                    <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded font-bold">
						Chưa gửi đơn
					</span>
                );
            case "PENDING":
                return (
                    <span className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded font-bold">
						Chưa phản hồi
					</span>
                );
            case "APPROVED":
                return (
                    <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
						Đồng ý
					</span>
                );
            case "REJECTED":
                return (
                    <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded font-bold">
						Từ chối
					</span>
                );
            default:
                return (
                    <span className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded font-bold">
						Không rõ
					</span>
                );
        }
    }

    function formatDate(dateInput) {
        if (!dateInput) return "N/A";
        try {
            return format(new Date(dateInput), "dd/MM/yyyy", { locale: vi });
        } catch {
            return "N/A";
        }
    }

    function parseDateToString(dateArray) {
        if (!Array.isArray(dateArray) || dateArray.length < 3) return "N/A";
        const [year, month, day] = dateArray;
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    }

    const {
        eventId,
        studentName,
        studentCode,
        classCode,
        consentStatus,
        parentName,
        parentEmail,
        parentPhone,
        contactEmail,
        dob,
        contactPhone,
        schoolYear,
        createdAt,
        categoryConsents,
    } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <ReturnButton linkNavigate={-1} actor="manager" />
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Khám sức khỏe đầu năm học</h2>
                <p className="mb-2">Ngày tạo đơn: {parseDateToString(createdAt)}</p>
                <p className="mb-2">Năm học: {schoolYear}</p>
                {renderStatusBadge(consentStatus)}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3">Hạng mục khám sức khỏe</h3>
                    <ul className="space-y-2">
                        {[...categoryConsents]
                            .sort((a, b) => {
                                if (a.categoryConsentStatus === "APPROVED" && b.categoryConsentStatus !== "APPROVED") return -1;
                                if (a.categoryConsentStatus !== "APPROVED" && b.categoryConsentStatus === "APPROVED") return 1;
                                return 0;
                            }).map((item) => (
                            <li key={item.categoryId} className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={item.categoryConsentStatus === "APPROVED"}
                                    disabled
                                    className="w-4 h-4 accent-blue-600"
                                />
                                <span
                                    className={`${
                                        item.categoryConsentStatus === "APPROVED"
                                            ? "text-green-700 font-semibold"
                                            : "text-red-500 line-through"
                                    }`}
                                >
									{item.categoryName.trim()}
								</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <div className="border p-6 rounded-lg">
                        <h3 className="font-semibold mb-2">Thông tin học sinh</h3>
                        <p className="mb-2">Họ và tên: {studentName}</p>
                        <p className="mb-2">Mã số học sinh: {studentCode}</p>
                        <p className="mb-2">Ngày sinh: {formatDate(dob)}</p>
                        <p className="mb-2">Lớp: {classCode}</p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Thông tin phụ huynh</h3>
                        <p className="mb-2">Họ và tên: {parentName}</p>
                        <p className="mb-2">Email: {parentEmail}</p>
                        <p className="mb-2">Số điện thoại: {parentPhone}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}