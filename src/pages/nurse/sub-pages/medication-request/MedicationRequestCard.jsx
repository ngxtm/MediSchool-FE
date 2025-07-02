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

    const handleDeliver = () => {
        console.log(`Delivering medicine ${data.requestId}`);
    };

    const handleMarkDone = () => {
        console.log(`Marking Done medication request ${data.requestId}`);
    };

    return (
        <div className="flex items-center justify-between border-b py-8 gap-6 font-inter">
            <div className="flex items-center gap-5 w-[45%]">
                <div className="pt-1">
                    <Activity size={30} />
                </div>
                <div className="flex flex-col gap-[6px] leading-relaxed">
                    <p className="font-bold text-lg">
                        {data.student?.studentCode || "N/A"} - {data.student?.fullName || "Không có tên"}
                    </p>
                    <p className="text-m text-black">{data.title || "Không có tiêu đề"}</p>
                    <p className="text-sm italic text-gray-500">
                        Ngày tạo: {data.createAt ? dayjs.unix(data.createAt).format("DD/MM/YYYY") : "Không rõ"}
                    </p>
                </div>
            </div>

            <div className="text-m w-[30%] space-y-1.5 text-left text-black">
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

            <div className="w-[20%] flex text-center justify-center flex-col gap-3 items-center">
                {data.medicationStatus === "PENDING" && (
                    <>
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
                    </>
                )}

                {data.medicationStatus === "APPROVED" && (
                    <>
                        <button
                            onClick={handleDeliver}
                            className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]"
                        >
                            Phát thuốc
                        </button>
                        <button
                            onClick={handleMarkDone}
                            className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]"
                        >
                            Đánh dấu đã xong
                        </button>
                    </>
                )}

                {["REJECTED", "DONE"].includes(data.medicationStatus) && (
                    <span
                        className={`px-4 py-[6px] rounded-md font-semibold ${
                            data.medicationStatus === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                        }`}
                    >
                {data.medicationStatus === "REJECTED" ? "Đã từ chối" : "Đã hoàn thành"}
            </span>
                )}
            </div>

            <div className="w-[5%] pt-1">
                <ChevronRight className="text-black" />
            </div>
        </div>

    );
}