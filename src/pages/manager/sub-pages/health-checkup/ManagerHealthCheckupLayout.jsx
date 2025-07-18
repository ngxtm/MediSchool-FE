import { useQuery } from '@tanstack/react-query'
import { useLocation, Outlet } from 'react-router-dom'
import { FileText, CheckCheck, AlertTriangle, Calendar } from 'lucide-react'
import api from '../../../../utils/api.js'

export default function ManagerHealthCheckupLayout() {
  const location = useLocation()
  const isDetailPage = /^\/manager\/health-checkup(\/consent)?\/\d+$/.test(location.pathname)
  const isConsent = location.pathname.endsWith('/consents')
  const isResult = location.pathname.endsWith('/results')

  const { data, isLoading } = useQuery({
    queryKey: ['checkup-summary'],
    queryFn: async () => (await api.get('/health-checkup/stats')).data
  })

  const handleBgColor = idx => {
    if (idx === 0) {
      return 'bg-gradient-to-r from-teal-500 to-teal-600'
    } else if (idx === 1) {
      return 'bg-gradient-to-r from-emerald-500 to-emerald-600'
    } else if (idx === 2) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500'
    } else if (idx === 3) {
      return 'bg-gradient-to-r from-cyan-500 to-blue-500'
    }
  }

  return (
    <div className="font-inter max-h-[90%] items-center justify-center">
      {!isDetailPage && !isConsent && !isResult && (
        <div className="mb-8 grid grid-cols-4 gap-15">
          {[
            { label: 'Đã gửi', icon: <FileText />, value: data?.sent || 0 },
            { label: 'Đã phản hồi', icon: <CheckCheck />, value: data?.replied || 0 },
            { label: 'Chưa phản hồi', icon: <AlertTriangle />, value: data?.pending || 0 },
            { label: 'Hạng mục khám', icon: <Calendar />, value: data?.categories || 0 }
          ].map((item, i) => (
            <div key={i} className={`rounded-xl px-6 py-4 ${handleBgColor(i)}`}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">{item.label}</p>
                {item.icon}
              </div>
              <p className="text-2xl font-bold">{item.value}</p>
            </div>
          ))}
        </div>
      )}

      <Outlet />
    </div>
  )
}
