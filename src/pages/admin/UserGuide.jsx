import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BookOpen,
  Mail,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Send,
  Code,
  Shield,
  Zap
} from 'lucide-react'

const UserGuide = () => {
  const [activeTab, setActiveTab] = useState('email-usage')

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-6 flex items-center gap-2">
        <BookOpen className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Hướng Dẫn Sử Dụng</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email-usage" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Gửi Email
          </TabsTrigger>
          <TabsTrigger value="email-setup" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cài Đặt Email
          </TabsTrigger>
          <TabsTrigger value="pdf-export" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Xuất PDF
          </TabsTrigger>
        </TabsList>

        {/* Email Usage Guide */}
        <TabsContent value="email-usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-green-600" />
                Hướng Dẫn Gửi Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Tổng Quan</h3>
                <p className="mb-4 text-gray-600">Hệ thống email đã được tối ưu với các tính năng sau:</p>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span>Gửi email bất đồng bộ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span>Connection pooling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span>Retry mechanism</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span>Batch processing</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Cách Sử Dụng</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium">1. Gửi Email Đơn Lẻ</h4>
                    <p className="mb-2 text-sm text-gray-600">Sử dụng template có sẵn hoặc tạo email tùy chỉnh:</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Chọn loại email: Custom hoặc Template</li>
                      <li>• Chọn mẫu email phù hợp</li>
                      <li>• Nhập tiêu đề và nội dung</li>
                      <li>• Chọn người nhận từ danh sách</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <h4 className="mb-2 font-medium">2. Gửi Email Hàng Loạt</h4>
                    <p className="mb-2 text-sm text-gray-600">Hệ thống hỗ trợ gửi nhiều email cùng lúc:</p>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Chọn nhiều người nhận cùng lúc</li>
                      <li>• Theo dõi tiến trình gửi email</li>
                      <li>• Xem báo cáo thành công/thất bại</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Mẫu Email Có Sẵn</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium">Nhắc Nhở Tiêm Chủng</h4>
                      <p className="mb-2 text-sm text-gray-600">Thông báo lịch tiêm chủng cho phụ huynh</p>
                      <div className="text-xs text-gray-500">
                        Biến:{' '}
                        {
                          (`{parentName}`,
                          `{studentName}`,
                          `{vaccineName}`,
                          `{eventDate}`,
                          `{eventLocation}`,
                          `{consentUrl}`)
                        }
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium">Thông Báo Kiểm Tra Sức Khỏe</h4>
                      <p className="mb-2 text-sm text-gray-600">Thông báo lịch kiểm tra sức khỏe định kỳ</p>
                      <div className="text-xs text-gray-500">
                        Biến: {(`{parentName}`, `{studentName}`, `{eventDate}`, `{eventLocation}`, `{checkupDetails}`)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="mb-2 font-medium">Nhắc Nhở Thuốc</h4>
                      <p className="mb-2 text-sm text-gray-600">Nhắc nhở phụ huynh cung cấp thuốc cho học sinh</p>
                      <div className="text-xs text-gray-500">
                        Biến: {(`{parentName}`, `{studentName}`, `{medicationName}`, `{dosage}`, `{medicationTime}`)}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Hiệu Suất Hệ Thống</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-yellow-50 p-4">
                    <h4 className="mb-2 font-medium">Với 20 emails:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Thời gian gửi: ~10-15 giây</li>
                      <li>• Success rate: &gt;95%</li>
                      <li>• Memory usage: Thấp</li>
                    </ul>
                  </div>
                  <div className="rounded-lg bg-orange-50 p-4">
                    <h4 className="mb-2 font-medium">Với 100 emails:</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Thời gian gửi: ~30-45 giây</li>
                      <li>• Success rate: &gt;90%</li>
                      <li>• Batch processing: 20 batches</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Setup Guide */}
        <TabsContent value="email-setup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-600" />
                Cài Đặt Email SMTP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Cấu Hình Gmail SMTP</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium">Bước 1: Bật Xác Thực 2 Bước</h4>
                    <ol className="space-y-1 text-sm">
                      <li>
                        1. Truy cập{' '}
                        <a
                          href="https://myaccount.google.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Google Account Settings
                        </a>
                      </li>
                      <li>
                        2. Điều hướng đến <strong>Security</strong> → <strong>2-Step Verification</strong>
                      </li>
                      <li>3. Bật 2-Step Verification nếu chưa bật</li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-green-50 p-4">
                    <h4 className="mb-2 font-medium">Bước 2: Tạo App Password</h4>
                    <ol className="space-y-1 text-sm">
                      <li>
                        1. Trong Google Account Settings, vào <strong>Security</strong> →{' '}
                        <strong>2-Step Verification</strong>
                      </li>
                      <li>
                        2. Click vào <strong>App passwords</strong>
                      </li>
                      <li>
                        3. Chọn <strong>Mail</strong> làm app và <strong>Other</strong> làm device
                      </li>
                      <li>
                        4. Click <strong>Generate</strong>
                      </li>
                      <li>
                        5. Copy mật khẩu 16 ký tự (VD: <code>abcd efgh ijkl mnop</code>)
                      </li>
                    </ol>
                  </div>

                  <div className="rounded-lg bg-yellow-50 p-4">
                    <h4 className="mb-2 font-medium">Bước 3: Cấu Hình Ứng Dụng</h4>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Option A: Cấu hình trực tiếp (cho development)</strong>
                      </p>
                      <p className="text-sm">
                        Chỉnh sửa <code>src/main/resources/application.properties</code>:
                      </p>
                      <pre className="overflow-x-auto rounded bg-gray-100 p-2 text-xs">
                        {`spring.mail.username=your-actual-gmail@gmail.com
spring.mail.password=your-16-character-app-password`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Xử Lý Sự Cố</h3>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4">
                    <h4 className="font-medium text-red-700">Authentication Failed (535-5.7.8)</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      <li>• Đảm bảo sử dụng App Password, không phải mật khẩu Gmail thường</li>
                      <li>• Kiểm tra 2-Step Verification đã được bật</li>
                      <li>• Kiểm tra địa chỉ email chính xác</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-yellow-500 pl-4">
                    <h4 className="font-medium text-yellow-700">Connection Timeout</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      <li>• Kiểm tra kết nối internet</li>
                      <li>• Kiểm tra firewall cho phép SMTP traffic trên port 587</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-4">
                    <h4 className="font-medium text-blue-700">"Less secure app access" errors</h4>
                    <ul className="mt-2 space-y-1 text-sm text-gray-600">
                      <li>• Sử dụng App Passwords thay vì bật less secure app access</li>
                      <li>• App Passwords an toàn hơn và được Google khuyến nghị</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Lưu Ý Bảo Mật</h3>
                <div className="rounded-lg bg-red-50 p-4">
                  <ul className="space-y-2 text-sm">
                    <li>
                      • <strong>Không bao giờ</strong> commit thông tin đăng nhập thật vào version control
                    </li>
                    <li>• Sử dụng environment variables trong production</li>
                    <li>• App Passwords chỉ dành cho ứng dụng cụ thể và có thể thu hồi</li>
                    <li>• Mỗi App Password dài 16 ký tự (bỏ khoảng trắng khi copy)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Export Guide */}
        <TabsContent value="pdf-export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-600" />
                Hướng Dẫn Xuất PDF
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-3 text-lg font-semibold">Tổng Quan</h3>
                <p className="mb-4 text-gray-600">
                  Hệ thống hỗ trợ xuất PDF cho các báo cáo lịch sử tiêm chủng sử dụng thư viện iText 7.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Các Loại Báo Cáo PDF</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Báo Cáo Theo Sự Kiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 text-sm text-gray-600">
                        Xuất báo cáo PDF chứa thông tin tất cả học sinh đã tiêm chủng trong một sự kiện cụ thể.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Endpoint:</strong> <code>GET /api/vaccination-history/event/{`{eventId}`}/pdf</code>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>File name:</strong> <code>vaccination-history-event-{`{eventId}`}.pdf</code>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Báo Cáo Theo Học Sinh</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="mb-3 text-sm text-gray-600">
                        Xuất báo cáo PDF chứa toàn bộ lịch sử tiêm chủng của một học sinh, được nhóm theo danh mục
                        vaccine.
                      </p>
                      <div className="text-xs text-gray-500">
                        <strong>Endpoint:</strong> <code>GET /api/vaccination-history/student/{`{studentId}`}/pdf</code>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <strong>File name:</strong> <code>student-vaccination-history-{`{studentId}`}.pdf</code>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Nội Dung PDF</h3>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-2 font-medium">Bảng Tổng Quan</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• History ID (ID lịch sử)</li>
                      <li>• Student ID (Mã học sinh)</li>
                      <li>• Student Name (Tên học sinh)</li>
                      <li>• Vaccine (Tên vaccine)</li>
                      <li>• Dose (Liều số)</li>
                      <li>• Date (Ngày tiêm)</li>
                      <li>• Location (Địa điểm)</li>
                      <li>• Abnormal (Bất thường)</li>
                      <li>• Created (Ngày tạo)</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 font-medium">Thông Tin Chi Tiết</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Event ID (ID sự kiện)</li>
                      <li>• Dose Number (Số liều)</li>
                      <li>• Vaccination Date (Ngày tiêm chủng)</li>
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
                <h3 className="mb-3 text-lg font-semibold">Tính Năng Đặc Biệt</h3>
                <div className="space-y-4">
                  <div className="rounded-lg bg-green-50 p-4">
                    <h4 className="mb-2 font-medium">Hiển Thị Đầy Đủ Thông Tin</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Tất cả các field của VaccinationHistory được hiển thị</li>
                      <li>• Bảng tổng quan cho cái nhìn nhanh</li>
                      <li>• Thông tin chi tiết cho từng record</li>
                      <li>• Định dạng thời gian rõ ràng (dd/MM/yyyy cho ngày, dd/MM/yyyy HH:mm cho datetime)</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-blue-50 p-4">
                    <h4 className="mb-2 font-medium">Xử Lý Ký Tự Đặc Biệt</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• PDF sử dụng font mặc định để tránh lỗi với ký tự tiếng Việt</li>
                      <li>• Các ký tự tiếng Việt được chuyển đổi thành ASCII tương đương</li>
                      <li>• Đảm bảo tính ổn định trên mọi hệ thống</li>
                    </ul>
                  </div>

                  <div className="rounded-lg bg-purple-50 p-4">
                    <h4 className="mb-2 font-medium">Định Dạng Bảng</h4>
                    <ul className="space-y-1 text-sm">
                      <li>• Bảng được tạo với độ rộng tự động điều chỉnh</li>
                      <li>• Header được in đậm</li>
                      <li>• Dữ liệu được căn chỉnh phù hợp</li>
                      <li>• Phân chia rõ ràng giữa bảng tổng quan và chi tiết</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-lg font-semibold">Lưu Ý</h3>
                <div className="rounded-lg bg-yellow-50 p-4">
                  <ul className="space-y-2 text-sm">
                    <li>• Đảm bảo server có đủ bộ nhớ để xử lý các file PDF lớn</li>
                    <li>• Với dữ liệu lớn, có thể cần tối ưu hóa thêm để tránh timeout</li>
                    <li>• PDF sử dụng tiếng Anh để đảm bảo tính tương thích</li>
                    <li>• Các ký tự tiếng Việt trong dữ liệu sẽ được chuyển đổi thành ASCII</li>
                    <li>• Tất cả các field của VaccinationHistory đều được hiển thị đầy đủ</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UserGuide
