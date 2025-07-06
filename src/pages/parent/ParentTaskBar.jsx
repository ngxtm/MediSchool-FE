import { ChevronDown, CircleUserRound, Settings, LogOut } from "lucide-react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import useSignOut from "../../utils/signout.jsx";

const TaskBar = ({userData}) => {
    const username = userData?.fullName || "N/A";
    const signout = useSignOut();
    return (
        <div className="flex justify-between items-center bg-[#E8F4FB] p-4 shadow-md px-20 font-inter">
            <div>
                <p className="font-bold">MediSchool</p>
                <h1 className="font-bold">HỆ THỐNG QUẢN LÝ SỨC KHOẺ HỌC SINH</h1>
            </div>
            <div className="flex items-center gap-2">
                <CircleUserRound color="#4d8ab3" size={28} className="mr-1.5" /><p>Hi, {username}</p>
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
    );
}

export default TaskBar;