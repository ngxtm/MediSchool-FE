import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import api from "../../../../utils/api.js";
import ReturnButton from "../../../../components/ReturnButton.jsx";
import React from "react";

export default function CheckupConsentDetail() {
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
                    <span
                        className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded text-m font-lg font-bold">
						Chưa gửi đơn
					</span>
                );
            case "PENDING":
                return (
                    <span
                        className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded text-m font-lg font-bold">
						Chưa phản hồi
					</span>
                );
            case "APPROVED":
                return (
                    <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded text-m font-lg font-bold">
						Đồng ý
					</span>
                );
            case "REJECTED":
                return (
                    <span className="inline-block bg-red-100 text-red-800 px-4 py-2 rounded text-m font-lg font-bold">
						Từ chối
					</span>
                );
            default:
                return (
                    <span className="inline-block bg-gray-100 text-gray-800 px-4 py-2 rounded text-m font-lg font-bold">
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

    const {
        eventId,
        studentName,
        studentCode,
        classCode,
        consentStatus,
        parentName,
        contactEmail,
        dateOfBirth,
        contactPhone,
        schoolYear,
        createdAt,
        categoryConsents,
    } = data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mt-4 mb-6">
                <ReturnButton linkNavigate={-1} actor="nurse" />
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Khám sức khỏe đầu năm học</h2>
                <p className="mb-2">Ngày tạo đơn: {formatDate(createdAt)}</p>
                <p className="mb-2">Năm học: {schoolYear}</p>
                <span>
					{renderStatusBadge(consentStatus)}
				</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-2">Hạng mục khám sức khỏe</h3>
                    <ul className="space-y-2">
                        {categoryConsents.map((item) => (
                            <li key={item.categoryId} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={item.status === "APPROVED"}
                                    disabled
                                />
                                <label>{item.categoryName}</label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-4">
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold mb-1">Thông tin học sinh</h3>
                        <p>Họ và tên: {studentName}</p>
                        <p>Mã số học sinh: {studentCode}</p>
                        <p>Ngày sinh: {/* Nếu có ngày sinh thì format ở đây */}</p>
                        <p>Lớp: {classCode}</p>
                    </div>
                    <div className="border p-4 rounded-lg">
                        <h3 className="font-semibold mb-1">Thông tin phụ huynh</h3>
                        <p>Họ và tên: {parentName}</p>
                        <p>Email: {contactEmail}</p>
                        <p>Số điện thoại: {contactPhone}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}