import { CircleAlert, FileText, Package, Search, User } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input, Table, Tag } from 'antd'
import api from '../../../utils/api'

const Student = () => {
  const [search, setSearch] = useState('')

  const {
    data: students = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await api.get('/students')
      return response.data
    },
    staleTime: 5 * 60 * 1000
  })

  const filteredStudents = students.filter(student => {
    const searchLower = search.toLowerCase()
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.classCode?.toLowerCase().includes(searchLower)
    )
  })

  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length
  const inactiveStudents = students.filter(s => s.status === 'INACTIVE').length

  const columns = [
    {
      title: 'Mã học sinh',
      dataIndex: 'studentCode',
      key: 'studentCode',
      sorter: (a, b) => a.studentCode.localeCompare(b.studentCode),
      render: text => <span className="font-medium">{text}</span>
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: text => <span className="font-medium">{text}</span>
    },
    {
      title: 'Lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      sorter: (a, b) => a.classCode.localeCompare(b.classCode)
    },
    {
      title: 'Khối',
      dataIndex: 'grade',
      key: 'grade',
      sorter: (a, b) => a.grade - b.grade
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      sorter: (a, b) => new Date(a.dateOfBirth) - new Date(b.dateOfBirth),
      render: text => (text ? new Date(text).toLocaleDateString('vi-VN') : 'N/A')
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: gender => <Tag color={gender === 'MALE' ? 'blue' : 'pink'}>{gender === 'MALE' ? 'Nam' : 'Nữ'}</Tag>
    },
    {
      title: 'Số điện thoại khẩn cấp',
      dataIndex: 'emergencyPhone',
      key: 'emergencyPhone',
      render: text => text || 'N/A'
    },
    {
      title: 'Liên hệ khẩn cấp',
      dataIndex: 'emergencyContact',
      key: 'emergencyContact',
      render: text => text || 'N/A'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status === 'ACTIVE' ? 'Hoạt động' : 'Không hoạt động'}</Tag>
      )
    }
  ]

  if (error) {
    return (
      <div className="font-inter p-8">
        <div className="text-center text-red-600">
          <h2 className="mb-2 text-xl font-semibold">Lỗi khi tải dữ liệu</h2>
          <p>{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="font-inter">
      <div className="mb-16 flex max-w-full justify-between">
        <div className="mx-2 flex-1 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3">
              <User size={28} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Tổng số học sinh</h3>
              <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
              <p className="text-sm text-gray-500">toàn trường</p>
            </div>
          </div>
        </div>
        <div className="mx-2 flex-1 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3">
              <FileText size={28} className="text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Học sinh hoạt động</h3>
              <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
              <p className="text-sm text-gray-500">đang học</p>
            </div>
          </div>
        </div>
        <div className="mx-2 flex-1 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-full bg-orange-100 p-3">
              <Package size={28} className="text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Học sinh không hoạt động</h3>
              <p className="text-3xl font-bold text-orange-600">{inactiveStudents}</p>
              <p className="text-sm text-gray-500">đã nghỉ</p>
            </div>
          </div>
        </div>
        <div className="mx-2 flex-1 rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3">
              <CircleAlert size={28} className="text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-700">Sự kiện y tế</h3>
              <p className="text-3xl font-bold text-red-600">4</p>
              <p className="text-sm text-gray-500">tuần này</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-[100px]">
        <div className="mb-6 flex items-center justify-between">
          <Input
            prefix={<Search size={16} className="mr-4 text-gray-400" />}
            placeholder="Tìm kiếm học sinh"
            style={{ width: 300 }}
            className="h-[38px] rounded-[8px] !border-[#d9d9d9]"
            allowClear
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="studentId"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học sinh`,
            pageSizeOptions: ['10', '20', '50', '100']
          }}
          scroll={{ x: 1200 }}
          className="rounded-lg bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

export default Student
