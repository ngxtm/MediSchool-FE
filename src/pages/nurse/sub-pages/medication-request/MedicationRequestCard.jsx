import { User, ChevronRight, Activity } from "lucide-react";
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
        <div className="flex items-center justify-between border-b py-8 gap-5 font-inter">
            <div className="flex items-center gap-5 w-[40%]">
                <div className="p-2">
                    <Activity size={30} />
                </div>
                <div className="flex flex-col gap-2 leading-relaxed">
                    <p className="font-bold text-[15px]">
                        {data.student?.studentCode || "N/A"} - {data.student?.fullName || "Không có tên"}
                    </p>
                    <p className="text-[14px] text-black">{data.title || "Không có tiêu đề"}</p>
                    <p className="text-[12px] italic text-black">
                        Ngày tạo: {data.createAt ? dayjs.unix(data.createAt).format("DD/MM/YYYY") : "Không rõ"}
                    </p>
                </div>
            </div>

            <div className="text-sm w-[30%] space-y-2 leading-relaxed text-left text-black">
                <p>
                    <span className="font-semibold">Ngày bắt đầu:</span>{" "}
                    {data.startDate ? dayjs(data.startDate).format("DD/MM/YYYY") : "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Ngày kết thúc:</span>{" "}
                    {data.endDate ? dayjs(data.endDate).format("DD/MM/YYYY") : "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Số loại thuốc:</span>{" "}
                    {(data.items?.length ?? 0).toString().padStart(2, "0")}
                </p>
            </div>

            <div className="flex items-center gap-4 w-[30%] justify-end">
                <button
                    onClick={handleApprove}
                    className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]"
                >
                    Duyệt
                </button>
                <button
                    onClick={handleReject}
                    className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]"
                >
                    Từ chối
                </button>
                <ChevronRight className="text-black" />
            </div>
        </div>
    );
}