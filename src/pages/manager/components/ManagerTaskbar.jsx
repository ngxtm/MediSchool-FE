import { ChevronDown, CircleUserRound, Settings, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import useSignOut from '../../../utils/signout.jsx'
import { ToggleGroup } from 'radix-ui'
import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import heartIcon from '../../../assets/heart.png'
import useActorNavigation from '../../../hooks/useActorNavigation'

const ManagerTaskBar = ({ userData }) => {
  const [hoveredTab, setHoveredTab] = useState(null)
  const username = userData?.fullName || 'N/A'
  const signout = useSignOut()
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
  if (pathParts.includes('medication-requests')) {
    currentTab = 'medication-requests'
  }
  if (pathParts.includes('health-checkup')) {
    currentTab = 'health-checkup'
  }
  if (
    pathParts.includes('manager') &&
    !['student', 'vaccination', 'health-checkup', 'medication-requests', 'medication-event'].includes(currentTab)
  ) {
    currentTab = 'home'
  }
  const handleValueChange = value => {
    if (value && value !== currentTab) {
      hanldeNavigation(value)
    }
  }
  return (
    <div className="font-inter sticky top-0 z-50 flex items-center justify-between rounded-b-xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl md:px-20">
      <div className="flex items-center gap-2">
        <img src={heartIcon} alt="MediSchool Logo" />
        <div className="flex flex-col">
          <p className="text-xl font-extrabold text-teal-700">MediSchool</p>
          <p className="-mt-1 text-sm font-medium text-teal-500">Cổng thông tin Quản lý</p>
        </div>
      </div>
      <ToggleGroup.Root
        className="inline-flex justify-between rounded-md"
        type="single"
        value={currentTab}
        onValueChange={handleValueChange}
        aria-label="Chức năng của phụ huynh"
      >
        {[
          { value: 'home', label: 'Trang chủ' },
          { value: 'student', label: 'Học sinh' },
          { value: 'vaccination', label: 'Tiêm chủng' },
          { value: 'health-checkup', label: 'Khám sức khoẻ' },
          { value: 'medication-event', label: 'Sự kiện y tế' },
          { value: 'medication-requests', label: 'Dặn thuốc' }
        ].map(({ value, label }) => {
          const isActive = currentTab === value || (currentTab === 'manager' && value === 'home')
          const isHovered = hoveredTab === value
          const shouldShowActive = isActive && (!hoveredTab || isHovered)

          return (
            <ToggleGroup.Item
              key={value}
              className={`max-w-fit flex-1 cursor-pointer rounded-md px-3 py-2 text-center transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 md:px-4 md:py-3 ${
                shouldShowActive
                  ? 'bg-teal-600 font-bold text-white'
                  : isHovered
                    ? 'bg-teal-600 font-bold text-white'
                    : 'hover:bg-teal-600 hover:font-bold hover:text-white'
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
            <DropdownMenu.Content className="z-[60] rounded-md bg-white p-2 shadow-xl ring-1 ring-black/5">
              <DropdownMenu.Item className="cursor-pointer rounded px-4 py-2 transition-colors duration-200 hover:bg-gray-100">
                <div className="flex items-center">
                  <p className="pr-4">Cài đặt tài khoản</p>
                  <Settings size={16} />
                </div>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
              <DropdownMenu.Item className="cursor-pointer rounded px-4 py-2 text-red-600 transition-colors duration-200 hover:bg-gray-100">
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

export default ManagerTaskBar
