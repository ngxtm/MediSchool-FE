import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  User,
  MapPin,
  Monitor,
  Search,
  Filter,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import api from '../../utils/api'
import { message } from 'antd'
import { formatDateTime } from '../../utils/dateparse'

const LoginHistory = () => {
  const [loading, setLoading] = useState(false)
  const [loginHistory, setLoginHistory] = useState([])
  const [filteredHistory, setFilteredHistory] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(20)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')

  const fetchLoginHistory = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: (currentPage - 1).toString(),
        size: pageSize.toString()
      })

      const response = await api.get(`/admin/login-history?${params.toString()}`)
      const data = response.data

      setLoginHistory(data.content || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching login history:', error)
      setLoginHistory([])
      setTotalPages(1)
      message.error('Không thể tải lịch sử đăng nhập từ server')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoginHistory()
  }, [currentPage, pageSize])

  const filterHistory = () => {
    let filtered = [...loginHistory]

    if (searchTerm) {
      filtered = filtered.filter(
        item =>
          item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.ipAddress.includes(searchTerm) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter)
    }

    if (dateFilter !== 'all') {
      const now = new Date()

      switch (dateFilter) {
        case 'today': {
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.loginTime)
            return itemDate.toDateString() === now.toDateString()
          })
          break
        }
        case 'week': {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(item => new Date(item.loginTime) >= weekAgo)
          break
        }
        case 'month': {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          filtered = filtered.filter(item => new Date(item.loginTime) >= monthAgo)
          break
        }
      }
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(item => item.username === selectedUser)
    }

    setFilteredHistory(filtered)
  }

  useEffect(() => {
    filterHistory()
  }, [loginHistory, searchTerm, statusFilter, dateFilter, selectedUser])

  const getStatusBadge = status => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Thành công
          </Badge>
        )
      case 'FAILED':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" />
            Thất bại
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Không xác định
          </Badge>
        )
    }
  }

  const formatDuration = seconds => {
    if (!seconds || seconds === 0) return 'N/A'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    let result = ''
    if (hours > 0) {
      result += `${hours}h `
    }
    if (minutes > 0 || hours > 0) {
      result += `${minutes}m `
    }
    if (secs > 0 && hours === 0) {
      result += `${secs}s`
    }

    return result.trim() || 'N/A'
  }

  const getSessionStatus = item => {
    if (item.isActiveSession) {
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          <Clock className="mr-1 h-3 w-3" />
          Đang hoạt động
        </Badge>
      )
    }
    return null
  }

  const getUniqueUsers = () => {
    const users = [...new Set(loginHistory.map(item => item.username))]
    return users
  }

  const handleExportCSV = () => {
    const csvContent = [
      ['Thời gian', 'Người dùng', 'IP', 'Vị trí', 'Thiết bị', 'Trạng thái', 'Thời gian phiên'],
      ...filteredHistory.map(item => [
        formatDateTime(item.loginTime),
        item.username,
        item.ipAddress,
        item.location,
        item.userAgent,
        item.status === 'SUCCESS' ? 'Thành công' : 'Thất bại',
        formatDuration(item.sessionDuration)
      ])
    ]
      .map(row => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `login-history-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    fetchLoginHistory()
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Lịch sử đăng nhập</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={handleExportCSV} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Tìm kiếm</Label>
              <div className="relative">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Tìm theo tên, IP, vị trí..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="SUCCESS">Thành công</SelectItem>
                  <SelectItem value="FAILED">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Thời gian</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="week">Tuần này</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="user">Người dùng</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn người dùng" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {getUniqueUsers().map(user => (
                    <SelectItem key={user} value={user}>
                      {user}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Danh sách đăng nhập ({filteredHistory.length} bản ghi)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Đang tải...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium">Thời gian</th>
                    <th className="p-3 text-left font-medium">Người dùng</th>
                    <th className="p-3 text-left font-medium">IP</th>
                    <th className="p-3 text-left font-medium">Vị trí</th>
                    <th className="p-3 text-left font-medium">Thiết bị</th>
                    <th className="p-3 text-left font-medium">Trạng thái</th>
                    <th className="p-3 text-left font-medium">Thời gian phiên</th>
                    <th className="p-3 text-left font-medium">Chi tiết</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDateTime(item.loginTime)}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          {item.username}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">{item.ipAddress}</td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {item.location}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4 text-gray-400" />
                          <span className="max-w-[200px] truncate">{item.userAgent}</span>
                        </div>
                      </td>
                      <td className="p-3">{getStatusBadge(item.status)}</td>
                      <td className="p-3 text-sm">
                        <div className="flex items-center gap-2">
                          {formatDuration(item.sessionDuration)}
                          {getSessionStatus(item)}
                        </div>
                      </td>
                      <td className="p-3">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredHistory.length > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredHistory.length)}{' '}
                của {filteredHistory.length} bản ghi
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}

          {!loading && filteredHistory.length === 0 && (
            <div className="py-8 text-center text-gray-500">Không có dữ liệu lịch sử đăng nhập</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default LoginHistory
