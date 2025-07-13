import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileText, Download, Calendar, Users, User, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import api from '../../utils/api'
import { message } from 'antd'

const PdfExport = () => {
  const [loading, setLoading] = useState(false)
  const [exportType, setExportType] = useState('event')
  const [events, setEvents] = useState([])
  const [students, setStudents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [exportProgress, setExportProgress] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      console.log('Fetching data for PDF export...')

      console.log('Fetching vaccine events...')
      const eventsResponse = await api.get('/vaccine-events')
      console.log('Events response:', eventsResponse.data)
      setEvents(eventsResponse.data)

      console.log('Fetching students...')
      const studentsResponse = await api.get('/admin/students')
      console.log('Students response:', studentsResponse.data)
      setStudents(studentsResponse.data)
    } catch (error) {
      console.error('Error details:', error.response?.data || error.message)
      message.error(`Lỗi khi tải dữ liệu: ${error.response?.data?.message || error.message}`)
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportEventPdf = async () => {
    if (!selectedEvent) {
      message.warning('Vui lòng chọn sự kiện tiêm chủng')
      return
    }

    try {
      setLoading(true)
      setExportProgress({ status: 'Đang tạo PDF...' })
      console.log('Exporting PDF for event:', selectedEvent)

      const response = await api.get(`/vaccination-history/event/${selectedEvent}/pdf`, {
        responseType: 'blob'
      })

      console.log('PDF response received, size:', response.data.size)

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `vaccination-history-event-${selectedEvent}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('Xuất PDF thành công')
      setExportProgress(null)
    } catch (error) {
      console.error('Error exporting PDF:', error.response?.data || error.message)
      message.error(`Lỗi khi xuất PDF: ${error.response?.data?.message || error.message}`)
      setExportProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const handleExportStudentPdf = async () => {
    if (!selectedStudent) {
      message.warning('Vui lòng chọn học sinh')
      return
    }

    try {
      setLoading(true)
      setExportProgress({ status: 'Đang tạo PDF...' })
      console.log('Exporting PDF for student:', selectedStudent)

      const response = await api.get(`/vaccination-history/student/${selectedStudent}/pdf`, {
        responseType: 'blob'
      })

      console.log('PDF response received, size:', response.data.size)

      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `student-vaccination-history-${selectedStudent}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      message.success('Xuất PDF thành công')
      setExportProgress(null)
    } catch (error) {
      console.error('Error exporting PDF:', error.response?.data || error.message)
      message.error(`Lỗi khi xuất PDF: ${error.response?.data?.message || error.message}`)
      setExportProgress(null)
    } finally {
      setLoading(false)
    }
  }

  const getEventStatus = event => {
    const now = new Date()
    const eventDate = new Date(event.eventDate)

    if (eventDate > now) {
      return { status: 'Sắp diễn ra', color: 'bg-yellow-100 text-yellow-800' }
    } else if (eventDate < now && new Date(eventDate.getTime() + 24 * 60 * 60 * 1000) > now) {
      return { status: 'Đang diễn ra', color: 'bg-green-100 text-green-800' }
    } else {
      return { status: 'Đã kết thúc', color: 'bg-gray-100 text-gray-800' }
    }
  }

  const getStudentStatus = student => {
    return student.status === 'ACTIVE' ? (
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

  const formatDate = dateString => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
  }

  const filteredEvents = events.filter(
    event =>
      event.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const filteredStudents = students.filter(
    student =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-6 flex items-center gap-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Xuất PDF</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Cấu hình Xuất PDF
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="export-type">Loại Báo Cáo</Label>
              <Select value={exportType} onValueChange={setExportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại báo cáo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event">Báo cáo theo sự kiện</SelectItem>
                  <SelectItem value="student">Báo cáo theo học sinh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportType === 'event' && (
              <div className="space-y-2">
                <Label htmlFor="event-select">Chọn Sự Kiện</Label>
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn sự kiện tiêm chủng" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map(event => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.eventName} - {formatDate(event.eventDate)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {exportType === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="student-select">Chọn Học Sinh</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học sinh" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.studentId} value={student.studentId.toString()}>
                        {student.fullName} - {student.studentCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4">
              <Button
                onClick={exportType === 'event' ? handleExportEventPdf : handleExportStudentPdf}
                disabled={loading || (exportType === 'event' ? !selectedEvent : !selectedStudent)}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? 'Đang xuất...' : 'Xuất PDF'}
              </Button>
            </div>

            {exportProgress && (
              <div className="mt-4 rounded-lg bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Tiến trình xuất PDF</span>
                </div>
                <div className="text-sm">{exportProgress.status}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {exportType === 'event' ? <Calendar className="h-5 w-5" /> : <User className="h-5 w-5" />}
                {exportType === 'event' ? 'Danh Sách Sự Kiện' : 'Danh Sách Học Sinh'}
              </div>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="h-8 w-8 p-0">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Input
                type="text"
                placeholder={exportType === 'event' ? 'Tìm kiếm sự kiện...' : 'Tìm kiếm học sinh...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-xs"
              />
            </div>
            <div className="max-h-96 space-y-2 overflow-y-auto">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải dữ liệu...</p>
                </div>
              ) : exportType === 'event' ? (
                <>
                  <div className="mb-4 text-sm text-gray-600">Tổng số sự kiện: {filteredEvents.length}</div>
                  {filteredEvents.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-gray-400">
                        <Calendar className="mx-auto h-12 w-12" />
                      </div>
                      <p className="text-gray-500">Không có sự kiện tiêm chủng nào</p>
                      <p className="mt-2 text-sm text-gray-400">
                        Vui lòng tạo sự kiện tiêm chủng trước khi xuất báo cáo
                      </p>
                    </div>
                  ) : (
                    filteredEvents.map(event => {
                      const status = getEventStatus(event)
                      return (
                        <div
                          key={event.id}
                          className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                            selectedEvent === event.id.toString()
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedEvent(event.id.toString())}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium">{event.eventName}</div>
                              <div className="text-sm text-gray-600">
                                {formatDate(event.eventDate)} - {event.location}
                              </div>
                            </div>
                            <Badge className={status.color}>{status.status}</Badge>
                          </div>
                        </div>
                      )
                    })
                  )}
                </>
              ) : (
                <>
                  <div className="mb-4 text-sm text-gray-600">Tổng số học sinh: {filteredStudents.length}</div>
                  {filteredStudents.length === 0 ? (
                    <div className="py-8 text-center">
                      <div className="mb-4 text-gray-400">
                        <User className="mx-auto h-12 w-12" />
                      </div>
                      <p className="text-gray-500">Không có học sinh nào</p>
                      <p className="mt-2 text-sm text-gray-400">Vui lòng thêm học sinh trước khi xuất báo cáo</p>
                    </div>
                  ) : (
                    filteredStudents.map(student => (
                      <div
                        key={student.studentId}
                        className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                          selectedStudent === student.studentId.toString()
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedStudent(student.studentId.toString())}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{student.fullName}</div>
                            <div className="text-sm text-gray-600">
                              {student.studentCode} - {student.classCode}
                            </div>
                          </div>
                          {getStudentStatus(student)}
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin về Xuất PDF</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium">Nội dung báo cáo PDF:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>
                  <div>
                    <strong>Báo cáo theo sự kiện:</strong> Chứa thông tin tất cả học sinh đã tiêm chủng trong một sự
                    kiện cụ thể
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-green-500"></div>
                  <div>
                    <strong>Báo cáo theo học sinh:</strong> Chứa toàn bộ lịch sử tiêm chủng của một học sinh, được nhóm
                    theo danh mục vaccine
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 font-medium">Kiểm tra dữ liệu:</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Đảm bảo có dữ liệu sự kiện tiêm chủng trong database</div>
                <div>• Đảm bảo có dữ liệu học sinh trong database</div>
                <div>• Đảm bảo có dữ liệu lịch sử tiêm chủng trong database</div>
                <div>• Kiểm tra console để xem thông tin debug</div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 font-medium">Thông tin chi tiết trong PDF:</h4>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <h5 className="mb-1 font-medium">Bảng tổng quan:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• History ID (ID lịch sử)</li>
                    <li>• Student ID (Mã học sinh)</li>
                    <li>• Student Name (Tên học sinh)</li>
                    <li>• Vaccine (Tên vaccine)</li>
                    <li>• Dose (Liều số)</li>
                    <li>• Date (Ngày tiêm)</li>
                    <li>• Location (Địa điểm)</li>
                    <li>• Abnormal (Bất thường)</li>
                  </ul>
                </div>
                <div>
                  <h5 className="mb-1 font-medium">Thông tin chi tiết:</h5>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Event ID (ID sự kiện)</li>
                    <li>• Dose Number (Số liều)</li>
                    <li>• Vaccination Date (Ngày tiêm)</li>
                    <li>• Note (Ghi chú)</li>
                    <li>• Follow-up Note (Ghi chú theo dõi)</li>
                    <li>• Created By (Người tạo)</li>
                    <li>• Created At (Thời gian tạo)</li>
                  </ul>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="mb-2 font-medium">Lưu ý:</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• PDF được tạo với font mặc định để đảm bảo tính tương thích</li>
                <li>• Các ký tự tiếng Việt sẽ được chuyển đổi thành ASCII</li>
                <li>• File PDF sẽ được tải xuống tự động</li>
                <li>• Với dữ liệu lớn, quá trình xuất có thể mất vài phút</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PdfExport
