import { DatePicker } from "antd";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery} from "@tanstack/react-query";
import {
    FileText,
    CircleCheckBig,
    CircleAlert,
    Calendar,
    Activity,
    ChevronRight,
    X,
} from "lucide-react";

import api from "../../../../utils/api";
import DetailBox from "../../components/DetailBox"
import Loading from "../../../../components/Loading";
import { toast, Zoom } from "react-toastify";
import { formatDate, parseDate } from "../../../../utils/dateparse";

const HealthCheckup = () => {
    const navigate = useNavigate();
    const [selectedYear, setSelectedYear] = useState(null);

    const toastError = (message) => {
        toast.error(message, {
            position: "bottom-center",
            autoClose: 4000,
            transition: Zoom,
        });
    };

    const { data: stats, isLoading: loadingStats } = useQuery({
        queryKey: ["checkup-stats"],
        queryFn: async () => {
            const res = await api.get("/checkup-consents/statistics");
            return res.data;
        },
        onError: (err) => toastError("Lỗi khi tải thống kê: " + err.message),
    });

    const { data: checkups, isLoading: loadingEvents } = useQuery({
        queryKey: ["checkup-events", selectedYear],
        queryFn: async () => {
            const url = selectedYear
                ? `/checkup-events/year/${selectedYear}`
                : "/checkup-events";
            const res = await api.get(url);
            return res.data;
        },
        onError: (err) => toastError("Lỗi khi tải sự kiện: " + err.message),
        enabled: true,
    });

    const onYearChange = (date, dateStr) => {
        setSelectedYear(dateStr);
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case "SCHEDULED":
                return { text: "Đã lên lịch", color: "bg-[#DAEAF7]" };
            case "IN_PROGRESS":
                return { text: "Đang diễn ra", color: "bg-[#FFFACD]" };
            case "COMPLETED":
                return { text: "Hoàn thành", color: "bg-[#D1FAE5]" };
            default:
                return { text: "Không xác định", color: "bg-gray-200" };
        }
    };

    if (loadingStats || loadingEvents) return <Loading />;

    return (
        <div className="font-inter">
            <div className="flex max-w-full justify-between mb-16">
                <DetailBox title="Đã gửi" icon={<FileText size={28} />} number={stats?.sent || 0} />
                <DetailBox
                    title="Đã phản hồi"
                    icon={<CircleCheckBig size={28} />}
                    number={stats?.responded || 0}
                />
                <DetailBox
                    title="Chưa phản hồi"
                    icon={<CircleAlert size={28} />}
                    number={stats?.pending || 0}
                />
                <DetailBox
                    title="Hạng mục khám"
                    icon={<Calendar size={28} />}
                    number={stats?.checkupItems || 0}
                />
            </div>

            <div className="flex px-[100px] justify-between">
                <div className="flex items-center gap-12">
                    <p className="font-bold text-xl">Năm học</p>
                    <DatePicker
                        placeholder="Chọn năm học"
                        onChange={onYearChange}
                        picker="year"
                        size="large"
                    />
                </div>
                <div className="flex gap-10">
                    <button
                        className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-bold text-base transition-all hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95"
                        onClick={() => navigate("/nurse/checkup-item")}
                    >
                        Xem danh sách Hạng mục
                    </button>
                    <button
                        className="bg-[#023E73] text-white px-7 py-1.5 rounded-lg font-bold text-base transition-all hover:bg-[#01294d] hover:scale-105 hover:shadow-lg active:scale-95"
                        onClick={() => navigate("/nurse/checkup-create")}
                    >
                        Tạo lịch khám mới
                    </button>
                </div>
            </div>

            <div className="flex flex-col justify-center space-y-4 mt-8">
                {checkups && checkups.length > 0 ? (
                    [...checkups]
                        .sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt))
                        .map((event) => {
                            const { text: statusText, color } = getStatusDisplay(event.status);
                            return (
                                <button
                                    key={event.id}
                                    onClick={() => navigate(`/nurse/checkup-event/${event.id}`)}
                                    className="flex w-full justify-between max-w-[80rem] mx-auto border-gray-300 border-b-1 border-t-1 p-6 transition-colors hover:bg-gray-50 cursor-pointer group"
                                >
                                    <div className="flex justify-center gap-10 items-center">
                                        <Activity size={50} />
                                        <div className="flex flex-col gap-2">
                                            <p className="font-bold text-xl">
                                                {event.title || "Không có tiêu đề"}
                                            </p>
                                            <p>Năm học: {event.academicYear}</p>
                                            <p className="italic text-gray-500 text-sm">
                                                Ngày tạo: {formatDate(event.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-10">
                                        <div className="flex flex-col gap-2 min-w-[200px] items-center">
                                            <p className={`text-center ${color} font-bold px-9 py-1 rounded-4xl`}>
                                                {statusText}
                                            </p>
                                            <p className="italic">
                                                Phản hồi: {event.responded}/{event.totalStudents} học sinh
                                            </p>
                                        </div>
                                        <ChevronRight
                                            size={30}
                                            className="transition-transform duration-200 group-hover:translate-x-1 group-hover:scale-110 text-[#023E73]"
                                        />
                                    </div>
                                </button>
                            );
                        })
                ) : (
                    <div className="text-center py-10 bg-[#DAEAF7] flex items-center justify-center mt-24 font-semibold">
                        Không có sự kiện khám sức khỏe nào
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthCheckup;
