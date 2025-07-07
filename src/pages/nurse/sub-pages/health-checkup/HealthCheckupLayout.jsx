import { useQuery } from "@tanstack/react-query";
import { useLocation, Outlet } from "react-router-dom";
import { FileText, CheckCheck, AlertTriangle, Calendar } from "lucide-react";

export default function HealthCheckupLayout() {
	const location = useLocation();
	const isDetailPage = /^\/nurse\/health-checkup\/\d+$/.test(location.pathname);

	const { data, isLoading } = useQuery({
		queryKey: ["checkup-summary"],
		queryFn: async () => (await api.get("/checkup-events/stats")).data,
	});

	return (
		<div className="font-inter">
			{!isDetailPage && (
				<div className="grid grid-cols-4 gap-15 mb-8">
					{[
						{ label: "Đã gửi", icon: <FileText />, value: data?.sent || 0 },
						{ label: "Đã phản hồi", icon: <CheckCheck />, value: data?.replied || 0 },
						{ label: "Chưa phản hồi", icon: <AlertTriangle />, value: data?.notReplied || 0 },
						{ label: "Hạng mục khám", icon: <Calendar />, value: data?.categories || 0 },
					].map((item, i) => (
						<div key={i} className="bg-[#DAEAF7] rounded-xl p-6">
							<div className="flex justify-between items-center mb-3">
								<p className="font-semibold">{item.label}</p>
								{item.icon}
							</div>
							<p className="text-2xl font-bold">{item.value}</p>
						</div>
					))}
				</div>
			)}

			<Outlet />
		</div>
	);
}
