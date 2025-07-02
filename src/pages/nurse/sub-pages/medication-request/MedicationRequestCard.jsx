import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import MedicationDialog from "./MedicationDialog";

export default function MedicationRequestCard({ data, nurseId }) {
    return (
        <div className="flex items-center justify-between border-b py-8 gap-6 font-inter">
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

                {data.medicationStatus === "APPROVED" && (
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

                {["REJECTED", "DONE"].includes(data.medicationStatus) && (
                    <span
                        className={`px-4 py-[6px] rounded-md font-semibold text-center ${
                            data.medicationStatus === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                        }`}
                    >
                        {data.medicationStatus === "REJECTED" ? "Đã từ chối" : "Hoàn thành"}
                    </span>
                )}
            </div>

            <div>
                <ChevronRight className="text-black" />
            </div>
        </div>
    );
}
