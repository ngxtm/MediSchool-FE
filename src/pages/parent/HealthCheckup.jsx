import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useStudent } from "../../context/StudentContext";
import api from "../../utils/api";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import ParentConsentReply from "./ParentConsentReply.jsx";

export default function HealthCheckup() {
    const { selectedStudent } = useStudent();
    const [selectedConsentId, setSelectedConsentId] = useState(null);
    const [showReply, setShowReply] = useState(false);
    const queryClient = useQueryClient();

    const {
        data: consents = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        enabled: !!selectedStudent?.studentId,
        queryKey: ["healthCheckupConsents", selectedStudent?.studentId],
        queryFn: () =>
            api
                .get(`/checkup-consents/student/${selectedStudent.studentId}`)
                .then((res) =>
                    res.data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                ),
        onSuccess: (data) => {
            if (data.length > 0) {
                setSelectedConsentId(data[0].id);
            }
        },
    });

    const {
        data: consentDetail,
        isLoading: loadingConsent,
        refetch: refetchConsent,
    } = useQuery({
        enabled: !!selectedConsentId,
        queryKey: ["checkup-consent-detail", selectedConsentId],
        queryFn: () =>
            api.get(`/checkup-consents/consent/${selectedConsentId}`).then((res) => res.data),
    });

    const {
        data: resultDetail,
        isLoading: loadingResult,
        isError: errorResult,
        refetch: refetchResult,
    } = useQuery({
        enabled: !!selectedConsentId,
        queryKey: ["checkup-result-detail", selectedConsentId],
        queryFn: () =>
            api.get(`/checkup-results/event/${selectedConsentId}`).then((res) => res.data),
    });

    useEffect(() => {
        setSelectedConsentId(null);
        refetch();
    }, [selectedStudent?.studentId]);

    return (
        <div className="w-full py-6 font-inter space-y-5">
            <h1 className="text-xl font-semibold text-[#023E73]">Kết quả khám sức khỏe</h1>

            {isLoading && <p>Đang tải danh sách đơn khám sức khỏe...</p>}
            {isError && <p className="text-red-500">Không thể tải dữ liệu.</p>}
            {!selectedStudent && <p>Vui lòng chọn học sinh để xem kết quả.</p>}

            {consents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-3 w-[90%]">
                        {consents.map((c) => (
                            <div
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedConsentId(c.id)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && setSelectedConsentId(c.id)
                                }
                                className={`p-4 border rounded-lg transition cursor-pointer outline-none
								${c.id === selectedConsentId
                                    ? "bg-[#DAEAF7] border-blue-500 shadow"
                                    : "hover:bg-gray-100"
                                }
								focus:ring-2 focus:ring-blue-300 active:scale-[0.98]`}
                            >
                                <p className="font-semibold">{c.eventTitle}</p>
                                <p className="text-xs text-gray-500">Năm học: {c.schoolYear}</p>
                                <p className="text-xs text-gray-500">
                                    Trạng thái:{" "}
                                    <span className="font-medium text-blue-700">
                                        {c.consentStatus}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Detail */}
                    <div className="lg:col-span-3 w-full">
                        {loadingConsent ? (
                            <p className="text-gray-600">Đang tải chi tiết...</p>
                        ) : consentDetail ? (
                            <div className="space-y-6 bg-white rounded-lg shadow p-6">
                                {/* Event Info */}
                                <div className="space-y-1">
                                    <h2 className="text-xl font-bold text-[#023E73]">
                                        {consentDetail.eventTitle}
                                    </h2>
                                    <p className="text-gray-600">
                                        Ngày tạo:{" "}
                                        {dayjs(consentDetail.createdAt).format("DD/MM/YYYY")}
                                    </p>
                                    <p className="text-gray-600">Năm học: {consentDetail.schoolYear}</p>
                                </div>

                                {/* Student Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                    <p><strong>Học sinh:</strong> {consentDetail.studentName}</p>
                                    <p><strong>Mã học sinh:</strong> {consentDetail.studentCode}</p>
                                    <p><strong>Lớp:</strong> {consentDetail.classCode}</p>
                                    <p><strong>Giới tính:</strong> {consentDetail.gender}</p>
                                    <p><strong>Ngày sinh:</strong> {consentDetail.dob}</p>
                                    <p><strong>Phụ huynh:</strong> {consentDetail.parentName}</p>
                                    <p><strong>Email:</strong> {consentDetail.parentEmail}</p>
                                    <p><strong>SĐT:</strong> {consentDetail.parentPhone}</p>
                                </div>

                                {/* Consent Info */}
                                <div className="p-4 bg-gray-50 border rounded space-y-2">
                                    <h3 className="font-semibold text-gray-800">Phản hồi phụ huynh:</h3>
                                        <span className={`font-medium ${
                                            consentDetail.replied
                                                ? consentDetail.consentStatus === "APPROVED"
                                                    ? "text-green-600"
                                                    : "text-red-500"
                                                : "text-yellow-500"
                                        }`}>
                                            {consentDetail.replied
                                                ? consentDetail.consentStatus === "APPROVED"
                                                    ? "Đồng ý"
                                                    : "Từ chối"
                                                : "Chưa phản hồi"}
                                        </span>

                                    {!consentDetail.replied && (
                                        <div className="mt-4">
                                            <button
                                                onClick={() => setShowReply(true)}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                            >
                                                Xem đơn đề nghị
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Result Section */}
                                {consentDetail.eventStatus === "DONE" && resultDetail?.categoryResults?.length > 0 && (
                                    <div className="space-y-6 pt-4">
                                        <h3 className="text-lg font-bold text-[#023E73]">Kết quả khám</h3>
                                        {resultDetail.categoryResults.map((cat, idx) => (
                                            <div key={idx} className="border rounded-md overflow-hidden">
                                                <div className="bg-blue-50 px-4 py-2 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold">{cat.name}</p>
                                                        <p className="text-sm text-gray-600">Người thực hiện: {cat.doctor}</p>
                                                    </div>
                                                    <p className="font-semibold text-blue-700 text-sm">{cat.overallStatus}</p>
                                                </div>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                    {cat.items.map((item, i) => (
                                                        <tr key={i} className="border-t">
                                                            <td className="p-3 w-1/3 font-medium">{item.name}</td>
                                                            <td className="p-3 text-gray-800">
                                                                {item.value}{item.unit ? ` (${item.unit})` : ""}
                                                            </td>
                                                            <td className="p-3 text-gray-700">{item.status}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-600">Chọn đơn khám sức khỏe để xem chi tiết.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-gray-600 text-sm">Không có đơn khám sức khỏe nào cho học sinh này.</p>
            )}

            {/* Consent Reply Popup */}
            {showReply && consentDetail && (
                <ParentConsentReply
                    consentDetail={consentDetail}
                    onClose={() => setShowReply(false)}
                    refetch={refetchConsent}
                />
            )}
        </div>
    );
}