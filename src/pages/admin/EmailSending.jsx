import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Send, Users, Mail, FileText, AlertCircle, CheckCircle, Clock, Eye } from 'lucide-react'
import api from '../../utils/api'
import { message } from 'antd'

const EmailSending = () => {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [sendingProgress, setSendingProgress] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/users')
      setUsers(response.data)
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng')
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviewEmail = () => {
    if (!content.trim()) {
      message.warning('Vui lòng nhập nội dung email trước khi xem trước')
      return
    }
    setShowPreview(true)
  }

  const closePreview = () => {
    setShowPreview(false)
  }

  const handleUserSelection = (userId, checked) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId])
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId))
    }
  }

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(users.map(user => user.id))
    }
  }

  const handleSendEmails = async () => {
    if (selectedUsers.length === 0) {
      message.warning('Vui lòng chọn ít nhất một người nhận')
      return
    }

    if (!subject.trim() || !content.trim()) {
      message.warning('Vui lòng nhập đầy đủ tiêu đề và nội dung email')
      return
    }

    try {
      setLoading(true)
      setSendingProgress({ total: selectedUsers.length, sent: 0, failed: 0 })

      const emailData = {
        recipients: selectedUsers,
        subject: subject,
        content: content
      }

      const response = await api.post('/admin/emails/send', emailData)

      if (response.data.success) {
        message.success(`Gửi email thành công: ${response.data.recipientCount} người nhận`)
        setSelectedUsers([])
        setSubject('')
        setContent('')
        // Ghi log hoạt động chi tiết
        try {
          await api.post('/activity-log', {
            actionType: 'SEND_EMAIL',
            entityType: 'EMAIL',
            description: `Gửi email thông báo cho ${response.data.recipientCount || selectedUsers.length} người nhận`,
            details: `Danh sách người nhận: ${users
              .filter(u => selectedUsers.includes(u.id))
              .map(u => u.fullName)
              .join(', ')}`
          })
        } catch (logErr) {
          // Không cần báo lỗi log cho user
          console.error('Ghi log hoạt động thất bại:', logErr)
        }
      } else {
        message.error(response.data.message || 'Có lỗi xảy ra khi gửi email')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      if (error.response?.data?.message) {
        message.error(error.response.data.message)
      } else {
        message.error('Lỗi khi gửi email')
      }
    } finally {
      setLoading(false)
      setSendingProgress(null)
    }
  }

  const getRoleDisplay = role => {
    const roleMap = {
      ADMIN: 'Quản trị viên',
      MANAGER: 'Quản lý',
      NURSE: 'Y tá',
      PARENT: 'Phụ huynh'
    }
    return roleMap[role] || role
  }

  const getStatusBadge = isActive => {
    return isActive ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Hoạt động
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <AlertCircle className="mr-1 h-3 w-3" />
        Không hoạt động
      </Badge>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Mail className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Gửi Email</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cấu hình Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Tiêu đề Email</Label>
              <Input
                id="subject"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Nhập tiêu đề email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Nội dung Email</Label>
              <Textarea
                id="content"
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Nhập nội dung email"
                rows={8}
              />
            </div>

            <div className="space-y-2 pt-4">
              <Button onClick={handlePreviewEmail} disabled={!content.trim()} variant="outline" className="w-full">
                <Eye className="mr-2 h-4 w-4" />
                Xem trước Email
              </Button>
              <Button onClick={handleSendEmails} disabled={loading || selectedUsers.length === 0} className="w-full">
                <Send className="mr-2 h-4 w-4" />
                {loading ? 'Đang gửi...' : `Gửi Email (${selectedUsers.length} người nhận)`}
              </Button>
            </div>

            {sendingProgress && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Tiến trình gửi email</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div>Tổng số: {sendingProgress.total}</div>
                  <div>Đã gửi: {sendingProgress.sent}</div>
                  <div>Thất bại: {sendingProgress.failed}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Chọn Người Nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} / {users.length} người được chọn
              </span>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedUsers.length === users.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>

            <div className="max-h-96 space-y-2 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải danh sách người dùng...</p>
                </div>
              ) : users.length === 0 ? (
                <div className="py-8 text-center text-gray-500">Không có người dùng nào</div>
              ) : (
                users.map(user => (
                  <div
                    key={user.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleUserSelection(user.id, !selectedUsers.includes(user.id))}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={e => handleUserSelection(user.id, e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(user.isActive)}
                      <Badge variant="outline">{getRoleDisplay(user.role)}</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin về Gửi Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Lưu ý:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• Email sẽ được gửi bất đồng bộ để không ảnh hưởng đến hiệu suất</li>
                <li>• Hệ thống sẽ tự động thử lại nếu gửi thất bại</li>
                <li>• Chỉ gửi email cho người dùng có trạng thái hoạt động</li>
                <li>• Có thể gửi tối đa 100 email cùng lúc</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {showPreview && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="text-lg font-semibold">Xem trước Email</h3>
              <Button variant="ghost" size="sm" onClick={closePreview}>
                ✕
              </Button>
            </div>
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-4">
              <div className="mx-auto max-w-2xl" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmailSending
