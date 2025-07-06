import { ChevronDown, CircleUserRound, Settings, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import useSignOut from '../../../utils/signout'
import { ToggleGroup } from 'radix-ui'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import heartIcon from '../../../assets/heart.png'
import useActorNavigation from '../../../hooks/useActorNavigation'

const ManagerTaskBar = ({ userData }) => {
	const [hoveredTab, setHoveredTab] = useState(null)
	const username = userData?.fullName || 'N/A'
	const signout = useSignOut()
	const navigate = useNavigate()
	const location = useLocation()

	const { navigateWithHistory } = useActorNavigation('manager')

	const hanldeNavigation = value => {
		navigateWithHistory(`/manager/${value}`)
	}

	const pathParts = location.pathname.split('/')
	let currentTab = pathParts[pathParts.length - 1]

	if (pathParts.includes('vaccine-event') || currentTab === 'vaccine-list') {
		currentTab = 'vaccination'
	}
	if (
		pathParts.includes('nurse') &&
		!['student', 'vaccination', 'health-checkup', 'medication-request', 'medication-event'].includes(currentTab)
	) {
		currentTab = 'student'
	}
	const handleValueChange = value => {
		if (value && value !== currentTab) {
			hanldeNavigation(value)
		}
	}
	return (
		<div className="flex justify-between items-center bg-white/80 backdrop-blur-xl px-4 md:px-20 py-3 shadow-lg rounded-b-xl font-inter sticky top-0 z-50">
			<div className="flex items-center gap-2">
				<img src={heartIcon} alt="MediSchool Logo" />
				<div className="flex flex-col">
					<p className="font-extrabold text-xl text-teal-700">MediSchool</p>
					<p className="text-sm text-teal-500 font-medium -mt-1">Cổng thông tin Quản lý</p>
				</div>
			</div>
			<ToggleGroup.Root
				className="inline-flex rounded-md justify-between"
				type="single"
				value={currentTab}
				onValueChange={handleValueChange}
				aria-label="Chức năng của phụ huynh"
			>
				{[
					{ value: "medication-requests", label: "Dặn thuốc" },
					{ value: "home", label: "Trang chủ" },
					{ value: "student", label: "Học sinh" },
					{ value: "vaccination", label: "Tiêm chủng" },
					{ value: "health-checkup", label: "Khám sức khoẻ" },
					{ value: "medication-event", label: "Sự kiện y tế" },
				].map(({ value, label }) => {
					const isActive = currentTab === value || (currentTab === 'manager' && value === 'home')
					const isHovered = hoveredTab === value
					const shouldShowActive = isActive && (!hoveredTab || isHovered)

					return (
						<ToggleGroup.Item
							key={value}
							className={`flex-1 max-w-fit text-center py-2 md:py-3 px-3 md:px-4 rounded-md transition-colors duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-600 ${
								shouldShowActive
									? 'bg-teal-600 text-white font-bold'
									: isHovered
									? 'bg-teal-600 text-white font-bold'
									: 'hover:bg-teal-600 hover:text-white hover:font-bold'
							}`}
							value={value}
							aria-label={label}
							onMouseEnter={() => setHoveredTab(value)}
							onMouseLeave={() => setHoveredTab(null)}
							onClick={() => hanldeNavigation(value)}
						>
							{label}
						</ToggleGroup.Item>
					)
				})}
			</ToggleGroup.Root>
			<div className="flex items-center gap-2">
				<CircleUserRound color="#0d9488" size={28} className="mr-1.5" />
				<p>Hi, {username}</p>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button className="flex items-center">
							<ChevronDown size={20} />
						</button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Portal>
						<DropdownMenu.Content className="bg-white rounded-md p-2 shadow-xl ring-1 ring-black/5 z-[60]">
							<DropdownMenu.Item className="px-4 py-2 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
								<div className="flex items-center">
									<p className="pr-4">Cài đặt tài khoản</p>
									<Settings size={16} />
								</div>
							</DropdownMenu.Item>
							<DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
							<DropdownMenu.Item className="px-4 py-2 text-red-600 hover:bg-gray-100 rounded cursor-pointer transition-colors duration-200">
								<button onClick={signout} className="flex items-center justify-between w-full">
									<span>Đăng xuất</span>
									<LogOut size={16} />
								</button>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Portal>
				</DropdownMenu.Root>
			</div>
		</div>
	)
}

export default ManagerTaskBar
