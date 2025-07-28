import { ToggleGroup } from 'radix-ui'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'

const NavToggle = () => {
  const [hoveredTab, setHoveredTab] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  const pathParts = location.pathname.split('/')
  let currentTab = pathParts[pathParts.length - 1]
  if (
    pathParts.includes('parent') &&
    !['info', 'medical-record', 'vaccination', 'health-check', 'medication-requests'].includes(currentTab)
  ) {
    currentTab = 'info'
  }

  if (pathParts.includes('medical-record')) {
    currentTab = 'medical-record'
  }

  const handleValueChange = value => {
    if (value && value !== currentTab) {
      navigate(`/parent/${value}`)
    }
  }
  return (
    <div>
      <ToggleGroup.Root
        className="inline-flex w-full justify-between rounded-md bg-gray-200"
        type="single"
        value={currentTab}
        onValueChange={handleValueChange}
        aria-label="Chức năng của phụ huynh"
      >
        {[
          { value: 'info', label: 'Thông tin cá nhân' },
          { value: 'medical-record', label: 'Hồ sơ y tế' },
          { value: 'vaccination', label: 'Tiêm chủng' },
          { value: 'health-check', label: 'Khám sức khoẻ' },
          { value: 'medication-requests', label: 'Dặn thuốc' }
        ].map(({ value, label }) => {
          const isActive = currentTab === value || (currentTab === 'parent' && value === 'info')
          const isHovered = hoveredTab === value
          const shouldShowActive = isActive && (!hoveredTab || isHovered)

          return (
            <ToggleGroup.Item
              key={value}
              className={`flex-1 rounded-md py-2 text-center transition-colors ${
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
          )
        })}
      </ToggleGroup.Root>
    </div>
  )
}

export default NavToggle
