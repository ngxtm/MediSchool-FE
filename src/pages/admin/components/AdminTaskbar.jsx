import { ChevronDown, CircleUserRound, LogOut, Settings } from 'lucide-react'
import heartIcon from '../../../assets/heart.png'
import useSignOut from '../../../utils/signout'
import { DropdownMenu } from 'radix-ui'


const AdminTaskbar = ({ userData }) => {
    const username = userData?.fullName || 'N/A'
	const signout = useSignOut()

    return (
        <div className="">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-xl px-4 md:px-20 py-3 shadow-lg rounded-b-xl font-inter sticky top-0 z-50">
			<div className="flex items-center gap-2">
				<img src={heartIcon} alt="MediSchool Logo" />
				<div className='flex flex-col'>
					<p className="font-extrabold text-xl text-[#023E73]">MediSchool</p>
					<p className="text-sm text-[#4d8ab3] font-medium -mt-1">Cổng thông tin Admin</p>
				</div>
			</div>

			<div className="flex items-center gap-2">
				<CircleUserRound color="#4d8ab3" size={28} className="mr-1.5" />
				<p>Hi, {username}</p>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild>
						<button className="flex items-center">
							<ChevronDown size={20} />
						</button>
					</DropdownMenu.Trigger>
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
				</DropdownMenu.Root>
			</div>
		</div>
        </div>
    )
}

export default AdminTaskbar