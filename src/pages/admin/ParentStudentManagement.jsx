import React, { useState, useEffect, useMemo } from 'react'
import { Modal, Form, message, Select, Space, Tooltip, Dropdown, Menu } from 'antd'
import { DeleteOutlined, UserAddOutlined, MoreOutlined, EditFilled, EditOutlined } from '@ant-design/icons'
import api from '../../utils/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { DataTable } from '../../components/student-table/data-table'

const ParentStudentManagement = () => {
  const [students, setStudents] = useState([])
  const [parentMap, setParentMap] = useState({})
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [parentOptions, setParentOptions] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [form] = Form.useForm()
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  useEffect(() => {
    setLoading(true)
    api
      .get('/students')
      .then(res => {
        setStudents(res.data || [])
        ;(res.data || []).forEach(student => {
          api
            .get(`/students/${student.studentId}/parents`)
            .then(parentRes => {
              setParentMap(prev => ({
                ...prev,
                [student.studentId]: Array.isArray(parentRes.data) ? parentRes.data : []
              }))
            })
            .catch(() => {
              setParentMap(prev => ({ ...prev, [student.studentId]: [] }))
            })
        })
      })
      .catch(() => message.error('Lỗi khi tải danh sách học sinh'))
      .finally(() => setLoading(false))
  }, [])

  const fetchParentOptions = React.useCallback(async () => {
    try {
      const res = await api.get('/admin/users?role=PARENT')
      setParentOptions((res.data || []).map(u => ({ label: `${u.fullName} (${u.phone || u.email})`, value: u.id })))
    } catch {
      setParentOptions([])
    }
  }, [])

  const handleSetParent = React.useCallback(
    student => {
      setSelectedStudent(student)
      setModalVisible(true)
      fetchParentOptions()
      form.resetFields()
    },
    [fetchParentOptions, form]
  )

  const handleAssignParent = async values => {
    setAssigning(true)
    try {
      await api.post('/admin/parent-student-link', {
        parentId: values.parentId,
        studentId: selectedStudent.studentId,
        relationship: values.relationship
      })
      message.success('Đã gán phụ huynh cho học sinh')
      setModalVisible(false)
      api.get(`/students/${selectedStudent.studentId}/parents`).then(parentRes => {
        setParentMap(prev => ({
          ...prev,
          [selectedStudent.studentId]: Array.isArray(parentRes.data) ? parentRes.data : []
        }))
      })
    } catch {
      message.error('Lỗi khi gán phụ huynh')
    } finally {
      setAssigning(false)
    }
  }

  const handleDeleteParent = async (studentId, parentId) => {
    try {
      await api.delete('/admin/parent-student-link', {
        params: {
          studentId,
          parentId
        }
      })
      message.success('Đã xóa quan hệ phụ huynh-học sinh')
      setParentMap(prev => ({
        ...prev,
        [studentId]: (prev[studentId] || []).filter(p => p.parentId !== parentId)
      }))
    } catch {
      message.error('Lỗi khi xóa quan hệ phụ huynh-học sinh')
    }
  }

  const RELATIONSHIP_LABELS = React.useMemo(
    () => ({
      FATHER: 'Bố',
      MOTHER: 'Mẹ',
      GUARDIAN: 'Người giám hộ',
      OTHER: 'Khác'
    }),
    []
  )

  const columns = useMemo(
    () => [
      {
        accessorKey: 'fullName',
        header: 'Học sinh',
        cell: ({ row }) => row.original.fullName,
        size: 160,
        enableSorting: true,
        sortingFn: (a, b) => a.original.fullName.localeCompare(b.original.fullName)
      },
      {
        accessorKey: 'studentCode',
        header: 'Mã',
        cell: ({ row }) => row.original.studentCode,
        size: 80,
        enableSorting: true,
        sortingFn: (a, b) => a.original.studentCode.localeCompare(b.original.studentCode)
      },
      {
        accessorKey: 'classCode',
        header: 'Lớp',
        cell: ({ row }) => row.original.classCode,
        size: 80,
        enableSorting: true,
        sortingFn: (a, b) => a.original.classCode.localeCompare(b.original.classCode)
      },
      {
        accessorKey: 'parentNames',
        header: 'Phụ huynh',
        cell: ({ row }) => {
          const parents = parentMap[row.original.studentId] || []
          return parents.length ? (
            parents.map((p, idx) => (
              <span key={p.parentId} style={{ display: 'inline-block', marginRight: 4 }}>
                {p.fullName}
                {idx < parents.length - 1 ? ' | ' : ''}
              </span>
            ))
          ) : (
            <span className="text-gray-400">Chưa có</span>
          )
        },
        size: 120
      },
      {
        accessorKey: 'parentPhones',
        header: 'SĐT phụ huynh',
        cell: ({ row }) => {
          const parents = parentMap[row.original.studentId] || []
          return parents.length ? (
            parents.map((p, idx) => (
              <span key={p.parentId} style={{ display: 'inline-block', marginRight: 4 }}>
                {p.phone || '-'}
                {idx < parents.length - 1 ? ' | ' : ''}
              </span>
            ))
          ) : (
            <span className="text-gray-400">Chưa có</span>
          )
        },
        size: 120
      },
      {
        accessorKey: 'relationship',
        header: 'Quan hệ',
        cell: ({ row }) => {
          const parents = parentMap[row.original.studentId] || []
          return parents.length ? (
            parents.map((p, idx) => (
              <span key={p.parentId} style={{ display: 'inline-block', marginRight: 4 }}>
                {RELATIONSHIP_LABELS[p.relationship] || p.relationship}
                {idx < parents.length - 1 ? ' | ' : ''}
              </span>
            ))
          ) : (
            <span className="text-gray-400">Chưa có</span>
          )
        },
        size: 100
      },
      {
        id: 'actions',
        header: 'Hành động',
        cell: ({ row }) => {
          const student = row.original
          const parents = parentMap[student.studentId] || []
          const iconButtonStyle = {
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24
          }
          if (!parents.length) {
            return (
              <Tooltip title="Gán phụ huynh">
                <Button size="icon" variant="outline" onClick={() => handleSetParent(student)} style={iconButtonStyle}>
                  <UserAddOutlined />
                </Button>
              </Tooltip>
            )
          }
          return (
            <Dropdown
              menu={{
                items: [
                  ...parents.map(p => ({
                    key: p.parentId,
                    label: (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          minWidth: 180
                        }}
                      >
                        <span>
                          {p.fullName} ({RELATIONSHIP_LABELS[p.relationship] || p.relationship})
                        </span>
                        <DeleteOutlined
                          style={{ color: '#ff4d4f', marginLeft: 12, cursor: 'pointer' }}
                          onClick={e => {
                            e.domEvent?.stopPropagation?.()
                            handleDeleteParent(student.studentId, p.parentId)
                          }}
                        />
                      </span>
                    )
                  })),
                  { type: 'divider' },
                  {
                    key: 'assign',
                    label: (
                      <span
                        style={{ display: 'flex', alignItems: 'center', fontWeight: 500, cursor: 'pointer' }}
                        onClick={() => handleSetParent(student)}
                      >
                        <UserAddOutlined style={{ marginRight: 8 }} /> Thay đổi/Gán phụ huynh
                      </span>
                    )
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button size="icon" variant="outline" style={iconButtonStyle}>
                <EditOutlined />
              </Button>
            </Dropdown>
          )
        },
        size: 120
      }
    ],
    [parentMap, RELATIONSHIP_LABELS, handleSetParent]
  )

  const filteredStudents = useMemo(() => {
    if (!searchText) return students
    return students.filter(
      s =>
        s.fullName.toLowerCase().includes(searchText.toLowerCase()) ||
        s.studentCode.toLowerCase().includes(searchText.toLowerCase()) ||
        s.classCode.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [students, searchText])

  const pagedStudents = filteredStudents.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  )

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Quản lý Phụ huynh - Học sinh</CardTitle>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <DataTable
              columns={columns}
              data={pagedStudents}
              searchText={searchText}
              onSearchChange={setSearchText}
              includeInactive={false}
              onIncludeInactiveChange={undefined}
              onCreateStudent={undefined}
              onImportExcel={undefined}
              loading={loading}
              pagination={pagination}
              setPagination={setPagination}
              totalRows={filteredStudents.length}
            />
          </TooltipProvider>
        </CardContent>
      </Card>

      <Modal
        title={selectedStudent ? `Gán phụ huynh cho ${selectedStudent.fullName}` : 'Gán phụ huynh'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleAssignParent}>
          <Form.Item
            name="parentId"
            label="Chọn phụ huynh"
            rules={[{ required: true, message: 'Vui lòng chọn phụ huynh' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm phụ huynh theo tên hoặc số điện thoại"
              options={parentOptions}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
              loading={parentOptions.length === 0}
            />
          </Form.Item>
          <Form.Item
            name="relationship"
            label="Quan hệ với học sinh"
            rules={[{ required: true, message: 'Vui lòng chọn quan hệ' }]}
          >
            <Select placeholder="Chọn quan hệ">
              <Select.Option value="FATHER">Bố</Select.Option>
              <Select.Option value="MOTHER">Mẹ</Select.Option>
              <Select.Option value="GUARDIAN">Người giám hộ</Select.Option>
              <Select.Option value="OTHER">Khác</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button htmlType="submit" loading={assigning}>
                Lưu
              </Button>
              <Button type="button" variant="outline" onClick={() => setModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ParentStudentManagement
