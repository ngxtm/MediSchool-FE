import { ChevronDown, CircleUserRound, Settings, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import useSignOut from '../utils/signout.jsx'

const TaskBar = ({ userData }) => {
  const username = userData?.fullName || 'N/A'
  const signout = useSignOut()
  return (
    <div className="font-inter flex items-center justify-between bg-[#E8F4FB] p-4 px-20 shadow-md">
      <div>
        <p className="font-bold">MediSchool</p>
        <h1 className="font-bold">HỆ THỐNG QUẢN LÝ SỨC KHOẺ HỌC SINH</h1>
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
          <DropdownMenu.Portal>
            <DropdownMenu.Content className="rounded-md bg-white p-2 shadow-lg">
              <DropdownMenu.Item className="cursor-pointer rounded px-4 py-2 hover:bg-gray-100">
                <div className="flex items-center">
                  <p className="pr-4">Cài đặt tài khoản</p>
                  <Settings size={16} />
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
              <DropdownMenu.Item className="cursor-pointer rounded px-4 py-2 text-red-600 hover:bg-gray-100">
                <button onClick={signout} className="flex w-full items-center justify-between">
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

export default TaskBar
