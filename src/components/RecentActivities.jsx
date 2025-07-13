import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  User,
  Users,
  FileText,
  Mail,
  Calendar,
  Shield,
  Database,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const ActivityItem = React.memo(({ activity }) => {
  const getActivityIcon = React.useCallback(entityType => {
    switch (entityType) {
      case 'USER':
        return <User className="h-4 w-4" />
      case 'STUDENT':
        return <Users className="h-4 w-4" />
      case 'VACCINATION_EVENT':
        return <Calendar className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'SYSTEM':
        return <Shield className="h-4 w-4" />
      case 'VACCINE':
        return <Database className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }, [])

  const getActivityColor = React.useCallback(actionType => {
    switch (actionType) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'IMPORT':
        return 'bg-purple-100 text-purple-800'
      case 'EXPORT':
        return 'bg-orange-100 text-orange-800'
      case 'SEND_EMAIL':
        return 'bg-indigo-100 text-indigo-800'
      case 'APPROVE':
        return 'bg-green-100 text-green-800'
      case 'REJECT':
        return 'bg-red-100 text-red-800'
      case 'VIEW':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }, [])

  const activityIcon = React.useMemo(() => getActivityIcon(activity.entityType), [activity.entityType, getActivityIcon])
  const activityColor = React.useMemo(
    () => getActivityColor(activity.actionType),
    [activity.actionType, getActivityColor]
  )

  return (
    <div className="flex items-start gap-3 rounded-lg border p-3 hover:bg-gray-50">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">{activityIcon}</div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{activity.description}</p>
          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${activityColor}`}>
            {activity.actionTypeDisplay}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-medium">{activity.userName}</span>
          <span>•</span>
          <span>{activity.timeAgo}</span>
          {activity.entityTypeDisplay && (
            <>
              <span>•</span>
              <span>{activity.entityTypeDisplay}</span>
            </>
          )}
        </div>
        {activity.details && <p className="mt-1 truncate text-xs text-gray-500">{activity.details}</p>}
      </div>
    </div>
  )
})

ActivityItem.displayName = 'ActivityItem'

const LoadingState = React.memo(() => (
  <div className="py-8 text-center">
    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
    <p className="mt-2 text-sm text-gray-600">Đang tải...</p>
  </div>
))

LoadingState.displayName = 'LoadingState'

const EmptyState = React.memo(() => (
  <div className="py-8 text-center">
    <Activity className="mx-auto h-8 w-8 text-gray-400" />
    <p className="mt-2 text-sm text-gray-600">Chưa có hoạt động nào</p>
  </div>
))

EmptyState.displayName = 'EmptyState'

const RecentActivities = React.memo(
  ({
    activities,
    loading,
    onPageChange,
    onPageSizeChange,
    currentPage = 1,
    totalPages = 1,
    pageSize = 10,
    pageSizeOptions = [5, 10, 20, 50]
  }) => {
    const [localCurrentPage, setLocalCurrentPage] = useState(currentPage)
    const [localPageSize, setLocalPageSize] = useState(pageSize)
    const [inputPage, setInputPage] = useState(currentPage)

    const handlePageChange = newPage => {
      setLocalCurrentPage(newPage)
      setInputPage(newPage)
      if (onPageChange) {
        onPageChange(newPage)
      }
    }

    const handlePageSizeChange = e => {
      const newSize = Number(e.target.value)
      setLocalPageSize(newSize)
      setLocalCurrentPage(1)
      setInputPage(1)
      if (onPageSizeChange) {
        onPageSizeChange(newSize)
      }
      if (onPageChange) {
        onPageChange(1)
      }
    }

    const handleInputPageChange = e => {
      setInputPage(e.target.value)
    }

    const handleInputPageBlur = () => {
      let page = Number(inputPage)
      if (isNaN(page) || page < 1) page = 1
      if (page > totalPages) page = totalPages
      setInputPage(page)
      setLocalCurrentPage(page)
      if (onPageChange) {
        onPageChange(page)
      }
    }

    if (loading) {
      return <LoadingState />
    }

    return (
      <div className="space-y-4">
        {!activities || activities.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Trang</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={inputPage}
                    onChange={handleInputPageChange}
                    onBlur={handleInputPageBlur}
                    className="w-14 rounded border px-1 py-0.5 text-center"
                  />
                  <span>của {totalPages}</span>
                  <select
                    value={localPageSize}
                    onChange={handlePageSizeChange}
                    className="ml-2 rounded border px-2 py-0.5"
                  >
                    {pageSizeOptions.map(size => (
                      <option key={size} value={size}>
                        {size} dòng/trang
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(localCurrentPage - 1)}
                    disabled={localCurrentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(localCurrentPage + 1)}
                    disabled={localCurrentPage >= totalPages}
                  >
                    Sau
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }
)

RecentActivities.displayName = 'RecentActivities'

export default RecentActivities
