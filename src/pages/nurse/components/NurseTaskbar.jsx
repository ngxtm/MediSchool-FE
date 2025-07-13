import { ChevronDown, CircleUserRound, Settings, LogOut } from 'lucide-react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import useSignOut from '../../../utils/signout.jsx'
import { ToggleGroup } from 'radix-ui'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import heartIcon from '../../../assets/heart.png'

const NurseTaskBar = ({ userData }) => {
  const username = userData?.fullName || 'N/A'
  const signout = useSignOut()
  const [hoveredTab, setHoveredTab] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const pathParts = location.pathname.split('/')
  let currentTab = location.pathname.replace('/nurse/', '')

  if (pathParts.includes('vaccine-event') || currentTab === 'vaccine-list') {
    currentTab = 'vaccination'
  }

  if (pathParts.includes('medication-requests')) {
    currentTab = 'medication-requests'
  }

  if (pathParts.includes('health-checkup') || currentTab === 'checkup-categories') {
    currentTab = 'health-checkup'
  }

  if (
    pathParts.includes('nurse') &&
    !['student', 'vaccination', 'health-checkup', 'medication-requests', 'medication-event'].includes(currentTab)
  ) {
    currentTab = 'student'
  }

  const handleValueChange = value => {
    if (value && value !== currentTab) {
      navigate(`/nurse/${value}`)
    }
  }

  return (
    <div className="font-inter sticky top-0 z-50 flex items-center justify-between rounded-b-xl bg-white/80 px-4 py-3 shadow-lg backdrop-blur-xl md:px-20">
      <div className="flex items-center gap-2">
        <img src={heartIcon} alt="MediSchool Logo" />
        <p className="text-xl font-extrabold text-[#023E73]">MediSchool</p>
      </div>

      <ToggleGroup.Root
        className="inline-flex justify-between rounded-md"
        type="single"
        value={currentTab}
        onValueChange={handleValueChange}
        aria-label="Chức năng của y tá"
      >
        {[
          { value: 'student', label: 'Học sinh' },
          { value: 'vaccination', label: 'Tiêm chủng' },
          { value: 'health-checkup', label: 'Khám sức khoẻ' },
          { value: 'medication-event', label: 'Sự kiện y tế' },
          { value: 'medication-requests', label: 'Dặn thuốc' }
        ].map(({ value, label }) => {
          const isActive = currentTab === value
          const isHovered = hoveredTab === value
          const shouldShowActive = isActive && (!hoveredTab || isHovered)

          return (
            <Link key={value} to={`/nurse/${value}`}>
              <ToggleGroup.Item
                className={`max-w-fit flex-1 cursor-pointer rounded-md px-3 py-2 text-center transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#023E73] focus-visible:ring-offset-2 md:px-4 md:py-3 ${
                  shouldShowActive
                    ? 'bg-[#023E73] font-bold text-white'
                    : isHovered
                      ? 'bg-[#023E73] font-bold text-white'
                      : 'hover:bg-[#023E73] hover:font-bold hover:text-white'
                }`}
                value={value}
                aria-label={label}
                onMouseEnter={() => setHoveredTab(value)}
                onMouseLeave={() => setHoveredTab(null)}
              >
                {label}
              </ToggleGroup.Item>
            </Link>
          )
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
        </DropdownMenu.Root>
      </div>
    </div>
  )
}

export default NurseTaskBar
