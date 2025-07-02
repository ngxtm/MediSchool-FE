import { Activity, ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import { useState } from "react";
import MedicationDialog from "./MedicationDialog";

export default function MedicationRequestCard({ data }) {
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState(""); // approve, reject, deliver, done

    const handleOpen = (type) => {
        setDialogType(type);
        setOpenDialog(true);
    };

    return (
        <div className="flex items-center justify-between border-b py-8 gap-5 font-inter">
            {/* Left Section */}
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

            {/* Middle Section */}
            <div className="text-sm w-[30%] space-y-2 leading-relaxed text-left text-black">
                <p>
                    <span className="font-semibold">Ngày bắt đầu:</span> {data.startDate ? dayjs(data.startDate).format("DD/MM/YYYY") : "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Ngày kết thúc:</span> {data.endDate ? dayjs(data.endDate).format("DD/MM/YYYY") : "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Số loại thuốc:</span> {(data.items?.length ?? 0).toString().padStart(2, "0")}
                </p>
            </div>

            {/* Right Section */}
            <div className="flex flex-col items-center justify-center gap-4">
                {data.medicationStatus === "PENDING" && (
                    <>
                        <button onClick={() => handleOpen("approve")} className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]">
                            Duyệt
                        </button>
                        <button onClick={() => handleOpen("reject")} className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]">
                            Từ chối
                        </button>
                    </>
                )}

                {data.medicationStatus === "APPROVED" && (
                    <>
                        <button onClick={() => handleOpen("deliver")} className="bg-[#023E73] text-white px-4 py-[6px] rounded-md font-semibold hover:bg-[#01294d]">
                            Phát thuốc
                        </button>
                        <button onClick={() => handleOpen("done")} className="bg-[#EDF3F8] text-[#000000] px-4 py-[6px] rounded-md font-semibold hover:bg-[#dceaf6]">
                            Đánh dấu đã xong
                        </button>
                    </>
                )}

                {["REJECTED", "DONE"].includes(data.medicationStatus) && (
                    <span
                        className={`px-4 py-[6px] rounded-md font-semibold text-center w-[120px] ${
                            data.medicationStatus === "REJECTED"
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-700"
                        }`}
                    >
            {data.medicationStatus === "REJECTED" ? "Đã từ chối" : "Đã hoàn thành"}
          </span>
                )}
            </div>

            <div>
                <ChevronRight className="text-black" />
            </div>

            <MedicationDialog
                open={openDialog}
                onOpenChange={setOpenDialog}
                title={
                    dialogType === "approve"
                        ? "Xác nhận duyệt đơn"
                        : dialogType === "reject"
                            ? "Lý do từ chối"
                            : dialogType === "deliver"
                                ? "Xác nhận phát thuốc"
                                : "Xác nhận hoàn thành"
                }
            >
                <form className="flex flex-col gap-4">
                    {dialogType === "reject" && (
                        <textarea
                            placeholder="Nhập lý do từ chối..."
                            className="border rounded-md px-3 py-2 w-full resize-none"
                        />
                    )}
                    <button
                        type="submit"
                        className="bg-[#023E73] text-white px-4 py-2 rounded-md hover:bg-[#01294d]"
                    >
                        Xác nhận
                    </button>
                </form>
            </MedicationDialog>
        </div>
    );
}
