import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Users,
  UserCheck,
  FileText,
  Mail,
  BookOpen,
  Settings,
  Activity,
  Calendar,
  Shield,
  Database,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  AlertTriangle,
  Clock4,
  CheckSquare,
  Clock3
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../utils/api'
import { message } from 'antd'
import RecentActivities from '../../components/RecentActivities'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

const StatCard = React.memo(({ title, value, subtitle, icon }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-muted-foreground text-xs">{subtitle}</p>
    </CardContent>
  </Card>
))

StatCard.displayName = 'StatCard'

const QuickActionCard = React.memo(({ action, onNavigate }) => (
  <div
    className="group cursor-pointer rounded-lg border p-4 transition-all hover:border-blue-300 hover:shadow-md"
    onClick={() => onNavigate(action.path)}
  >
    <div className="flex items-center gap-3">
      <div className={`rounded-lg p-2 text-white ${action.color}`}>{action.icon}</div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 group-hover:text-blue-600">{action.title}</h3>
        <p className="text-sm text-gray-600">{action.description}</p>
      </div>
    </div>
  </div>
))

QuickActionCard.displayName = 'QuickActionCard'

const ActivityStatsCard = React.memo(({ title, value, subtitle, icon, color = 'text-blue-600' }) => (
  <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
    <div className="flex items-center gap-3">
      <div className={`rounded-lg bg-white p-2 ${color}`}>{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-600">{subtitle}</p>
      </div>
    </div>
    <div className="text-right">
      <div className="text-lg font-bold text-gray-900">{value}</div>
    </div>
  </div>
))

ActivityStatsCard.displayName = 'ActivityStatsCard'

const AdminDashboard = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activitiesLoading, setActivitiesLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalEvents: 0,
    totalVaccinations: 0,
    pendingRequests: 0,
    recentActivities: []
  })
  const [activityStats, setActivityStats] = useState({
    pendingMedicationRequests: 0,
    upcomingEvents: 0,
    completedVaccinations: 0,
    activeHealthEvents: 0
  })
  const [pageSize, setPageSize] = useState(10)

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const [usersResponse, studentsResponse, eventsResponse] = await Promise.allSettled([
        api.get('/admin/users/count'),
        api.get('/admin/students/count'),
        api.get('/vaccine-events/count')
      ])

      const usersCount = usersResponse.status === 'fulfilled' ? usersResponse.value.data : 0
      const studentsCount = studentsResponse.status === 'fulfilled' ? studentsResponse.value.data : 0
      const eventsCount = eventsResponse.status === 'fulfilled' ? eventsResponse.value.data : 0

      setStats(prev => ({
        ...prev,
        totalUsers: usersCount,
        totalStudents: studentsCount,
        totalEvents: eventsCount,
        pendingRequests: 0
      }))
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      message.error('Không thể tải dữ liệu dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchActivityStats = useCallback(async () => {
    try {
      const [medicationResponse, eventsResponse, vaccinationsResponse, healthEventsResponse] = await Promise.allSettled(
        [
          api.get('/medication-requests/pending/count'),
          api.get('/vaccine-events/upcoming/count'),
          api.get('/vaccination-history/completed/count'),
          api.get('/health-event/active/count')
        ]
      )

      setActivityStats({
        pendingMedicationRequests: medicationResponse.status === 'fulfilled' ? medicationResponse.value.data : 0,
        upcomingEvents: eventsResponse.status === 'fulfilled' ? eventsResponse.value.data : 0,
        completedVaccinations: vaccinationsResponse.status === 'fulfilled' ? vaccinationsResponse.value.data : 0,
        activeHealthEvents: healthEventsResponse.status === 'fulfilled' ? healthEventsResponse.value.data : 0
      })
    } catch (error) {
      console.error('Error fetching activity stats:', error)
      setActivityStats({
        pendingMedicationRequests: 5,
        upcomingEvents: 3,
        completedVaccinations: 150,
        activeHealthEvents: 2
      })
    }
  }, [])

  const fetchRecentActivities = useCallback(
    async (page = 1, limit = pageSize) => {
      try {
        setActivitiesLoading(true)

        const params = new URLSearchParams({
          limit: limit.toString(),
          page: (page - 1).toString()
        })

        console.log('API call with params:', params.toString())

        const response = await api.get(`/admin/activities/recent?${params.toString()}`)
        const data = response.data

        console.log('API response:', data)
        console.log('Response status:', response.status)

        setStats(prev => ({
          ...prev,
          recentActivities: data.activities || []
        }))

        setTotalPages(data.totalPages || 1)
      } catch (error) {
        console.error('Error fetching recent activities:', error)
        message.error('Không thể tải hoạt động gần đây')
      } finally {
        setActivitiesLoading(false)
      }
    },
    [pageSize]
  )

  useEffect(() => {
    fetchDashboardData()
    fetchActivityStats()
    fetchRecentActivities(1, pageSize)
  }, [fetchDashboardData, fetchActivityStats, fetchRecentActivities, pageSize])

  const handlePageChange = useCallback(
    newPage => {
      setCurrentPage(newPage)
      fetchRecentActivities(newPage, pageSize)
    },
    [fetchRecentActivities, pageSize]
  )

  const handlePageSizeChange = useCallback(
    newSize => {
      setPageSize(newSize)
      setCurrentPage(1)
      fetchRecentActivities(1, newSize)
    },
    [fetchRecentActivities]
  )

  const quickActions = useMemo(
    () => [
      {
        title: 'Quản lý Tài khoản',
        description: 'Thêm, sửa, xóa tài khoản người dùng',
        icon: <Users className="h-6 w-6" />,
        path: '/admin/user-management',
        color: 'bg-blue-500'
      },
      {
        title: 'Quản lý Học sinh',
        description: 'Quản lý thông tin học sinh trong hệ thống',
        icon: <UserCheck className="h-6 w-6" />,
        path: '/admin/student-management',
        color: 'bg-green-500'
      },
      {
        title: 'Xuất PDF',
        description: 'Xuất báo cáo PDF cho sự kiện và học sinh',
        icon: <FileText className="h-6 w-6" />,
        path: '/admin/pdf-export',
        color: 'bg-purple-500'
      },
      {
        title: 'Gửi Email',
        description: 'Gửi email thông báo và nhắc nhở',
        icon: <Mail className="h-6 w-6" />,
        path: '/admin/email-sending',
        color: 'bg-orange-500'
      },
      {
        title: 'Hướng dẫn',
        description: 'Hướng dẫn sử dụng hệ thống',
        icon: <BookOpen className="h-6 w-6" />,
        path: '/admin/user-guide',
        color: 'bg-indigo-500'
      },
      {
        title: 'API Documentation',
        description: 'Tài liệu API cho developers',
        icon: <Settings className="h-6 w-6" />,
        path: '/admin/api-documentation',
        color: 'bg-gray-500'
      }
    ],
    []
  )

  const handleNavigate = useCallback(
    path => {
      navigate(path)
    },
    [navigate]
  )

  const statCards = useMemo(
    () => [
      {
        title: 'Tổng số tài khoản',
        value: stats.totalUsers,
        subtitle: 'Tài khoản đã đăng ký',
        icon: <Users className="text-muted-foreground h-4 w-4" />
      },
      {
        title: 'Tổng số học sinh',
        value: stats.totalStudents,
        subtitle: 'Học sinh trong hệ thống',
        icon: <UserCheck className="text-muted-foreground h-4 w-4" />
      },
      {
        title: 'Sự kiện tiêm chủng',
        value: stats.totalEvents,
        subtitle: 'Sự kiện đã tạo',
        icon: <Calendar className="text-muted-foreground h-4 w-4" />
      }
    ],
    [stats]
  )

  const activityChartData = [
    {
      name: 'Yêu cầu thuốc',
      value: activityStats.pendingMedicationRequests
    },
    {
      name: 'Sự kiện sắp tới',
      value: activityStats.upcomingEvents
    },
    {
      name: 'Tiêm chủng hoàn thành',
      value: activityStats.completedVaccinations
    },
    {
      name: 'Sự kiện y tế gần đây',
      value: activityStats.activeHealthEvents
    }
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Tổng quan hệ thống MediSchool</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Admin
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <StatCard key={index} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {quickActions.map((action, index) => (
                <QuickActionCard key={index} action={action} onNavigate={handleNavigate} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Thống kê hoạt động
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData} margin={{ top: 16, right: 16, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={13} />
                  <YAxis allowDecimals={false} fontSize={13} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Giá trị" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivities
            activities={stats.recentActivities}
            loading={activitiesLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageSize={pageSize}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(AdminDashboard)
