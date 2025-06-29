import { User } from "lucide-react";
import { Check, X } from "lucide-react";
import dayjs from "dayjs";

export function MedicationRequestCard({ data }) {
    const handleApprove = () => {
        console.log(`Approving medication request ${data.requestId}`);
    };

    const handleReject = () => {
        console.log(`Rejecting medication request ${data.requestId}`);
    };

    return (
        <div className="w-full p-6 border border-gray-200 rounded-xl flex items-center justify-between gap-6 hover:shadow-md transition-all duration-200 font-inter">
            {/* Avatar Icon */}
            <div className="min-w-[40px] h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-600" />
            </div>

            {/* Nội dung bên trái */}
            <div className="flex-grow flex justify-between items-start gap-2">
                {/* Thông tin học sinh */}
                <div className="flex flex-col gap-1">
                    <p className="text-base font-bold text-gray-800">
                        {data.student?.studentCode || "N/A"} - {data.student?.fullName || "Không có tên"}
                    </p>
                    <p className="text-sm text-gray-700">{data.title || "Không có tiêu đề"}</p>
                    <p className="text-xs text-gray-500 italic">
                        Ngày tạo:{" "}
                        {data.createAt
                            ? dayjs.unix(data.createAt).format("DD/MM/YYYY")
                            : "Không rõ"}
                    </p>
                </div>

                {/* Thời gian & số thuốc */}
                <div className="text-sm text-black space-y-1 text-left min-w-[300px]">
                    <p>
                        <span className="font-medium">Bắt đầu:</span>{" "}
                        {data.startDate ? dayjs(data.startDate).format("DD/MM/YYYY") : "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Kết thúc:</span>{" "}
                        {data.endDate ? dayjs(data.endDate).format("DD/MM/YYYY") : "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Số loại thuốc:</span>{" "}
                        {(data.items?.length ?? 0).toString().padStart(2, "0")}
                    </p>
                </div>
            </div>

            {/* Nút duyệt / từ chối */}
            <div className="flex flex-col gap-2">
                <button
                    type="button"
                    onClick={handleApprove}
                    className="group bg-[#023E73] text-white px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#01294d] active:scale-95 transition-all duration-200"
                >
                    <Check size={16} className="transition-transform duration-200" />
                    Duyệt
                </button>
                <button
                    type="button"
                    onClick={handleReject}
                    className="group bg-[#FBEAEA] text-red-700 px-5 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-100 active:scale-95 transition-all duration-200"
                >
                    <X size={16} className="transition-transform duration-200" />
                    Từ chối
                </button>
            </div>
        </div>
    );
}
