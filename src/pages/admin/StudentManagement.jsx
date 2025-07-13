import React, { useState, useEffect } from 'react'
import { Modal, Form, message, Select, Input as AntInput, Space } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import ImportExcelModal from '@/components/ImportExcelModal'
import { createStudentColumns } from '../../components/student-table'
import { DataTable } from '../../components/student-table/data-table'

const { TextArea } = AntInput

const StudentManagement = () => {
  const [allStudents, setAllStudents] = useState([])
  const [students, setStudents] = useState([])
  const [searchText, setSearchText] = useState('')
  const [includeInactive, setIncludeInactive] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [currentStudent, setCurrentStudent] = useState(null)
  const [form] = Form.useForm()
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const [isImportModalVisible, setIsImportModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      console.log('Fetching all students')
      const response = await api.get('/admin/students')
      console.log('Students response:', response.data)
      console.log(
        'Students with status:',
        response.data.map(s => ({ id: s.studentId, name: s.fullName, status: s.status }))
      )
      const studentsData = Array.isArray(response.data) ? response.data : []
      setAllStudents(studentsData)
    } catch (error) {
      message.error('Lỗi khi tải danh sách học sinh')
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    let filteredStudents = allStudents

    if (!includeInactive) {
      filteredStudents = filteredStudents.filter(student => student.status === 'ACTIVE')
    }

    if (searchText) {
      filteredStudents = filteredStudents.filter(
        student =>
          student.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
          student.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
          student.classCode.toLowerCase().includes(searchText.toLowerCase())
      )
    }

    console.log('Filtered students:', {
      total: allStudents.length,
      filtered: filteredStudents.length,
      includeInactive,
      statusCounts: allStudents.reduce((acc, student) => {
        acc[student.status] = (acc[student.status] || 0) + 1
        return acc
      }, {})
    })

    setStudents(filteredStudents)
  }, [allStudents, searchText, includeInactive])

  const handleSubmit = async values => {
    try {
      const dateOfBirthArray = values.dateOfBirth ? values.dateOfBirth.split('-').map(Number) : [1, 1, 2000]
      const enrollmentDateArray = values.enrollmentDate ? values.enrollmentDate.split('-').map(Number) : [1, 1, 2000]

      const studentData = {
        ...values,
        dateOfBirth: dateOfBirthArray,
        enrollmentDate: enrollmentDateArray
      }

      if (isEdit) {
        await api.put(`/admin/students/${currentStudent.studentId}`, studentData)
        message.success('Cập nhật học sinh thành công')

        try {
          await api.post('/activity-log', {
            actionType: 'UPDATE',
            entityType: 'STUDENT',
            description: `Cập nhật thông tin học sinh`,
            details: `Tên học sinh: ${values.fullName}, Mã: ${values.studentCode}`
          })
        } catch (logErr) {
          console.error('Ghi log hoạt động thất bại:', logErr)
        }
      } else {
        await api.post('/admin/students', studentData)
        message.success('Tạo học sinh thành công')
        try {
          await api.post('/activity-log', {
            actionType: 'CREATE',
            entityType: 'STUDENT',
            description: `Tạo học sinh mới`,
            details: `Tên học sinh: ${values.fullName}, Mã: ${values.studentCode}`
          })
        } catch (logErr) {
          console.error('Ghi log hoạt động thất bại:', logErr)
        }
      }
      setIsModalVisible(false)
      form.resetFields()
      fetchStudents()
    } catch (error) {
      message.error('Lỗi khi lưu học sinh')
      console.error('Error saving student:', error)
    }
  }

  const handleDelete = student => {
    setStudentToDelete(student)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/admin/students/${studentToDelete.studentId}`)
      message.success('Xóa học sinh thành công')
      setIsDeleteModalVisible(false)
      setStudentToDelete(null)
      fetchStudents()
    } catch (error) {
      message.error('Lỗi khi xóa học sinh')
      console.error('Error deleting student:', error)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setStudentToDelete(null)
  }

  const handleEdit = student => {
    setCurrentStudent(student)
    setIsEdit(true)
    const dateOfBirth =
      student.dateOfBirth && student.dateOfBirth.length === 3
        ? `${student.dateOfBirth[0]}-${String(student.dateOfBirth[1]).padStart(2, '0')}-${String(student.dateOfBirth[2]).padStart(2, '0')}`
        : ''
    const enrollmentDate =
      student.enrollmentDate && student.enrollmentDate.length === 3
        ? `${student.enrollmentDate[0]}-${String(student.enrollmentDate[1]).padStart(2, '0')}-${String(student.enrollmentDate[2]).padStart(2, '0')}`
        : ''

    form.setFieldsValue({
      fullName: student.fullName,
      studentCode: student.studentCode,
      classCode: student.classCode,
      dateOfBirth: dateOfBirth,
      gender: student.gender,
      address: student.address,
      enrollmentDate: enrollmentDate,
      emergencyContact: student.emergencyContact,
      emergencyPhone: student.emergencyPhone,
      status: student.status
    })
    setIsModalVisible(true)
  }

  const handleCreate = () => {
    setCurrentStudent(null)
    setIsEdit(false)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleModalClose = () => {
    setIsModalVisible(false)
    form.resetFields()
    setCurrentStudent(null)
    setIsEdit(false)
  }

  const handleImport = async file => {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await api.post('/admin/students/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        message.success(`Import thành công: ${response.data.successCount} học sinh`)
        fetchStudents()
        try {
          await api.post('/activity-log', {
            actionType: 'IMPORT',
            entityType: 'STUDENT',
            description: `Nhập thành công ${response.data.successCount} học sinh từ file Excel`,
            details: `Tên file: ${file.name}`
          })
        } catch (logErr) {
          console.error('Ghi log hoạt động thất bại:', logErr)
        }
      } else {
        message.error('Lỗi khi import file')
      }
    } catch (error) {
      message.error('Lỗi khi import file')
      console.error('Error importing students:', error)
    }
  }

  const columns = createStudentColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quản lý học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <DataTable
              columns={columns}
              data={students}
              searchText={searchText}
              onSearchChange={setSearchText}
              includeInactive={includeInactive}
              onIncludeInactiveChange={setIncludeInactive}
              onCreateStudent={handleCreate}
              onImportExcel={() => setIsImportModalVisible(true)}
              loading={loading}
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      <Modal
        title={isEdit ? 'Chỉnh sửa học sinh' : 'Thêm học sinh mới'}
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}>
            <AntInput />
          </Form.Item>

          <Form.Item
            name="studentCode"
            label="Mã học sinh"
            rules={[{ required: true, message: 'Vui lòng nhập mã học sinh' }]}
          >
            <AntInput />
          </Form.Item>

          <Form.Item name="classCode" label="Lớp" rules={[{ required: true, message: 'Vui lòng nhập lớp' }]}>
            <AntInput />
          </Form.Item>

          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: 'Vui lòng nhập ngày sinh' }]}
          >
            <AntInput type="date" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính" rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}>
            <Select>
              <Select.Option value="MALE">Nam</Select.Option>
              <Select.Option value="FEMALE">Nữ</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}>
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="enrollmentDate"
            label="Ngày nhập học"
            rules={[{ required: true, message: 'Vui lòng nhập ngày nhập học' }]}
          >
            <AntInput type="date" />
          </Form.Item>

          <Form.Item
            name="emergencyContact"
            label="Liên hệ khẩn cấp"
            rules={[{ required: true, message: 'Vui lòng nhập liên hệ khẩn cấp' }]}
          >
            <AntInput />
          </Form.Item>

          <Form.Item
            name="emergencyPhone"
            label="Số điện thoại khẩn cấp"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại khẩn cấp' }]}
          >
            <AntInput />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}>
            <Select>
              <Select.Option value="ACTIVE">Hoạt động</Select.Option>
              <Select.Option value="INACTIVE">Không hoạt động</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="submit">{isEdit ? 'Cập nhật' : 'Tạo mới'}</Button>
              <Button type="button" variant="outline" onClick={handleModalClose}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <ConfirmDialog
        open={isDeleteModalVisible}
        onOpenChange={setIsDeleteModalVisible}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa học sinh "${studentToDelete?.fullName}"?`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmButtonProps={{ variant: 'destructive' }}
      />

      <ImportExcelModal
        isOpen={isImportModalVisible}
        onClose={() => setIsImportModalVisible(false)}
        onImport={handleImport}
        title="Import danh sách học sinh"
      />
    </div>
  )
}

export default StudentManagement
