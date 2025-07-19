import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import {Download} from "lucide-react";
import api from "@/utils/api";
import Loading from "@/components/Loading";
import React, { useState } from "react";
import ReturnButton from '../../../../components/ReturnButton.jsx'

function formatDate(date) {
    try {
        return format(new Date(date), "dd/MM/yyyy", { locale: vi });
    } catch {
        return "N/A";
    }
}

export default function ManagerCheckupResultDetail() {
    const { resultId } = useParams();

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
        academicYear,
        createdDate,
        eventDate,
        status,
        note,
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

    const statusColorMap = {
        NO_RESULT: "px-3 py-2 bg-gray-300 text-gray-700 font-semibold rounded-lg",
        NORMAL: "px-3 py-2 bg-green-200 text-green-900 text-md font-semibold rounded-lg",
        ABNORMAL: "px-3 py-2 bg-yellow-200 text-yellow-900 text-md font-semibold rounded-lg",
        SERIOUS: "px-3 py-2 bg-red-200 text-red-900 text-md font-semibold rounded-lg",
    };

    const statusOrder = {
        NO_RESULT: 1,
        SERIOUS: 2,
        ABNORMAL: 3,
        NORMAL: 4
    };

    return (
        <div className="max-w-6xl mx-auto font-inter text-gray-900">
            <div className="mt-4 mb-6 flex items-center justify-between">
                <ReturnButton linkNavigate={-1} actor="manager" />
            </div>

            <div className="flex flex-col lg:flex-row justify-between items-start mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-2">{eventTitle}</h1>
                    <p className="mb-2">Ngày tạo đơn: {createdDate}</p>
                    <p className="mb-2">Ngày khám: {eventDate}</p>
                    <p className="mb-2">Năm học: {academicYear}</p>
                    <div className={`rounded-lg py-2`}>
                        <span className={`${statusColorMap[status] || "px-3 py-1 bg-gray-100 text-gray-700"}`}>
                        {status === "NO_RESULT"
                            ? "Chưa có kết quả"
                            : status === "NORMAL"
                                ? "Bình thường"
                                : status === "ABNORMAL"
                                    ? "Theo dõi"
                                    : status === "SERIOUS"
                                        ? "Nguy hiểm"
                                        : "Không rõ"}</span>
                    </div>
                    <p className="mt-3"><strong>Ghi chú: </strong>{note}</p>
                </div>

                <div className="mt-6 lg:mt-0 space-y-3 w-full lg:w-1/3">
                    <div className="border rounded-md p-4">
                        <h2 className="font-semibold mb-2">Thông tin học sinh</h2>
                        <p>Họ và tên: {studentName}</p>
                        <p>Mã số học sinh: {studentCode}</p>
                        <p>Ngày sinh: {formatDate(dob)}</p>
                        <p>Giới tính: {gender === "MALE" ? "Nam" : "Nữ"}</p>
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
                {categoryResults.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]).map((section, index) => (
                    <div key={index} className="border rounded-md">
                        <div className="bg-blue-100 px-4 py-2 flex justify-between items-center rounded-t-md">
                            <div>
                                <p className="font-semibold">{section.name}</p>
                                <p className="text-sm">Trạng thái: {section.status === "NO_RESULT"
                                    ? "Chưa có kết quả"
                                    : section.status === "NORMAL"
                                        ? "Bình thường"
                                        : section.status === "ABNORMAL"
                                            ? "Theo dõi"
                                            : section.status === "SERIOUS"
                                                ? "Nguy hiểm"
                                                : "Không rõ"}</p>
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
        </div>
    );
}