import React from 'react'
import { Modal, Form, Select, Input as AntInput, Space } from 'antd'
import { Button } from '@/components/ui/button'

const USER_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'PARENT', label: 'Parent' }
]

const UserFormModal = ({ isVisible, onClose, onSubmit, isEdit, form, loading = false }) => {
  const handleSubmit = async values => {
    const result = await onSubmit(values)
    if (result?.success) {
      onClose()
    }
  }

  return (
    <Modal title={isEdit ? 'Sửa người dùng' : 'Thêm người dùng mới'} open={isVisible} onCancel={onClose} footer={null}>
      <Form form={form} layout="vertical" onFinish={handleSubmit} disabled={loading}>
        <Form.Item
          name="fullName"
          label="Họ tên"
          rules={[
            { required: true, message: 'Vui lòng nhập họ tên' },
            { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự' }
          ]}
        >
          <AntInput placeholder="Nhập họ tên đầy đủ" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' }
          ]}
        >
          <AntInput placeholder="example@medischool.com" disabled={isEdit} />
        </Form.Item>

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
        >
          <AntInput placeholder="0901234567" />
        </Form.Item>

        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
          <Select placeholder="Chọn vai trò">
            {USER_ROLES.map(role => (
              <Select.Option key={role.value} value={role.value}>
                {role.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <AntInput placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" loading={loading}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserFormModal
