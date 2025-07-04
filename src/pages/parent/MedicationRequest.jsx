import { useQuery } from "@tanstack/react-query";
import { useStudent } from "../../context/StudentContext";
import MedicationRequestDetail from "../../components/MedicationRequestDetail";
import api from "../../utils/api";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

const MedicationRequest = () => {
	const { selectedStudent } = useStudent();
	const [selectedId, setSelectedId] = useState(null);

	const {
		data: requests = [],
		isLoading,
		isError,
		refetch,
	} = useQuery({
		enabled: !!selectedStudent?.studentId,
		queryKey: ["medicationRequests", selectedStudent?.studentId],
		queryFn: () =>
			api
				.get(`/medication-requests/student/${selectedStudent.studentId}`)
				.then((res) => res.data),
		onSuccess: (data) => {
			if (data.length > 0) {
				setSelectedId(data[0].id); // Mặc định chọn đơn đầu tiên
			}
		},
	});

	// Khi đổi học sinh thì reset selectedId
	useEffect(() => {
		setSelectedId(null);
		refetch();
	}, [selectedStudent?.studentId]);

	return (
		<div className="max-w-7xl mx-auto p-6 font-inter">
			{isLoading && <p>Đang tải đơn thuốc...</p>}
			{isError && <p className="text-red-500">Lỗi khi tải dữ liệu.</p>}
			{!selectedStudent && <p>Vui lòng chọn học sinh để xem đơn thuốc.</p>}

			{requests.length > 0 ? (
				<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
					<div className="lg:col-span-1 space-y-3 w-[80%]">
						<h1 className="text-lg font-bold">Danh sách đơn dặn thuốc</h1>
						{requests.map((request) => (
							<div
								key={request.requestId}
								role="button"
								tabIndex={0}
								onClick={() => setSelectedId(request.requestId)}
								onKeyDown={(e) => e.key === "Enter" && setSelectedId(request.id)}
								className={`p-4 border rounded-lg transition cursor-pointer outline-none
								${request.id === selectedId ? "bg-[#DAEAF7] border-blue-500 shadow" : "hover:bg-gray-100"}
								focus:ring-2 focus:ring-blue-300 active:scale-[0.98]`}
							>

								<p className="font-semibold">{request.title}</p>
								<p className="text-xs text-gray-500">
									Bắt đầu:{" "}
									{request.startDate
										? dayjs(request.startDate).format("DD/MM/YYYY")
										: "N/A"}
								</p>
								<p className="text-xs text-gray-500">
									Kết thúc:{" "}
									{request.endDate
										? dayjs(request.endDate).format("DD/MM/YYYY")
										: "N/A"}
								</p>
								<p className="text-xs text-gray-500">
									Số loại thuốc: {(request.items?.length ?? 0).toString().padStart(2, "0")}
								</p>
							</div>
						))}
					</div>

					<div className="lg:col-span-3">
						<div className="w-full">
							{selectedId ? (
								<MedicationRequestDetail id={selectedId} inline />
							) : (
								<p className="text-gray-600 text-sm">Chọn đơn thuốc để xem chi tiết</p>
							)}
						</div>
					</div>
				</div>
			) : (
				<p className="text-gray-600 text-sm">
					Không có đơn thuốc nào cho học sinh này.
				</p>
			)}
		</div>
	);
};

export default MedicationRequest;