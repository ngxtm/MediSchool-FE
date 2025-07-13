import { ChevronDown, CircleUserRound, LogOut, Settings } from 'lucide-react'
import heartIcon from '../../../assets/heart.png'
import useSignOut from '../../../utils/signout.jsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'

const AdminTaskbar = ({ userData }) => {
  const username = userData?.fullName || 'N/A'
  const signout = useSignOut()

  return (
    <div className="">
      <div className="font-inter sticky top-0 z-50 flex items-center justify-between rounded-b-xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl md:px-20">
        <div className="flex items-center gap-2">
          <img src={heartIcon} alt="MediSchool Logo" />
          <div className="flex flex-col">
            <p className="text-xl font-extrabold text-[#023E73]">MediSchool</p>
            <p className="-mt-1 text-sm font-medium text-[#4d8ab3]">Cổng thông tin Admin</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CircleUserRound color="#4d8ab3" size={28} className="mr-1.5" />
          <p>Hi, {username}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center">
                <ChevronDown size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[60] rounded-md bg-white p-2 shadow-xl ring-1 ring-black/5">
              <DropdownMenuItem className="cursor-pointer rounded px-4 py-2 transition-colors duration-200 hover:bg-gray-100">
                <div className="flex items-center">
                  <p className="pr-4">Cài đặt tài khoản</p>
                  <Settings size={16} />
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />
              <DropdownMenuItem className="cursor-pointer rounded px-4 py-2 text-red-600 transition-colors duration-200 hover:bg-gray-100">
                <button onClick={signout} className="flex w-full items-center justify-between">
                  <span>Đăng xuất</span>
                  <LogOut size={16} />
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}

export default AdminTaskbar
