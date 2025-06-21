import {
	ChevronDown,
	CircleUserRound,
	Settings,
	LogOut,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import useSignOut from "../../../utils/signout";
import { ToggleGroup } from "radix-ui";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import heartIcon from "../../../assets/heart.png";

const NurseTaskBar = ({ userData }) => {
	const username = userData?.fullName || "N/A";
	const signout = useSignOut();

	const [hoveredTab, setHoveredTab] = useState(null);
	const navigate = useNavigate();
	const location = useLocation();

	const pathParts = location.pathname.split("/");
	let currentTab = pathParts[pathParts.length - 1];

	if (currentTab === "vaccine-list") {
		currentTab = "vaccination";
	}
	if (
		pathParts.includes("nurse") &&
		![
			"student",
			"vaccination",
			"health-checkup",
			"medical-request",
			"medication-event",
		].includes(currentTab)
	) {
		currentTab = "student";
	}
	const handleValueChange = (value) => {
		if (value && value !== currentTab) {
			navigate(`/nurse/${value}`);
		}
	};
	return (
		<div className="flex justify-between items-center bg-[#E8F4FB] p-4 shadow-md px-20 font-inter">
			<div className="flex items-center gap-2">
				<img src={heartIcon} alt="Heart" />
				<p className="font-extrabold text-xl">MediSchool</p>
			</div>
			<ToggleGroup.Root
				className="inline-flex rounded-md justify-between"
				type="single"
				value={currentTab}
				onValueChange={handleValueChange}
				aria-label="Chức năng của phụ huynh"
			>
				{[
					{ value: "student", label: "Học sinh" },
					{ value: "vaccination", label: "Tiêm chủng" },
					{ value: "health-checkup", label: "Khám sức khoẻ" },
					{ value: "medical-request", label: "Dặn thuốc" },
					{ value: "medication-event", label: "Sự kiện y tế" },
				].map(({ value, label }) => {
					const isActive =
						currentTab === value ||
						(currentTab === "nurse" && value === "student")
					const isHovered = hoveredTab === value;
					const shouldShowActive = isActive && (!hoveredTab || isHovered);

					return (
						<ToggleGroup.Item
							key={value}
							className={`flex-1 max-w-fit text-center py-3 px-4 rounded-md transition-colors ${
								shouldShowActive
									? "bg-[#023E73] text-white font-bold"
									: isHovered
									? "bg-[#023E73] text-white font-bold"
									: "hover:bg-[#023E73] hover:text-white hover:font-bold"
							}`}
							value={value}
							aria-label={label}
							onMouseEnter={() => setHoveredTab(value)}
							onMouseLeave={() => setHoveredTab(null)}
						>
							{label}
						</ToggleGroup.Item>
					);
				})}
			</ToggleGroup.Root>
			<div className="flex items-center gap-2">
				<CircleUserRound color="#4d8ab3" size={28} className="mr-1.5" />
				<p>Hi, {username}</p>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button className="flex items-center">
							<ChevronDown size={20} />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content className="bg-white rounded-md p-2 shadow-lg">
							<DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer">
								<div className="flex items-center">
									<p className="pr-4">Cài đặt tài khoản</p>
									<Settings size={16} />
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
							<DropdownMenu.Item className="px-4 py-2 text-red-600 hover:bg-gray-100 rounded cursor-pointer">
								<button
									onClick={signout}
									className="flex items-center justify-between w-full"
								>
									<span>Đăng xuất</span>
									<LogOut size={16} />
								</button>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</div>
	);
};

export default NurseTaskBar;
