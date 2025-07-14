import { useQuery } from "@tanstack/react-query";
import { useStudent } from "../../../context/StudentContext.jsx";
import api from "../../../utils/api.js";
import dayjs from "dayjs";
import { useState, useEffect } from "react";
import ParentConsentReply from "./ParentConsentReply.jsx";

export function parseDate(array) {
    if (!Array.isArray(array) || array.length < 3) return null;
    const [year, month, day, hour = 0, minute = 0, second = 0] = array;
    return new Date(year, month - 1, day, hour, minute, second);
}

function extractSchoolYearFromDate(createdAt) {
    const date = parseDate(createdAt);
    if (!date) return "Không rõ";
    const year = date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1;
    return `${year}-${year + 1}`;
}

function getRecentSchoolYears(count = 5) {
    const now = new Date();
    const currentYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;

    const years = [];
    for (let i = 0; i < count; i++) {
        const start = currentYear - i;
        years.push(`${start + 1}-${start + 2}`);
    }
    return years;
}

export default function HealthCheckup() {
    const { selectedStudent } = useStudent();
    const [selectedConsentId, setSelectedConsentId] = useState(null);
    const [showReply, setShowReply] = useState(false);
    const [selectedYear, setSelectedYear] = useState(null);

    const {
        data: rawConsents = [],
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
                    res.data.sort((a, b) => new Date(parseDate(b.createdAt)) - new Date(parseDate(a.createdAt)))
                ),
        onSuccess: (data) => {
            if (data.length > 0) {
                const firstSchoolYear = extractSchoolYearFromDate(data[0].createdAt);
                setSelectedConsentId(data[0].id);
                setSelectedYear(firstSchoolYear);
            }
        },
    });

    const consents = rawConsents.map((c) => ({
        ...c,
        schoolYear: extractSchoolYearFromDate(c.createdAt),
    }));

    const schoolYears = getRecentSchoolYears();

    useEffect(() => {
        if (schoolYears.length > 0 && !selectedYear) {
            setSelectedYear(schoolYears[0]);
        }
    }, [schoolYears, selectedYear]);

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
    } = useQuery({
        enabled: !!selectedConsentId,
        queryKey: ["checkup-result-detail", selectedConsentId],
        queryFn: () =>
            api.get(`/checkup-results/event/${selectedConsentId}`).then((res) => res.data),
    });

    const { data: categoryList = [] } = useQuery({
        queryKey: ["checkup-categories", consentDetail?.eventId],
        enabled: !!consentDetail?.eventId,
        queryFn: () =>
            api.get(`/checkup-categories/by-event/${consentDetail.eventId}`).then((res) => res.data),
    });

    useEffect(() => {
        refetch();
        setSelectedConsentId(null);
    }, [selectedStudent?.studentId]);

    const filteredConsents = consents.filter((c) => c.schoolYear === selectedYear);

    return (
        <div className="w-full py-6 font-inter space-y-5">
            <h1 className="text-xl font-semibold text-[#023E73]">Kết quả khám sức khỏe</h1>

            {isLoading && <p>Đang tải danh sách đơn khám sức khỏe...</p>}
            {isError && <p className="text-red-500">Không thể tải dữ liệu.</p>}
            {!selectedStudent && <p>Vui lòng chọn học sinh để xem kết quả.</p>}

            {consents.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1 space-y-3 w-[90%]">
                        <div className="mb-5">
                            <label className="block text-md font-semibold text-black mb-2">
                                Chọn năm học
                            </label>
                            <select
                                value={selectedYear || ""}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 text-md"
                            >
                                {schoolYears.map((year) => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>

                        {filteredConsents.map((c) => (
                            <div
                                key={c.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => setSelectedConsentId(c.id)}
                                className={`p-5 border border-black rounded-lg cursor-pointer transition
                                    ${c.id === selectedConsentId
                                    ? "bg-[#DAEAF7] border-blue-500 shadow"
                                    : "hover:bg-gray-100"}`}
                            >
                                <p className="text-xl font-semibold mb-1">{c.eventTitle}</p>
                                <div className={`inline-block mt-1 px-3 py-1 mb-1 text-sm font-semibold rounded-xl
                                    ${c.eventStatus === "UPCOMING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : c.eventStatus === "DONE"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-600"}`}>
                                    {c.eventStatus === "UPCOMING" ? "Đã lên lịch"
                                        : c.eventStatus === "DONE" ? "Hoàn thành" : "Không rõ"}
                                </div>

                                <p className="text-md text-gray-800 mt-3 mb-1">Năm học: {c.schoolYear}</p>
                                <p className="text-md text-gray-800">
                                    Ngày khám: {dayjs(parseDate(c.createdAt)).format("DD/MM/YYYY")}
                                </p>

                                {!c.replied && c.eventStatus === "UPCOMING" && (
                                    <p className="text-sm mt-2 text-blue-700 font-medium">📄 Xem đơn đề nghị</p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-3 w-full">
                        {loadingConsent ? (
                            <p className="text-gray-600">Đang tải chi tiết...</p>
                        ) : consentDetail ? (
                            <div className="space-y-6 bg-white rounded-lg shadow p-6">

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-[#023E73]">{consentDetail.eventTitle}</h2>
                                    <p className="text-gray-800">
                                        Ngày tạo: {dayjs(parseDate(consentDetail.createdAt)).format("DD/MM/YYYY")}
                                    </p>
                                    <p className="text-gray-800">Năm học: {extractSchoolYearFromDate(consentDetail.createdAt)}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-md text-black">
                                    <div className="lg:col-span-1 space-y-2">
                                        <p><strong>Học sinh:</strong> {consentDetail.studentName}</p>
                                        <p><strong>Mã học sinh:</strong> {consentDetail.studentCode}</p>
                                        <p><strong>Lớp:</strong> {consentDetail.classCode}</p>
                                        <p><strong>Giới tính:</strong> {consentDetail.gender === "MALE" ? "Nam" : "Nữ"}</p>
                                        <p><strong>Ngày sinh:</strong> {consentDetail.dob}</p>
                                    </div>

                                    <div className="lg:col-span-1 space-y-2">
                                        <p><strong>Phụ huynh:</strong> {consentDetail.parentName}</p>
                                        <p><strong>Email:</strong> {consentDetail.parentEmail}</p>
                                        <p><strong>SĐT:</strong> {consentDetail.parentPhone}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 border rounded space-y-2">
                                    <span className={`font-medium ${
                                        consentDetail.replied
                                            ? consentDetail.consentStatus === "APPROVED"
                                                ? "text-green-600"
                                                : "text-red-500"
                                            : "text-yellow-500"
                                    }`}>
                                        {consentDetail.replied
                                            ? consentDetail.consentStatus === "APPROVED"
                                                ? "Phản hồi của phụ huynh: Tham gia"
                                                : "Phản hồi của phụ huynh: Không tham gia"
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

                                    {consentDetail.replied &&
                                        consentDetail.consentStatus === "APPROVED" &&
                                        consentDetail.categoryConsents?.length > 0 && (
                                            <div className="mt-4 space-y-1">
                                                <p className="text-sm font-medium text-gray-700">Các hạng mục được đồng ý:</p>
                                                <ul className="list-disc list-inside text-sm text-gray-800">
                                                    {consentDetail.categoryConsents
                                                        .filter((item) => item.categoryConsentStatus === "APPROVED")
                                                        .map((item) => (
                                                            <li key={item.categoryId}>{item.categoryName?.trim() || `Hạng mục ID ${item.categoryId}`}</li>
                                                        ))}
                                                </ul>
                                            </div>
                                        )}
                                </div>

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