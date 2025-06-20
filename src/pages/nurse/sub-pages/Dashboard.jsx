import DetailBox from "../components/DetailBox";
import { User, FileText, Package, CircleAlert } from "lucide-react";
import * as Progress from "@radix-ui/react-progress";
const Dashboard = () => {
	return (
		<>
			<div className="flex max-w-full justify-between mb-16">
				<DetailBox
					title="Tổng số học sinh"
					icon={<User size={28} />}
					number="10"
					subText="+2 học sinh mới tháng này"
				/>
				<DetailBox
					title="Giấy đồng thuận"
					icon={<FileText size={28} />}
					number="10"
					subText="đang xử lý"
				/>
				<DetailBox
					title="Đơn dặn thuốc"
					icon={<Package size={28} />}
					number="10"
					subText="đang xử lý"
				/>
				<DetailBox
					title="Sự kiện y tế"
					icon={<CircleAlert size={28} />}
					number="10"
					subText="tuần này"
				/>
			</div>
			<div>
				<div>
					<p className="font-bold text-xl">
						Tổng quan tình trạng sức khoẻ toàn trường
					</p>
				</div>
				<span></span>
				<Progress.Root
					className="relative overflow-hidden bg-gray-200 rounded-full w-[300px] h-4"
					value={50}
				>
					<Progress.Indicator
						className="bg-blue-600 h-full transition-transform duration-500"
						style={{ transform: `translateX(-${100 - 50}%)` }}
					/>
				</Progress.Root>
			</div>
		</>
	);
};

export default Dashboard;
