import { CircleAlert, FileText, Package, Search, User } from 'lucide-react'
import DetailBox from '../../components/DetailBox'
import { useState, useEffect } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { Input, DatePicker, Select, Table, Tag, Space, Button, Dropdown, Menu } from 'antd'
import { Dialog } from 'radix-ui'
import { Zoom, toast } from 'react-toastify'
import api from '../../../../utils/api'
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react'

const StudentCreateDialog = ({ open, onOpenChange, onCreateSuccess }) => {
  const [formData, setFormData] = useState({
    studentCode: '',
    fullName: '',
    classCode: '',
    grade: null,
    dateOfBirth: null,
    address: '',
    gender: '',
    enrollmentDate: null,
    emergencyContact: '',
    emergencyPhone: '',
    status: 'ACTIVE'
  })
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  const toastErrorPopup = message => {
    toast.error(message, {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Zoom
    })
  }

  const toastSuccessPopup = message => {
    toast.success(message, {
      position: 'bottom-center',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: true,
      progress: undefined,
      theme: 'light',
      transition: Zoom
    })
  }

  useEffect(() => {
    let isMounted = true
    const fetchClasses = async () => {
      try {
        const response = await api.get('/classes')
        if (isMounted) setClasses(response.data)
      } catch (error) {
        console.error('Error fetching classes:', error)
        if (isMounted) {
          toastErrorPopup('Lỗi khi tải danh sách lớp: ' + error.message)
        }
      }
    }

    if (open) {
      fetchClasses()
    }

    return () => {
      isMounted = false
    }
  }, [open])

  const createStudentMutation = useMutation({
    mutationFn: newStudent => {
      const studentData = {
        ...newStudent,
        dateOfBirth: newStudent.dateOfBirth
          ? [newStudent.dateOfBirth.year(), newStudent.dateOfBirth.month() + 1, newStudent.dateOfBirth.date()]
          : null,
        enrollmentDate: newStudent.enrollmentDate
          ? [newStudent.enrollmentDate.year(), newStudent.enrollmentDate.month() + 1, newStudent.enrollmentDate.date()]
          : null
      }
      return api.post('/students', studentData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] })
      toastSuccessPopup('Thêm học sinh mới thành công!')
      setFormData({
        studentCode: '',
        fullName: '',
        classCode: '',
        grade: null,
        dateOfBirth: null,
        address: '',
        gender: '',
        enrollmentDate: null,
        emergencyContact: '',
        emergencyPhone: '',
        status: 'ACTIVE'
      })
      if (onCreateSuccess) onCreateSuccess()
    },
    onError: error => {
      toastErrorPopup('Lỗi khi thêm học sinh: ' + error.message)
    }
  })

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.studentCode || !formData.fullName || !formData.classCode || !formData.gender) {
      toastErrorPopup('Vui lòng điền đầy đủ thông tin bắt buộc!')
      return
    }

    setLoading(true)
    createStudentMutation.mutate(formData)
    setLoading(false)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} className="font-inter">
      <Dialog.Trigger asChild>
        <button className="rounded-lg bg-[#023E73] px-7 py-1.5 text-base font-bold text-white transition-all duration-200 ease-in-out hover:scale-105 hover:bg-[#01294d] hover:shadow-lg active:scale-95">
          Thêm học sinh mới
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/60" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-1/2 left-1/2 max-h-[90vh] w-[90vw] max-w-[700px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-md bg-white px-6 py-8 shadow-lg focus:outline-none">
          <Dialog.Title className="m-0 mb-2 text-center text-2xl font-bold text-[#023E73]">
            Thêm học sinh mới
          </Dialog.Title>
          <Dialog.Description className="mb-6 text-center text-[15px] leading-normal text-gray-600">
            Điền thông tin để thêm học sinh mới vào hệ thống
          </Dialog.Description>

          <div className="grid grid-cols-2 gap-4">
            {/* Mã học sinh */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700" htmlFor="studentCode">
                Mã học sinh <span className="text-red-500">*</span>
              </label>
              <input
                className="h-[36px] rounded-md border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="studentCode"
                value={formData.studentCode}
                onChange={e => handleInputChange('studentCode', e.target.value)}
                placeholder="Ví dụ: HS0001"
              />
            </div>

            {/* Họ và tên */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700" htmlFor="fullName">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                className="h-[36px] rounded-md border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="fullName"
                value={formData.fullName}
                onChange={e => handleInputChange('fullName', e.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>

            {/* Lớp */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700">
                Lớp <span className="text-red-500">*</span>
              </label>
              <Select
                className="custom-select"
                placeholder="Chọn lớp"
                value={formData.classCode}
                onChange={value => {
                  handleInputChange('classCode', value)
                  const selectedClass = classes.find(c => c.name === value)
                  if (selectedClass && selectedClass.name) {
                    // Extract grade from class name (e.g., "2.1" -> grade 2)
                    const grade = parseInt(selectedClass.name.split('.')[0])
                    handleInputChange('grade', grade)
                  }
                }}
                options={classes.map(c => {
                  const grade = c.name ? parseInt(c.name.split('.')[0]) : ''
                  return {
                    value: c.name,
                    label: `Lớp ${c.name}${grade ? ` - Khối ${grade}` : ''}`
                  }
                })}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </div>

            {/* Giới tính */}
            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700">
                Giới tính <span className="text-red-500">*</span>
              </label>
              <Select
                className="custom-select"
                placeholder="Chọn giới tính"
                value={formData.gender}
                onChange={value => handleInputChange('gender', value)}
                options={[
                  { value: 'MALE', label: 'Nam' },
                  { value: 'FEMALE', label: 'Nữ' }
                ]}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700">Ngày sinh</label>
              <DatePicker
                className="custom-picker h-[36px]"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                value={formData.dateOfBirth}
                onChange={date => handleInputChange('dateOfBirth', date)}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700">Ngày nhập học</label>
              <DatePicker
                className="custom-picker h-[36px]"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày nhập học"
                value={formData.enrollmentDate}
                onChange={date => handleInputChange('enrollmentDate', date)}
                getPopupContainer={trigger => trigger.parentNode}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700" htmlFor="emergencyContact">
                Người liên hệ khẩn cấp
              </label>
              <input
                className="h-[36px] rounded-md border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={e => handleInputChange('emergencyContact', e.target.value)}
                placeholder="Ví dụ: Bố, Mẹ, ..."
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[14px] font-semibold text-gray-700" htmlFor="emergencyPhone">
                Số điện thoại khẩn cấp
              </label>
              <input
                className="h-[36px] rounded-md border border-gray-300 px-3 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={e => handleInputChange('emergencyPhone', e.target.value)}
                placeholder="0798896743"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <label className="text-[14px] font-semibold text-gray-700" htmlFor="address">
              Địa chỉ
            </label>
            <textarea
              className="min-h-[60px] resize-none rounded-md border border-gray-300 px-3 py-2 text-[14px] leading-none outline-none placeholder:text-[#bfbfbf] focus:border-2 focus:border-[#1676fb]"
              id="address"
              value={formData.address}
              onChange={e => handleInputChange('address', e.target.value)}
              placeholder="Ví dụ: BS16, Vinhomes Grand Park, P. Long Bình, TP. Thủ Đức, TP.HCM"
              rows={3}
            />
          </div>

          <div className="mt-6 flex justify-end gap-4 border-t border-gray-200 pt-4">
            <Dialog.Close asChild>
              <button className="rounded-md bg-gray-100 px-6 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-200">
                Hủy
              </button>
            </Dialog.Close>
            <button
              className="rounded-md bg-[#023E73] px-6 py-2 font-medium text-white transition-colors hover:bg-[#01294d] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSubmit}
              disabled={loading || createStudentMutation.isPending}
            >
              {loading || createStudentMutation.isPending ? 'Đang thêm...' : 'Thêm học sinh'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

const Student = () => {
  const [search, setSearch] = useState('')

  const queryClient = useQueryClient()

  // Fetch students data
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
    staleTime: 5 * 60 * 1000 // 5 minutes
  })

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const searchLower = search.toLowerCase()
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.classCode?.toLowerCase().includes(searchLower)
    )
  })

  // Calculate statistics
  const totalStudents = students.length
  const activeStudents = students.filter(s => s.status === 'ACTIVE').length
  const inactiveStudents = students.filter(s => s.status === 'INACTIVE').length

  // Table columns configuration
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
        <DetailBox title="Tổng số học sinh" icon={<User size={28} />} number={totalStudents} subText={'toàn trường'} />
        <DetailBox
            title="Đang hoạt động"
            icon={<FileText size={28} />}
            number={activeStudents}
            subText={'học sinh'}
        />
        <DetailBox
            title="Không hoạt động"
            icon={<Package size={28} />}
            number={inactiveStudents}
            subText={'học sinh'}
        />
        <DetailBox title="Sự kiện y tế" icon={<CircleAlert size={28} />} number={4} subText={'tuần này'} />
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
