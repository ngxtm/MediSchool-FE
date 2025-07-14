import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Code,
  Database,
  Users,
  FileText,
  Mail,
  Shield,
  Zap,
  CheckCircle,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Play,
  Heart,
  Stethoscope,
  Pill
} from 'lucide-react'

const ApiDocumentation = () => {
  const [activeTab, setActiveTab] = useState('authentication')
  const [selectedEndpoint, setSelectedEndpoint] = useState('login')

  const endpoints = {
    authentication: [
      {
        id: 'signin',
        method: 'POST',
        path: '/api/auth/signin',
        description: 'Đăng nhập với email và mật khẩu',
        status: 'active'
      },
      {
        id: 'signup',
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Đăng ký tài khoản mới',
        status: 'active'
      },
      {
        id: 'google-callback',
        method: 'POST',
        path: '/api/auth/google-callback',
        description: 'Xử lý callback từ Google Auth',
        status: 'active'
      },
      {
        id: 'reset-password',
        method: 'POST',
        path: '/api/auth/reset-password',
        description: 'Yêu cầu đặt lại mật khẩu',
        status: 'active'
      },
      {
        id: 'update-password',
        method: 'POST',
        path: '/api/auth/update-password',
        description: 'Cập nhật mật khẩu',
        status: 'active'
      },
      {
        id: 'signout',
        method: 'POST',
        path: '/api/auth/signout',
        description: 'Đăng xuất',
        status: 'active'
      },
      {
        id: 'refresh-token',
        method: 'POST',
        path: '/api/auth/refresh-token',
        description: 'Làm mới token xác thực',
        status: 'active'
      }
    ],
    users: [
      {
        id: 'get-users',
        method: 'GET',
        path: '/api/admin/users',
        description: 'Lấy danh sách người dùng với tìm kiếm',
        status: 'active'
      },
      {
        id: 'create-user',
        method: 'POST',
        path: '/api/admin/users',
        description: 'Tạo người dùng mới',
        status: 'active'
      },
      {
        id: 'update-user',
        method: 'PUT',
        path: '/api/admin/users/{id}',
        description: 'Cập nhật thông tin người dùng',
        status: 'active'
      },
      {
        id: 'soft-delete-user',
        method: 'DELETE',
        path: '/api/admin/users/{id}',
        description: 'Xóa mềm người dùng',
        status: 'active'
      },
      {
        id: 'restore-user',
        method: 'POST',
        path: '/api/admin/users/{id}/restore',
        description: 'Khôi phục người dùng đã xóa mềm',
        status: 'active'
      },
      {
        id: 'hard-delete-user',
        method: 'DELETE',
        path: '/api/admin/users/{id}/hard',
        description: 'Xóa vĩnh viễn người dùng (NGUY HIỂM)',
        status: 'active'
      },
      {
        id: 'check-supabase-status',
        method: 'GET',
        path: '/api/admin/users/{id}/supabase-status',
        description: 'Kiểm tra trạng thái người dùng trong Supabase',
        status: 'active'
      },
      {
        id: 'import-users',
        method: 'POST',
        path: '/api/admin/users/import',
        description: 'Import danh sách người dùng từ Excel',
        status: 'active'
      },
      {
        id: 'export-users',
        method: 'GET',
        path: '/api/admin/users/export',
        description: 'Xuất danh sách người dùng ra Excel',
        status: 'active'
      },
      {
        id: 'download-user-template',
        method: 'GET',
        path: '/api/admin/users/import/template',
        description: 'Tải template Excel cho import người dùng',
        status: 'active'
      }
    ],
    students: [
      {
        id: 'get-students',
        method: 'GET',
        path: '/api/admin/students',
        description: 'Lấy danh sách học sinh với phân trang',
        status: 'active'
      },
      {
        id: 'create-student',
        method: 'POST',
        path: '/api/admin/students',
        description: 'Tạo học sinh mới',
        status: 'active'
      },
      {
        id: 'update-student',
        method: 'PUT',
        path: '/api/admin/students/{id}',
        description: 'Cập nhật thông tin học sinh',
        status: 'active'
      },
      {
        id: 'delete-student',
        method: 'DELETE',
        path: '/api/admin/students/{id}',
        description: 'Xóa học sinh',
        status: 'active'
      },
      {
        id: 'import-students',
        method: 'POST',
        path: '/api/admin/students/import',
        description: 'Import danh sách học sinh từ Excel',
        status: 'active'
      }
    ],
    vaccination: [
      {
        id: 'get-events',
        method: 'GET',
        path: '/api/vaccine-events',
        description: 'Lấy danh sách sự kiện tiêm chủng',
        status: 'active'
      },
      {
        id: 'create-event',
        method: 'POST',
        path: '/api/vaccine-events',
        description: 'Tạo sự kiện tiêm chủng mới',
        status: 'active'
      },
      {
        id: 'get-event-by-id',
        method: 'GET',
        path: '/api/vaccine-events/{id}',
        description: 'Lấy thông tin sự kiện theo ID',
        status: 'active'
      },
      {
        id: 'update-event-status',
        method: 'PUT',
        path: '/api/vaccine-events/{eventId}/status',
        description: 'Cập nhật trạng thái sự kiện',
        status: 'active'
      },
      {
        id: 'get-events-by-year',
        method: 'GET',
        path: '/api/vaccine-events/year/{year}',
        description: 'Lấy sự kiện theo năm',
        status: 'active'
      },
      {
        id: 'get-upcoming-events',
        method: 'GET',
        path: '/api/vaccine-events/upcoming',
        description: 'Lấy sự kiện sắp diễn ra',
        status: 'active'
      },
      {
        id: 'send-consents',
        method: 'POST',
        path: '/api/vaccine-events/{eventId}/send-consents',
        description: 'Gửi thông báo đồng ý tiêm chủng',
        status: 'active'
      },
      {
        id: 'send-email-notifications',
        method: 'POST',
        path: '/api/vaccine-events/{eventId}/send-email-notifications',
        description: 'Gửi thông báo email cho sự kiện tiêm chủng',
        status: 'active'
      },
      {
        id: 'send-selective-emails',
        method: 'POST',
        path: '/api/vaccine-events/{eventId}/send-selective-emails',
        description: 'Gửi email có chọn lọc cho consent cụ thể',
        status: 'active'
      },
      {
        id: 'create-vaccination-history',
        method: 'POST',
        path: '/api/vaccine-events/{eventId}/create-vaccination-history',
        description: 'Tạo lịch sử tiêm chủng cho consent đã đồng ý',
        status: 'active'
      },
      {
        id: 'get-vaccination-history',
        method: 'GET',
        path: '/api/vaccination-history/{historyId}',
        description: 'Lấy lịch sử tiêm chủng theo ID',
        status: 'active'
      },
      {
        id: 'update-vaccination-history',
        method: 'PATCH',
        path: '/api/vaccination-history/{historyId}',
        description: 'Cập nhật lịch sử tiêm chủng',
        status: 'active'
      },
      {
        id: 'bulk-update-history',
        method: 'PATCH',
        path: '/api/vaccination-history/bulk',
        description: 'Cập nhật hàng loạt lịch sử tiêm chủng',
        status: 'active'
      },
      {
        id: 'get-history-by-event',
        method: 'GET',
        path: '/api/vaccination-history/event/{eventId}',
        description: 'Lấy lịch sử tiêm chủng theo sự kiện',
        status: 'active'
      },
      {
        id: 'export-event-pdf',
        method: 'GET',
        path: '/api/vaccination-history/event/{eventId}/pdf',
        description: 'Xuất PDF lịch sử tiêm chủng theo sự kiện',
        status: 'active'
      },
      {
        id: 'get-student-history',
        method: 'GET',
        path: '/api/vaccination-history/student/{studentId}/by-category',
        description: 'Lấy lịch sử tiêm chủng của học sinh theo danh mục',
        status: 'active'
      },
      {
        id: 'export-student-pdf',
        method: 'GET',
        path: '/api/vaccination-history/student/{studentId}/pdf',
        description: 'Xuất PDF lịch sử tiêm chủng theo học sinh',
        status: 'active'
      }
    ],
    email: [
      {
        id: 'send-bulk-emails',
        method: 'POST',
        path: '/api/admin/emails/send',
        description: 'Gửi email hàng loạt cho người dùng được chọn',
        status: 'active'
      },
      {
        id: 'send-single-email',
        method: 'POST',
        path: '/api/admin/emails/send-single',
        description: 'Gửi email đơn lẻ cho một người dùng',
        status: 'active'
      }
    ],
    health: [
      {
        id: 'get-health-events',
        method: 'GET',
        path: '/api/health-events',
        description: 'Lấy danh sách sự kiện y tế',
        status: 'active'
      },
      {
        id: 'create-health-event',
        method: 'POST',
        path: '/api/health-events',
        description: 'Tạo sự kiện y tế mới',
        status: 'active'
      },
      {
        id: 'get-health-event-by-id',
        method: 'GET',
        path: '/api/health-events/{id}',
        description: 'Lấy thông tin sự kiện y tế theo ID',
        status: 'active'
      },
      {
        id: 'send-health-event-emails',
        method: 'POST',
        path: '/api/health-events/{eventId}/send-email-notifications',
        description: 'Gửi thông báo email cho sự kiện y tế',
        status: 'active'
      },
      {
        id: 'send-all-health-emails',
        method: 'POST',
        path: '/api/health-events/send-all-email-notifications',
        description: 'Gửi thông báo email cho tất cả sự kiện y tế',
        status: 'active'
      }
    ],
    checkup: [
      {
        id: 'get-checkup-categories',
        method: 'GET',
        path: '/api/checkup-categories',
        description: 'Lấy danh sách danh mục kiểm tra sức khỏe',
        status: 'active'
      },
      {
        id: 'create-checkup-category',
        method: 'POST',
        path: '/api/checkup-categories',
        description: 'Tạo danh mục kiểm tra sức khỏe mới',
        status: 'active'
      },
      {
        id: 'get-checkup-basic-info',
        method: 'GET',
        path: '/api/checkup-basic-info',
        description: 'Lấy thông tin cơ bản kiểm tra sức khỏe',
        status: 'active'
      },
      {
        id: 'create-checkup-basic-info',
        method: 'POST',
        path: '/api/checkup-basic-info',
        description: 'Tạo thông tin cơ bản kiểm tra sức khỏe',
        status: 'active'
      }
    ],
    medication: [
      {
        id: 'get-medication-requests',
        method: 'GET',
        path: '/api/medication-requests',
        description: 'Lấy danh sách yêu cầu thuốc',
        status: 'active'
      },
      {
        id: 'create-medication-request',
        method: 'POST',
        path: '/api/medication-requests',
        description: 'Tạo yêu cầu thuốc mới',
        status: 'active'
      },
      {
        id: 'update-medication-request',
        method: 'PUT',
        path: '/api/medication-requests/{id}',
        description: 'Cập nhật yêu cầu thuốc',
        status: 'active'
      },
      {
        id: 'delete-medication-request',
        method: 'DELETE',
        path: '/api/medication-requests/{id}',
        description: 'Xóa yêu cầu thuốc',
        status: 'active'
      }
    ]
  }

  const getMethodBadge = method => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return <Badge className={colors[method] || 'bg-gray-100 text-gray-800'}>{method}</Badge>
  }

  const getStatusBadge = status => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        <CheckCircle className="mr-1 h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800">
        <AlertTriangle className="mr-1 h-3 w-3" />
        Deprecated
      </Badge>
    )
  }

  const renderCodeExample = endpoint => {
    const baseUrl = 'https://medischool-be.onrender.com'

    return (
      <div className="space-y-4">
        <div>
          <h4 className="mb-2 font-medium">Request</h4>
          <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
            <div className="mb-2 flex items-center justify-between">
              <span>
                {endpoint.method} {baseUrl}
                {endpoint.path}
              </span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            {endpoint.method === 'POST' && (
              <div className="mt-2">
                <div className="text-gray-400">Content-Type: application/json</div>
                <pre className="mt-2 text-xs">
                  {`{
  "email": "user@example.com",
  "password": "password123"
}`}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-2 font-medium">Response</h4>
          <div className="rounded-lg bg-gray-900 p-4 font-mono text-sm text-green-400">
            <div className="text-gray-400">Status: 200 OK</div>
            <pre className="mt-2 text-xs">
              {`{
  "success": true,
  "data": {
    "id": "123",
    "email": "user@example.com",
    "role": "ADMIN"
  },
  "message": "Login successful"
}`}
            </pre>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="mb-6 flex items-center gap-2">
        <Code className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">API Documentation</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">API Endpoints</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                <TabsList className="flex h-auto w-full flex-col">
                  <TabsTrigger value="authentication" className="flex items-center justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    Authentication
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="students" className="flex items-center justify-start gap-2">
                    <Database className="h-4 w-4" />
                    Students
                  </TabsTrigger>
                  <TabsTrigger value="vaccination" className="flex items-center justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Vaccination
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex items-center justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center justify-start gap-2">
                    <Heart className="h-4 w-4" />
                    Health Events
                  </TabsTrigger>
                  <TabsTrigger value="checkup" className="flex items-center justify-start gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Health Checkup
                  </TabsTrigger>
                  <TabsTrigger value="medication" className="flex items-center justify-start gap-2">
                    <Pill className="h-4 w-4" />
                    Medication
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {Object.entries(endpoints).map(([category, categoryEndpoints]) => (
              <TabsContent key={category} value={category} className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 capitalize">
                      {category === 'authentication' && <Shield className="h-5 w-5" />}
                      {category === 'users' && <Users className="h-5 w-5" />}
                      {category === 'students' && <Database className="h-5 w-5" />}
                      {category === 'vaccination' && <FileText className="h-5 w-5" />}
                      {category === 'email' && <Mail className="h-5 w-5" />}
                      {category === 'health' && <Heart className="h-5 w-5" />}
                      {category === 'checkup' && <Stethoscope className="h-5 w-5" />}
                      {category === 'medication' && <Pill className="h-5 w-5" />}
                      {category.charAt(0).toUpperCase() + category.slice(1)} API
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categoryEndpoints.map(endpoint => (
                        <div
                          key={endpoint.id}
                          className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                            selectedEndpoint === endpoint.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedEndpoint(endpoint.id)}
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getMethodBadge(endpoint.method)}
                              <span className="font-mono text-sm">{endpoint.path}</span>
                            </div>
                            {getStatusBadge(endpoint.status)}
                          </div>
                          <p className="text-sm text-gray-600">{endpoint.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Endpoint Details */}
                {selectedEndpoint && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Play className="h-5 w-5" />
                        Endpoint Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const endpoint = categoryEndpoints.find(e => e.id === selectedEndpoint)
                        if (!endpoint) return null

                        return (
                          <div className="space-y-6">
                            <div>
                              <h3 className="mb-2 text-lg font-semibold">{endpoint.description}</h3>
                              <div className="mb-4 flex items-center gap-2">
                                {getMethodBadge(endpoint.method)}
                                <code className="rounded bg-gray-100 px-2 py-1 text-sm">{endpoint.path}</code>
                              </div>
                            </div>

                            <Separator />

                            {renderCodeExample(endpoint)}

                            <Separator />

                            <div>
                              <h4 className="mb-2 font-medium">Parameters</h4>
                              <div className="space-y-2">
                                {endpoint.method === 'GET' && (
                                  <div className="grid grid-cols-4 gap-2 text-sm">
                                    <div className="font-medium">Name</div>
                                    <div className="font-medium">Type</div>
                                    <div className="font-medium">Required</div>
                                    <div className="font-medium">Description</div>
                                    <div>limit</div>
                                    <div>integer</div>
                                    <div>No</div>
                                    <div>Number of results to return</div>
                                    <div>offset</div>
                                    <div>integer</div>
                                    <div>No</div>
                                    <div>Number of results to skip</div>
                                  </div>
                                )}
                                {endpoint.method === 'POST' && (
                                  <div className="text-sm text-gray-600">
                                    Request body should be sent as JSON with appropriate fields.
                                  </div>
                                )}
                              </div>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="mb-2 font-medium">Response Codes</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-green-100 text-green-800">200</Badge>
                                  <span>Success</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-100 text-red-800">400</Badge>
                                  <span>Bad Request</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-100 text-red-800">401</Badge>
                                  <span>Unauthorized</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-red-100 text-red-800">500</Badge>
                                  <span>Internal Server Error</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* API Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            API Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium">Base URL</h4>
              <code className="rounded bg-gray-100 px-2 py-1 text-sm">https://api.medischool.com</code>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Authentication</h4>
              <p className="text-sm text-gray-600">Bearer Token (JWT)</p>
            </div>
            <div>
              <h4 className="mb-2 font-medium">Rate Limiting</h4>
              <p className="text-sm text-gray-600">100 requests per minute</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ApiDocumentation
