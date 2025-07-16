import React, { useState, useEffect } from 'react'
import { Modal, Form, Select, Input as AntInput, Space } from 'antd'
import { Button } from '@/components/ui/button'
import { successToast, errorToast, pendingToast } from '../ToastPopup'

const USER_ROLES = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'NURSE', label: 'Nurse' },
  { value: 'PARENT', label: 'Parent' }
]

const UserFormModal = ({ isVisible, onClose, onSubmit, isEdit, form, loading = false }) => {
  const [role, setRole] = useState(form.getFieldValue('role') || '')

  useEffect(() => {
    setRole(form.getFieldValue('role') || '')
  }, [form])

  const shouldShowPassword = isEdit === false

  return (
    <Modal
      open={isVisible}
      onCancel={onClose}
      footer={null}
      title={isEdit ? 'Chỉnh sửa người dùng' : 'Tạo người dùng'}
      confirmLoading={loading}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={async values => {
          const toastId = pendingToast('Đang thêm người dùng...')
          try {
            const result = await onSubmit(values)
            if (result?.success) {
              successToast('Thêm người dùng thành công!')
            }
          } catch {
            errorToast('Lỗi khi thêm người dùng!')
          } finally {
            if (toastId) {
              import('react-toastify').then(({ toast }) => toast.dismiss(toastId))
            }
          }
        }}
      >
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

        {shouldShowPassword && (
          <Form.Item name="password" label="Mật khẩu" rules={[{ min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }]}>
            <AntInput.Password placeholder="Nhập mật khẩu (để trống để tự tạo)" />
          </Form.Item>
        )}

        <Form.Item
          name="phone"
          label="Số điện thoại"
          rules={[{ pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ' }]}
        >
          <AntInput placeholder="0901234567" />
        </Form.Item>

        <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}>
          <Select onChange={value => setRole(value)}>
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="MANAGER">Manager</Select.Option>
            <Select.Option value="NURSE">Nurse</Select.Option>
            <Select.Option value="PARENT">Parent</Select.Option>
          </Select>
        </Form.Item>
        {role === 'PARENT' && (
          <>
            <Form.Item
              name="job"
              label="Nghề nghiệp của phụ huynh"
              rules={[{ required: true, message: 'Vui lòng nhập nghề nghiệp' }]}
            >
              <AntInput placeholder="Nhập nghề nghiệp" />
            </Form.Item>
            <Form.Item
              name="jobPlace"
              label="Nơi làm việc của phụ huynh"
              rules={[{ required: true, message: 'Vui lòng nhập nơi làm việc' }]}
            >
              <AntInput placeholder="Nhập nơi làm việc" />
            </Form.Item>
          </>
        )}

        <Form.Item name="address" label="Địa chỉ">
          <AntInput placeholder="Nhập địa chỉ" />
        </Form.Item>

        <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
          <Space>
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" style={{ background: '#000', color: '#fff', border: 'none' }} loading={loading}>
              {isEdit ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default UserFormModal
