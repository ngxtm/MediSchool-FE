import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import Loading from "@/components/Loading";
import { ArrowLeft, FileText, CalendarDays, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react'
import { format } from "date-fns";
import vi from "date-fns/locale/vi";

function formatDate(dateStr) {
	try {
		return format(new Date(dateStr), "dd/MM/yyyy", { locale: vi });
	} catch {
		return "N/A";
	}
}

export default function HealthCheckupDetail() {
	const navigate = useNavigate();
	const { id } = useParams();

	const { data, isLoading } = useQuery({
		queryKey: ['health-checkup', id],
		queryFn: () => api.get(`/health-checkup/${id}`).then(res => res.data),
	});

	if (isLoading || !data) return <Loading />;

	const {
		eventTitle,
		schoolYear,
		startDate,
		endDate,
		createdAt,
		totalSent = 0,
		totalReplied = 0,
		categories = [],
	} = data;

	const notReplied = Math.max(totalSent - totalReplied, 0);

	return (
		<div className="p-6 md:p-10 max-w-screen-xl mx-auto font-inter text-gray-900">
			<div className="mb-6"><div className="mb-5">
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
			</div>
				<h1 className="text-2xl font-bold mb-2">{eventTitle}</h1>
				<p className="text-gray-600 mb-2 text-md">Năm học: {schoolYear}</p>
				<span className="inline-block mt-2 px-4 py-1 bg-[#E3F2FD] text-[#1565C0] rounded-full text-sm font-semibold">
          		Đang diễn ra</span>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<div>
					<h2 className="text-base text-xl font-bold mb-3">Thông tin chung</h2>
					<div className="space-y-4 w-[80%]">
						<div className="flex items-center justify-between bg-[#E3F2FD] px-6 py-3 rounded-md">
							<span className="text-m font-bold text-black">Ngày bắt đầu</span>
							<span>{formatDate(startDate)}</span>
						</div>
						<div className="flex items-center justify-between bg-[#E3F2FD] px-6 py-3 rounded-md">
							<span className="text-m font-bold text-black">Ngày kết thúc</span>
							<span>{formatDate(endDate)}</span>
						</div>
						<div className="flex items-center justify-between bg-[#E3F2FD] px-6 py-3 rounded-lg">
							<span className="text-m font-bold text-black">Ngày tạo sự kiện</span>
							<span>{formatDate(createdAt)}</span>
						</div>
					</div>

					<h2 className="text-base text-xl font-bold mt-6 mb-2">Hạng mục khám</h2>
					<div className="flex flex-wrap gap-2">
						{categories.map((cat, idx) => (
							<span
								key={idx}
								className="bg-[#E3F2FD] text-[#0D47A1] px-4 py-1 rounded-full text-sm font-medium"
							>
                {cat}
              </span>
						))}
					</div>
				</div>

				<div>
					<h2 className="text-base text-xl rounded-lg font-bold mb-3 mb-2">Mức độ phản hồi</h2>
					<div className="bg-yellow-100 text-yellow-900 font-bold px-4 py-3 rounded-md mb-4 flex items-center gap-2">
						<AlertCircle size={18} />
						<span>Chưa có phản hồi từ {notReplied}/{totalSent} phụ huynh</span>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-5">
						{[
							{
								label: "Đã gửi",
								icon: <FileText size={20} className="text-[#0D47A1]" />,
								value: data?.sent ?? 0,
								bg: "bg-[#DAEAF7]",
							},
							{
								label: "Đã phản hồi",
								icon: <CheckCircle size={20} className="text-[#2E7D32]" />,
								value: data?.replied ?? 0,
								bg: "bg-[#C8E6C9]",
							},
							{
								label: "Chưa phản hồi",
								icon: <AlertTriangle size={20} className="text-[#F57C00]" />,
								value: data?.notReplied ?? 0,
								bg: "bg-[#D9D9D9]",
							},
							{
								label: "Hạng mục khám",
								icon: <CalendarDays size={20} className="text-[#6D4C41]" />,
								value: data?.categories?.length ?? 0,
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
						<button className="bg-[#023E73] text-white rounded px-14 py-3 rounded-xl text-md font-semibold hover:bg-[#034a8a]">
							Xem danh sách đơn
						</button>
						<button className="bg-[#023E73] text-white rounded px-6 py-3 rounded-xl text-md font-semibold hover:bg-[#034a8a]">
							Xem hồ sơ khám sức khỏe
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}