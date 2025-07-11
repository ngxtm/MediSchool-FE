import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Loading from "@/components/Loading";
import {
	ArrowLeft,
	FileText,
	CalendarDays,
	AlertCircle,
	CheckCircle,
	AlertTriangle
} from 'lucide-react'
import { format } from "date-fns";
import vi from "date-fns/locale/vi";

function formatDate(dateInput) {
	if (!dateInput) return "N/A";
	try {
		return format(new Date(dateInput), "dd/MM/yyyy", { locale: vi });
	} catch {
		return "N/A";
	}
}

export default function HealthCheckupDetail() {
	const navigate = useNavigate();
	const { id } = useParams();

	const { data: eventData, isLoading } = useQuery({
		queryKey: ['health-checkup', id],
		queryFn: () => api.get(`/health-checkup/${id}`).then(res => res.data),
	});

	const { data: categoryList = [] } = useQuery({
		queryKey: ['checkup-categories', id],
		queryFn: () => api.get(`/checkup-categories/by-event/${id}`).then(res => res.data),
	});

	if (isLoading || !eventData) return <Loading />;

	const {
		eventTitle,
		schoolYear,
		startDate,
		endDate,
		createdAt,
		createdBy,
		totalSent = 0,
		totalReplied = 0,
	} = eventData;

	const notReplied = Math.max(totalSent - totalReplied, 0);

	return (
		<div className="max-w-screen-xl mx-auto font-inter text-gray-900">
			<div className="mb-6">
				<button
					onClick={() => navigate(-1)}
					className={`group border px-8 py-1 rounded-3xl font-bold text-base flex items-center gap-4 transition-all duration-200 bg-[#023E73] text-white`}
				>
					<ArrowLeft
						size={20}
						className="transition-transform duration-200 group-hover:-translate-x-1 text-white"
					/>
					Trở về
				</button>
				<h1 className="text-2xl font-bold mt-6 mb-2">{eventTitle}</h1>
				<p className="text-gray-600 mb-2 text-md">Năm học: {schoolYear}</p>
				<span className="inline-block mt-2 px-4 py-1 bg-[#E3F2FD] text-[#1565C0] rounded-full text-sm font-semibold">
          		Đang diễn ra
				</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<h2 className="text-base text-xl font-bold mb-3">Thông tin chung</h2>
					<div className="space-y-3 w-[80%]">
						<div className="flex items-center justify-between bg-[#E3F2FD] px-6 py-3 rounded-md">
							<span className="text-m font-bold text-black">Ngày bắt đầu</span>
							<span>{formatDate(startDate)}</span>
						</div>
						<div className="flex items-center justify-between bg-[#FFFFFF] px-6 py-3 rounded-md">
							<span className="text-m font-bold text-black">Ngày kết thúc</span>
							<span>{formatDate(endDate)}</span>
						</div>
						<div className="flex items-center justify-between bg-[#E3F2FD] px-6 py-3 rounded-lg">
							<span className="text-m font-bold text-black">Ngày tạo sự kiện</span>
							<span>{formatDate(createdAt)}</span>
						</div>
						<div className="flex items-center justify-between bg-[#FFFFFF] px-6 py-3 rounded-lg">
							<span className="text-m font-bold text-black">Người phụ trách</span>
							<span>{createdBy?.fullName || "Không rõ"}</span>
						</div>
					</div>

					<h2 className="text-base text-xl font-bold mt-6 mb-3 w-[80%]">Hạng mục khám</h2>
					<div className="flex flex-wrap gap-2">
						{categoryList.map((cat) => (
							<span
								key={cat.id}
								className="bg-[#E3F2FD] text-[#0D47A1] px-4 py-1 rounded-full text-m font-medium"
							>
								{cat.name}
							</span>
						))}
					</div>
				</div>

				<div>
					<h2 className="text-base text-xl font-bold mb-3">Mức độ phản hồi</h2>
					<div className="bg-yellow-100 text-yellow-900 font-bold px-4 py-3 rounded-md mb-8 flex items-center gap-2">
						<AlertCircle size={18} />
						<span>Chưa có phản hồi từ {notReplied}/{totalSent} phụ huynh</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-5 mb-5">
						{[
							{
								label: "Đã gửi",
								icon: <FileText size={20} className="text-[#0D47A1]" />,
								value: totalSent,
								bg: "bg-[#DAEAF7]",
							},
							{
								label: "Đã phản hồi",
								icon: <CheckCircle size={20} className="text-[#2E7D32]" />,
								value: totalReplied,
								bg: "bg-[#C8E6C9]",
							},
							{
								label: "Chưa phản hồi",
								icon: <AlertTriangle size={20} className="text-[#F57C00]" />,
								value: notReplied,
								bg: "bg-[#D9D9D9]",
							},
							{
								label: "Hạng mục khám",
								icon: <CalendarDays size={20} className="text-[#6D4C41]" />,
								value: categoryList.length,
								bg: "bg-[#F9F9F9]"
							},
						].map((item, i) => (
							<div key={i} className={`${item.bg} rounded-xl p-5`}>
								<div className="flex justify-between items-center mb-2">
									<p className="font-semibold text-md text-black">{item.label}</p>
									{item.icon}
								</div>
								<p className="text-2xl font-bold text-gray-900">{item.value}</p>
							</div>
						))}
					</div>

					<div className="flex gap-4 justify-center">
						<button className="bg-[#023E73] text-white px-13 py-3 rounded-xl font-semibold hover:bg-[#034a8a]">
							Xem danh sách đơn
						</button>
						<button className="bg-[#023E73] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#034a8a]">
							Xem hồ sơ khám sức khỏe
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}