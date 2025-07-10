import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import MedicationDialog from "../../../../components/MedicationDialog.jsx";
import { useNavigate } from "react-router-dom";
import api from "../../../../utils/api.js";
import { toast } from "react-toastify";
export default function MedicationRequestCard({ data, nurseId }) {
    const navigate = useNavigate();
    const handleReceive = async () => {
        try {
            await api.put(`/medication-requests/${data.requestId}/receive`);
            toast.success("Đã nhận thuốc thành công");
        } catch (error) {
            toast.error("Lỗi khi nhận thuốc");
            console.error(error);
        }
    };


    return (
        <div className="flex items-center justify-between border-b py-8 gap-6 font-inter">
            <div className="flex items-center gap-5 w-[40%]">
                <div className="p-2">
                    <Activity size={30} />
                </div>
                <div className="flex flex-col gap-2 leading-relaxed">
                    <p className="font-bold text-lg">
                        {data.student?.studentCode || "N/A"} - {data.student?.fullName || "Không có tên"}
                    </p>
                    <p className="text-md text-black">{data.title || "Không có tiêu đề"}</p>
                    <p className="text-md italic text-black">
                        Ngày tạo: {data.createAt ? dayjs.unix(data.createAt).format("DD/MM/YYYY") : "Không rõ"}
                    </p>
                </div>
            </div>

            <div className="text-md w-[30%] space-y-2 leading-relaxed text-left text-black">
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

            <div className="w-[25%] flex flex-col gap-3 items-center">
                {data.medicationStatus === "PENDING" && (
                    <>
                        <MedicationDialog
                            requestId={data.requestId}
                            actionType="approve"
                            nurseId={nurseId}
                            triggerButton={
                                <button className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]">
                                    Duyệt
                                </button>
                            }
                        />
                        <MedicationDialog
                            requestId={data.requestId}
                            actionType="reject"
                            nurseId={nurseId}
                            triggerButton={
                                <button className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]">
                                    Từ chối
                                </button>
                            }
                        />
                    </>
                )}

                {data.medicationStatus === "DISPENSING" && (
                    <>
                        <MedicationDialog
                            requestId={data.requestId}
                            actionType="deliver"
                            nurseId={nurseId}
                            items={data.items}
                            triggerButton={
                                <button className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]">
                                    Phát thuốc
                                </button>
                            }
                        />
                        <MedicationDialog
                            requestId={data.requestId}
                            actionType="done"
                            nurseId={nurseId}
                            triggerButton={
                                <button className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]">
                                    Đánh dấu đã xong
                                </button>
                            }
                        />
                    </>
                )}

                {["REJECTED", "DONE", "DISABLED", "REVIEWED", "APPROVED"].includes(data.medicationStatus) && (
                    <div className="flex flex-col items-center gap-2">
                <span
                    className={`px-4 py-[6px] rounded-md font-semibold text-center ${
                    data.medicationStatus === "REJECTED"
                    ? "bg-red-100 text-red-600"
                    : data.medicationStatus === "DONE"
                        ? "bg-green-100 text-green-700"
                        : data.medicationStatus === "APPROVED"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-200 text-black"
                }`}
                >
                {data.medicationStatus === "DISABLED"
                ? "Đã hủy"
                : data.medicationStatus === "REVIEWED"
                    ? "Chờ xác nhận"
                    : data.medicationStatus === "REJECTED"
                        ? "Đã từ chối"
                        : data.medicationStatus === "APPROVED"
                            ? "Đã duyệt"
                            : "Hoàn thành"}
                </span>

                        {data.medicationStatus === "APPROVED" && (
                            <button
                                onClick={handleReceive}
                                className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]"
                            >
                                Nhận thuốc
                            </button>
                        )}
                    </div>
                )}


            </div>

            <div
                className="cursor-pointer"
                onClick={() => navigate(`/nurse/medication-requests/${data.requestId}`)}
            >
                <ChevronRight className="text-black hover:scale-110 transition-transform" />
            </div>
        </div>
    );
}
