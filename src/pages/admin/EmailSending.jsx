import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  const [emailTemplate, setEmailTemplate] = useState('')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [emailType, setEmailType] = useState('custom')
  const [sendingProgress, setSendingProgress] = useState(null)
  const [showPreview, setShowPreview] = useState(false)

  // Email templates with HTML content
  const emailTemplates = {
    vaccination_reminder: {
      subject: '💉 Thông báo tiêm chủng quan trọng',
      content: `
<p style="font-size:18px;font-weight:500;margin-bottom:16px;">Kính chào Quý phụ huynh!</p>
<p style="color:#555;font-size:15px;margin-bottom:20px;">Chúng tôi xin gửi đến bạn thông báo về lịch tiêm chủng của con em bạn.</p>
<div style="background:linear-gradient(135deg,#ffecd2 0%,#fcb69f 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #e67e22;">
  <strong>👨‍👩‍👧‍👦 Thông tin phụ huynh & học sinh</strong><br/>
  Phụ huynh: <b>{parentName}</b><br/>
  Học sinh: <b>{studentName}</b>
</div>
<div style="background:linear-gradient(135deg,#d299c2 0%,#fef9d7 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #9b59b6;">
  <strong>💉 Thông tin tiêm chủng</strong><br/>
  Loại vaccine: <b>{vaccineName}</b><br/>
  Thời gian: <b>{eventDate}</b><br/>
  Địa điểm: <b>{eventLocation}</b>
</div>
<div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
  <b>⚠️ Lưu ý quan trọng:</b> Vui lòng xác nhận tham gia và chuẩn bị đầy đủ giấy tờ cần thiết. Trẻ em cần được phụ huynh đưa đến đúng giờ và mang theo sổ tiêm chủng.
</div>
<div style="text-align:center;margin:24px 0;">
  <a href="{consentUrl}" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;padding:12px 28px;font-size:16px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;">✅ XÁC NHẬN THAM GIA TIÊM CHỦNG</a>
</div>
<div style="background:#f8f9fa;border-radius:8px;padding:14px 18px;margin-top:18px;font-size:14px;">
  <b>📞 Thông tin liên hệ hỗ trợ</b><br/>
  Email: medischool@gmail.com<br/>
  Hotline: 19009999<br/>
  Thời gian hỗ trợ: 7:00 - 17:00 (Thứ 2 - Thứ 6)
</div>
`
    },
    health_checkup: {
      subject: '🏥 Thông báo kiểm tra sức khỏe',
      content: `
<p style="font-size:18px;font-weight:500;margin-bottom:16px;">Kính chào Quý phụ huynh!</p>
<p style="color:#555;font-size:15px;margin-bottom:20px;">Chúng tôi xin gửi đến bạn thông báo về lịch kiểm tra sức khỏe của con em bạn.</p>
<div style="background:linear-gradient(135deg,#e8f5e8 0%,#c8e6c9 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #4caf50;">
  <strong>👨‍👩‍👧‍👦 Thông tin phụ huynh & học sinh</strong><br/>
  Phụ huynh: <b>{parentName}</b><br/>
  Học sinh: <b>{studentName}</b>
</div>
<div style="background:linear-gradient(135deg,#f3e5f5 0%,#e1bee7 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #9c27b0;">
  <strong>🏥 Thông tin kiểm tra sức khỏe</strong><br/>
  Ngày kiểm tra: <b>{eventDate}</b><br/>
  Địa điểm: <b>{eventLocation}</b><br/>
  Nội dung kiểm tra: <b>{checkupDetails}</b>
</div>
<div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
  <b>⚠️ Lưu ý quan trọng:</b> Vui lòng chuẩn bị cho học sinh tham gia đầy đủ. Học sinh cần ăn sáng nhẹ trước khi kiểm tra và mang theo sổ khám bệnh nếu có.
</div>
<div style="text-align:center;margin:24px 0;">
  <a href="{consentUrl}" style="background:linear-gradient(135deg,#4caf50 0%,#2e7d32 100%);color:#fff;padding:12px 28px;font-size:16px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;">✅ XÁC NHẬN THAM GIA KIỂM TRA</a>
</div>
<div style="background:#f8f9fa;border-radius:8px;padding:14px 18px;margin-top:18px;font-size:14px;">
  <b>📞 Thông tin liên hệ hỗ trợ</b><br/>
  Email: medischool@gmail.com<br/>
  Hotline: 19009999<br/>
  Thời gian hỗ trợ: 7:00 - 17:00 (Thứ 2 - Thứ 6)
</div>
`
    },
    medication_reminder: {
      subject: '💊 Nhắc nhở thuốc quan trọng',
      content: `
<p style="font-size:18px;font-weight:500;margin-bottom:16px;">Kính chào Quý phụ huynh!</p>
<p style="color:#555;font-size:15px;margin-bottom:20px;">Chúng tôi xin gửi đến bạn nhắc nhở về việc cung cấp thuốc cho con em bạn.</p>
<div style="background:linear-gradient(135deg,#fff3e0 0%,#ffe0b2 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #ff9800;">
  <strong>👨‍👩‍👧‍👦 Thông tin phụ huynh & học sinh</strong><br/>
  Phụ huynh: <b>{parentName}</b><br/>
  Học sinh: <b>{studentName}</b>
</div>
<div style="background:linear-gradient(135deg,#fce4ec 0%,#f8bbd9 100%);border-radius:10px;padding:16px 20px;margin-bottom:16px;border-left:4px solid #e91e63;">
  <strong>💊 Thông tin thuốc</strong><br/>
  Tên thuốc: <b>{medicationName}</b><br/>
  Liều lượng: <b>{dosage}</b><br/>
  Thời gian: <b>{medicationTime}</b>
</div>
<div style="background:#fff3cd;border:1px solid #ffeaa7;border-radius:8px;padding:12px 16px;margin-bottom:16px;">
  <b>⚠️ Lưu ý quan trọng:</b> Vui lòng cung cấp thuốc theo đúng chỉ định và hướng dẫn của nhân viên y tế. Đảm bảo học sinh uống thuốc đúng giờ và đúng liều lượng.
</div>
<div style="text-align:center;margin:24px 0;">
  <a href="{consentUrl}" style="background:linear-gradient(135deg,#ff9800 0%,#f57c00 100%);color:#fff;padding:12px 28px;font-size:16px;border-radius:40px;text-decoration:none;font-weight:600;display:inline-block;">✅ XÁC NHẬN CUNG CẤP THUỐC</a>
</div>
<div style="background:#f8f9fa;border-radius:8px;padding:14px 18px;margin-top:18px;font-size:14px;">
  <b>📞 Thông tin liên hệ hỗ trợ</b><br/>
  Email: medischool@gmail.com<br/>
  Hotline: 19009999<br/>
  Thời gian hỗ trợ: 7:00 - 17:00 (Thứ 2 - Thứ 6)
</div>
`
    }
  }

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

  const handleTemplateChange = template => {
    setEmailTemplate(template)
    if (template && emailTemplates[template]) {
      setSubject(emailTemplates[template].subject)
      setContent(emailTemplates[template].content)
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
        content: content,
        template: emailTemplate
      }

      const response = await api.post('/admin/emails/send', emailData)

      if (response.data.success) {
        message.success(`Gửi email thành công: ${response.data.recipientCount} người nhận`)
        setSelectedUsers([])
        setSubject('')
        setContent('')
        setEmailTemplate('')
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
        {/* Email Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Cấu hình Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-type">Loại Email</Label>
              <Select value={emailType} onValueChange={setEmailType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại email" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Email tùy chỉnh</SelectItem>
                  <SelectItem value="template">Email theo mẫu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {emailType === 'template' && (
              <div className="space-y-2">
                <Label htmlFor="email-template">Mẫu Email</Label>
                <Select value={emailTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mẫu email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vaccination_reminder">Nhắc nhở tiêm chủng</SelectItem>
                    <SelectItem value="health_checkup">Thông báo kiểm tra sức khỏe</SelectItem>
                    <SelectItem value="medication_reminder">Nhắc nhở thuốc</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

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

        {/* User Selection */}
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

      {/* Email Templates Info */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin về Mẫu Email</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Biến có thể sử dụng trong mẫu:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
                <code className="rounded bg-gray-100 px-2 py-1">{'{parentName}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{studentName}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{vaccineName}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{eventDate}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{eventLocation}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{consentUrl}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{medicationName}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{dosage}'}</code>
                <code className="rounded bg-gray-100 px-2 py-1">{'{medicationTime}'}</code>
              </div>
            </div>

            <Separator />

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

      {/* Email Preview Modal */}
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
