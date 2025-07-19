import { useQuery } from "@tanstack/react-query";
import { useLocation, Outlet } from "react-router-dom";
import { FileText, CheckCheck, AlertTriangle, Calendar } from "lucide-react";
import api from '../../../../utils/api.js'

export default function HealthCheckupLayout() {
	const location = useLocation();
	const isDetailPage = /^\/nurse\/health-checkup(\/consent)?\/\d+$/.test(location.pathname);
	const isConsent = location.pathname.endsWith("/consents");
	const isResult = location.pathname.endsWith("/results");

	const { data, isLoading } = useQuery({
		queryKey: ["checkup-summary"],
		queryFn: async () => (await api.get("/health-checkup/stats")).data,
	});

	return (
		<div className="font-inter items-center justify-center max-h-[90%]">
			{!isDetailPage && !isConsent && !isResult && (
				<div className="grid grid-cols-4 gap-15 mb-8">
					{[
						{ label: "Đã gửi", icon: <FileText />, value: data?.sent || 0, subtext: "đơn đề nghị" },
						{ label: "Đã phản hồi", icon: <CheckCheck />, value: data?.replied || 0, subtext: "đơn đề nghị" },
						{ label: "Chưa phản hồi", icon: <AlertTriangle />, value: data?.pending || 0, subtext: "đơn đề nghị" },
						{ label: "Hạng mục khám", icon: <Calendar />, value: data?.categories || 0, subtext: "toàn trường" },
					].map((item, i) => (
						<div key={i} className="bg-[#DAEAF7] rounded-xl p-6">
							<div className="flex justify-between items-center mb-3">
								<p className="font-semibold">{item.label}</p>
								{item.icon}
							</div>
							<p className="text-2xl font-bold mb-2">{item.value}</p>
							<p className="text-sm text-gray-700 mt-2">
								{item.subtext}
							</p>

						</div>
					))}
				</div>
			)}

			<Outlet />
		</div>
	);
}
